// process/manager.go
package process

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"syscall"
	"time"

	"gorm.io/gorm"

	"wha-console/schema"
)

const logsDir = "logs"

type ManagedProcess struct {
	Cmd     *exec.Cmd
	LogFile *os.File
}

type Manager struct {
	mu        sync.Mutex
	processes map[uint]*ManagedProcess
	db        *gorm.DB
}

func NewManager(db *gorm.DB) (*Manager, error) {
	if err := os.MkdirAll(logsDir, 0755); err != nil {
		return nil, err
	}
	return &Manager{
		processes: make(map[uint]*ManagedProcess),
		db:        db,
	}, nil
}

func logPath(sessionID uint) string {
	return filepath.Join(logsDir, fmt.Sprintf("%d.log", sessionID))
}

// Start launches the whatsrook binary for a session. The child is placed in
// its own process group with Pdeathsig set, so if this Go server dies for
// any reason, the OS kernel kills the child immediately — no orphans.
func (m *Manager) Start(session *schema.Session) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	if _, running := m.processes[session.ID]; running {
		return fmt.Errorf("process already running")
	}

	logFile, err := os.OpenFile(logPath(session.ID), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return fmt.Errorf("failed to open log file: %w", err)
	}

	args := buildArgs(session)
	cmd := exec.Command("./bin/whatsrook", args...)
	cmd.Stdout = logFile
	cmd.Stderr = logFile
	cmd.SysProcAttr = &syscall.SysProcAttr{
		Pdeathsig: syscall.SIGKILL,
	}

	if err := cmd.Start(); err != nil {
		logFile.Close()
		return fmt.Errorf("failed to start process: %w", err)
	}

	pid := cmd.Process.Pid

	if err := m.db.Model(session).Updates(map[string]interface{}{
		"pid":            pid,
		"status":         "running",
		"has_run_before": true,
	}).Error; err != nil {
		cmd.Process.Kill()
		logFile.Close()
		return fmt.Errorf("started process but failed to record status: %w", err)
	}

	m.processes[session.ID] = &ManagedProcess{Cmd: cmd, LogFile: logFile}

	go func() {
		waitErr := cmd.Wait()

		m.mu.Lock()
		delete(m.processes, session.ID)
		m.mu.Unlock()
		logFile.Close()

		status := "stopped"
		if waitErr != nil {
			status = "crashed"
		}

		if err := m.db.Model(&schema.Session{}).Where("id = ?", session.ID).Updates(map[string]interface{}{
			"status": status,
			"pid":    nil,
		}).Error; err != nil {
			log.Printf("failed to update session %d status after exit: %v", session.ID, err)
		}
	}()

	return nil
}

// Stop sends SIGTERM to a running process, letting it shut down gracefully.
func (m *Manager) Stop(sessionID uint) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	mp, ok := m.processes[sessionID]
	if !ok {
		return fmt.Errorf("process not running")
	}

	return mp.Cmd.Process.Signal(syscall.SIGTERM)
}

// IsRunning checks the in-memory tracking map — the source of truth while the server is up.
func (m *Manager) IsRunning(sessionID uint) bool {
	m.mu.Lock()
	defer m.mu.Unlock()
	_, ok := m.processes[sessionID]
	return ok
}

// ShutdownAll gracefully stops every tracked process — call this on server shutdown.
func (m *Manager) ShutdownAll() {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, mp := range m.processes {
		mp.Cmd.Process.Signal(syscall.SIGTERM)
	}
}

// ReconcileOnBoot marks any session left as "running" from a previous server
// instance as stopped — since Pdeathsig guarantees no child survives this
// server dying, any "running" row at boot is necessarily stale.
func (m *Manager) ReconcileOnBoot() error {
	return m.db.Model(&schema.Session{}).
		Where("status = ?", "running").
		Updates(map[string]interface{}{"status": "stopped", "pid": nil}).Error
}

func buildArgs(s *schema.Session) []string {
	args := []string{
		"-s", s.PhoneNumber,
		"-c", string(s.Client),
		"-db", s.DatabaseURL,
	}
	if s.AuthType == schema.AuthTypePair {
		args = append(args, "-p")
	} else {
		args = append(args, "-q")
	}
	if s.Verbose {
		args = append(args, "-v")
	}
	if s.NoSkipOld {
		args = append(args, "--no-skip-old")
	}
	return args
}

// Logout runs the whatsrook binary in logout mode for a session — this removes
// the session's auth files, distinct from just deleting our DB record.
// process/manager.go — update Logout
func (m *Manager) Logout(session *schema.Session) error {
	if m.IsRunning(session.ID) {
		if err := m.Stop(session.ID); err != nil {
			return fmt.Errorf("failed to stop process before logout: %w", err)
		}
		// give the process a moment to actually exit before running logout
		time.Sleep(10 * time.Second)
	}

	cmd := exec.Command("./bin/whatsrook", "-s", session.PhoneNumber, "-l")
	cmd.SysProcAttr = &syscall.SysProcAttr{
		Pdeathsig: syscall.SIGKILL,
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("logout failed: %s", string(output))
	}

	return nil
}

// Restart stops a running process and starts it again with current session
// settings — used when behavior settings (verbose, no_skip_old) change,
// since these are CLI flags baked in at launch, not hot-reloadable.
func (m *Manager) Restart(session *schema.Session) error {
	m.mu.Lock()
	mp, ok := m.processes[session.ID]
	m.mu.Unlock()

	if !ok {
		return fmt.Errorf("process not running")
	}

	// Signal graceful stop and wait for the existing Wait() goroutine to clean up.
	if err := mp.Cmd.Process.Signal(syscall.SIGTERM); err != nil {
		return fmt.Errorf("failed to stop process: %w", err)
	}

	// Poll until the manager's map no longer holds this session (set by the
	// Wait() goroutine once the process actually exits), with a timeout.
	deadline := time.Now().Add(10 * time.Second)
	for time.Now().Before(deadline) {
		m.mu.Lock()
		_, stillRunning := m.processes[session.ID]
		m.mu.Unlock()
		if !stillRunning {
			break
		}
		time.Sleep(200 * time.Millisecond)
	}

	m.mu.Lock()
	_, stillRunning := m.processes[session.ID]
	m.mu.Unlock()
	if stillRunning {
		return fmt.Errorf("process did not stop in time for restart")
	}

	return m.Start(session)
}
