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

	"wha-console/config"
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
	cfg       *config.Config
	stopCh    chan struct{}
}

func NewManager(db *gorm.DB, cfg *config.Config) (*Manager, error) {
	if err := os.MkdirAll(logsDir, 0755); err != nil {
		return nil, err
	}
	m := &Manager{
		processes: make(map[uint]*ManagedProcess),
		db:        db,
		cfg:       cfg,
		stopCh:    make(chan struct{}),
	}

	go m.startWaitlistWorker()
	return m, nil
}

func logPath(sessionID uint) string {
	return filepath.Join(logsDir, fmt.Sprintf("%d.log", sessionID))
}

// RunningCount returns the current number of running child processes.
func (m *Manager) RunningCount() int {
	m.mu.Lock()
	defer m.mu.Unlock()
	return len(m.processes)
}

// GetWaitlistCount returns the number of sessions currently queued in the waitlist.
func (m *Manager) GetWaitlistCount() int {
	var count int64
	m.db.Model(&schema.WaitlistEntry{}).Where("status = ?", schema.WaitlistStatusQueued).Count(&count)
	return int(count)
}

// GetLimits retrieves system memory status and process limits.
func (m *Manager) GetLimits() SystemLimits {
	return CalculateLimits(m.cfg, m.RunningCount(), m.GetWaitlistCount())
}

// Start launches the whatsrook binary for a session.
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
	cmd.SysProcAttr = getSysProcAttr()

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

		// Whenever a process stops, try processing the waitlist for available slots
		go m.ProcessWaitlist()
	}()

	return nil
}

// Stop sends SIGTERM to a running process.
func (m *Manager) Stop(sessionID uint) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	mp, ok := m.processes[sessionID]
	if !ok {
		return fmt.Errorf("process not running")
	}

	return mp.Cmd.Process.Signal(syscall.SIGTERM)
}

// IsRunning checks in-memory tracking map.
func (m *Manager) IsRunning(sessionID uint) bool {
	m.mu.Lock()
	defer m.mu.Unlock()
	_, ok := m.processes[sessionID]
	return ok
}

// ShutdownAll gracefully stops every tracked process.
func (m *Manager) ShutdownAll() {
	close(m.stopCh)
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, mp := range m.processes {
		mp.Cmd.Process.Signal(syscall.SIGTERM)
	}
}

// ReconcileOnBoot cleans up stale process states from previous server instances.
func (m *Manager) ReconcileOnBoot() error {
	if err := m.db.Model(&schema.Session{}).
		Where("status = ?", "running").
		Updates(map[string]interface{}{"status": "stopped", "pid": nil}).Error; err != nil {
		return err
	}
	return m.reindexWaitlistPositions()
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

// Logout runs whatsrook in logout mode for a session.
func (m *Manager) Logout(session *schema.Session) error {
	if m.IsRunning(session.ID) {
		if err := m.Stop(session.ID); err != nil {
			return fmt.Errorf("failed to stop process before logout: %w", err)
		}
		deadline := time.Now().Add(10 * time.Second)
		for time.Now().Before(deadline) {
			if !m.IsRunning(session.ID) {
				break
			}
			time.Sleep(200 * time.Millisecond)
		}
	}

	args := []string{
		"-s", session.PhoneNumber,
		"-c", string(session.Client),
		"-db", session.DatabaseURL,
		"-l",
	}
	if session.Verbose {
		args = append(args, "-v")
	}

	cmd := exec.Command("./bin/whatsrook", args...)
	cmd.SysProcAttr = getSysProcAttr()

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("logout process failed: %v (output: %s)", err, string(output))
	}

	return nil
}

// Restart stops a running process and starts it again.
func (m *Manager) Restart(session *schema.Session) error {
	return m.RestartSession(session)
}

func (m *Manager) RestartSession(session *schema.Session) error {
	m.mu.Lock()
	mp, ok := m.processes[session.ID]
	m.mu.Unlock()

	if !ok {
		return fmt.Errorf("process not running")
	}

	if err := mp.Cmd.Process.Signal(syscall.SIGTERM); err != nil {
		return fmt.Errorf("failed to stop process: %w", err)
	}

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

// --- WAITLIST LOGIC ---

// EnqueueWaitlist adds a session to the waitlist queue when server limits are reached.
func (m *Manager) EnqueueWaitlist(sessionID uint, userID string) (*schema.WaitlistEntry, error) {
	var existing schema.WaitlistEntry
	if err := m.db.Where("session_id = ? AND status = ?", sessionID, schema.WaitlistStatusQueued).First(&existing).Error; err == nil {
		return &existing, nil
	}

	var activeCount int64
	m.db.Model(&schema.WaitlistEntry{}).Where("status = ?", schema.WaitlistStatusQueued).Count(&activeCount)

	entry := schema.WaitlistEntry{
		UserID:    userID,
		SessionID: sessionID,
		Position:  int(activeCount) + 1,
		Status:    schema.WaitlistStatusQueued,
		Reason:    ServerLimitReachedMessage,
	}

	if err := m.db.Create(&entry).Error; err != nil {
		return nil, fmt.Errorf("failed to enqueue session in waitlist: %w", err)
	}

	m.db.Model(&schema.Session{}).Where("id = ?", sessionID).Update("status", "queued")
	return &entry, nil
}

// CancelWaitlist removes a session from the waitlist.
func (m *Manager) CancelWaitlist(sessionID uint, userID string) error {
	var entry schema.WaitlistEntry
	if err := m.db.Where("session_id = ? AND user_id = ? AND status = ?", sessionID, userID, schema.WaitlistStatusQueued).First(&entry).Error; err != nil {
		return fmt.Errorf("session not found in waitlist")
	}

	if err := m.db.Model(&entry).Update("status", schema.WaitlistStatusCancelled).Error; err != nil {
		return fmt.Errorf("failed to cancel waitlist entry: %w", err)
	}

	m.db.Model(&schema.Session{}).Where("id = ?", sessionID).Update("status", "stopped")
	return m.reindexWaitlistPositions()
}

// GetWaitlistPosition returns position of a session in queue (or 0 if not queued).
func (m *Manager) GetWaitlistPosition(sessionID uint) int {
	var entry schema.WaitlistEntry
	if err := m.db.Where("session_id = ? AND status = ?", sessionID, schema.WaitlistStatusQueued).First(&entry).Error; err != nil {
		return 0
	}
	return entry.Position
}

// ProcessWaitlist attempts to start the next queued session if limits permit.
func (m *Manager) ProcessWaitlist() {
	m.mu.Lock()
	defer m.mu.Unlock()

	limits := CalculateLimits(m.cfg, len(m.processes), m.GetWaitlistCount())
	if limits.LimitReached {
		return
	}

	var nextEntry schema.WaitlistEntry
	if err := m.db.Where("status = ?", schema.WaitlistStatusQueued).Order("position asc, id asc").First(&nextEntry).Error; err != nil {
		return
	}

	var session schema.Session
	if err := m.db.Where("id = ?", nextEntry.SessionID).First(&session).Error; err != nil {
		m.db.Model(&nextEntry).Update("status", schema.WaitlistStatusCancelled)
		return
	}

	if _, running := m.processes[session.ID]; running {
		m.db.Model(&nextEntry).Update("status", schema.WaitlistStatusRunning)
		return
	}

	logFile, err := os.OpenFile(logPath(session.ID), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		log.Printf("waitlist worker failed to open log file for session %d: %v", session.ID, err)
		return
	}

	args := buildArgs(&session)
	cmd := exec.Command("./bin/whatsrook", args...)
	cmd.Stdout = logFile
	cmd.Stderr = logFile
	cmd.SysProcAttr = getSysProcAttr()

	if err := cmd.Start(); err != nil {
		logFile.Close()
		log.Printf("waitlist worker failed to start process for session %d: %v", session.ID, err)
		return
	}

	pid := cmd.Process.Pid

	m.db.Model(&session).Updates(map[string]interface{}{
		"pid":            pid,
		"status":         "running",
		"has_run_before": true,
	})
	m.db.Model(&nextEntry).Update("status", schema.WaitlistStatusRunning)

	m.processes[session.ID] = &ManagedProcess{Cmd: cmd, LogFile: logFile}

	go func(sID uint, c *exec.Cmd, f *os.File) {
		waitErr := c.Wait()
		m.mu.Lock()
		delete(m.processes, sID)
		m.mu.Unlock()
		f.Close()

		status := "stopped"
		if waitErr != nil {
			status = "crashed"
		}
		m.db.Model(&schema.Session{}).Where("id = ?", sID).Updates(map[string]interface{}{
			"status": status,
			"pid":    nil,
		})
		go m.ProcessWaitlist()
	}(session.ID, cmd, logFile)

	m.reindexWaitlistPositions()
}

func (m *Manager) reindexWaitlistPositions() error {
	var entries []schema.WaitlistEntry
	if err := m.db.Where("status = ?", schema.WaitlistStatusQueued).Order("created_at asc, id asc").Find(&entries).Error; err != nil {
		return err
	}
	for idx, entry := range entries {
		pos := idx + 1
		if entry.Position != pos {
			m.db.Model(&entry).Update("position", pos)
		}
	}
	return nil
}

func (m *Manager) startWaitlistWorker() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-m.stopCh:
			return
		case <-ticker.C:
			m.ProcessWaitlist()
		}
	}
}
