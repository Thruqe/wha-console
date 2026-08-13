package process

import (
	"path/filepath"
	"testing"

	"wha-console/config"
	"wha-console/schema"
)

func TestReconcileAndRecoverOnBoot(t *testing.T) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test_process.db")
	db, err := schema.NewDB(schema.DBConfig{
		Driver: "sqlite",
		DSN:    dbPath,
	})
	if err != nil {
		t.Fatalf("failed to initialize db: %v", err)
	}
	sqlDB, err := db.DB()
	if err == nil {
		defer sqlDB.Close()
	}

	user := schema.User{
		ID:       "user-456",
		Username: "procuser",
		Email:    "procuser@example.com",
		Password: "hashedpassword",
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	dummyPID := 99999

	// 1. A session that was running and has AutoRestart = true
	sessionRunning := schema.Session{
		UserID:        user.ID,
		Name:          "sess-running",
		PhoneNumber:   "+1111111111",
		AuthType:      schema.AuthTypeQR,
		Client:        schema.ClientChrome,
		DatabaseURL:   "sqlite://sess1.db",
		Status:        "running",
		DesiredStatus: "running",
		AutoRestart:   true,
		PID:           &dummyPID,
	}
	db.Create(&sessionRunning)

	// 2. A session that was stopped and has AutoRestart = true
	sessionStopped := schema.Session{
		UserID:        user.ID,
		Name:          "sess-stopped",
		PhoneNumber:   "+2222222222",
		AuthType:      schema.AuthTypeQR,
		Client:        schema.ClientChrome,
		DatabaseURL:   "sqlite://sess2.db",
		Status:        "stopped",
		DesiredStatus: "stopped",
		AutoRestart:   true,
	}
	db.Create(&sessionStopped)

	// 3. A session that was running but AutoRestart = false
	sessionNoAuto := schema.Session{
		UserID:        user.ID,
		Name:          "sess-noauto",
		PhoneNumber:   "+3333333333",
		AuthType:      schema.AuthTypeQR,
		Client:        schema.ClientChrome,
		DatabaseURL:   "sqlite://sess3.db",
		Status:        "running",
		DesiredStatus: "running",
		AutoRestart:   false,
		PID:           &dummyPID,
	}
	db.Select("*").Create(&sessionNoAuto)

	cfg := &config.Config{
		RAMPerProcessMB: 150,
		MaxRAMPercent:   80.0,
		MaxProcesses:    1,
	}

	mgr, err := NewManager(db, cfg)
	if err != nil {
		t.Fatalf("failed to create manager: %v", err)
	}
	defer mgr.ShutdownAll()

	// Reconcile and recover
	if err := mgr.ReconcileAndRecoverOnBoot(); err != nil {
		t.Fatalf("ReconcileAndRecoverOnBoot failed: %v", err)
	}

	// Verify sessionNoAuto PID is cleared and status is stopped
	var checkNoAuto schema.Session
	db.First(&checkNoAuto, sessionNoAuto.ID)
	if checkNoAuto.PID != nil {
		t.Errorf("expected PID to be nil for sessionNoAuto, got %v", *checkNoAuto.PID)
	}
	if checkNoAuto.Status != "stopped" {
		t.Errorf("expected status 'stopped' for sessionNoAuto, got %s", checkNoAuto.Status)
	}

	// Verify sessionStopped is still stopped
	var checkStopped schema.Session
	db.First(&checkStopped, sessionStopped.ID)
	if checkStopped.Status != "stopped" {
		t.Errorf("expected status 'stopped' for sessionStopped, got %s", checkStopped.Status)
	}

	// Verify sessionRunning had its PID reset
	var checkRunning schema.Session
	db.First(&checkRunning, sessionRunning.ID)
	if checkRunning.PID != nil && *checkRunning.PID == dummyPID {
		t.Errorf("expected old dummy PID to be cleared")
	}
}

func TestReconcileAndRecoverOnBoot_WaitlistOnLimit(t *testing.T) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test_waitlist_limit.db")
	db, err := schema.NewDB(schema.DBConfig{
		Driver: "sqlite",
		DSN:    dbPath,
	})
	if err != nil {
		t.Fatalf("failed to initialize db: %v", err)
	}
	sqlDB, err := db.DB()
	if err == nil {
		defer sqlDB.Close()
	}

	user := schema.User{
		ID:       "user-789",
		Username: "limituser",
		Email:    "limituser@example.com",
		Password: "hashedpassword",
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	// Create session that should run
	session := schema.Session{
		UserID:        user.ID,
		Name:          "sess-limited",
		PhoneNumber:   "+4444444444",
		AuthType:      schema.AuthTypeQR,
		Client:        schema.ClientChrome,
		DatabaseURL:   "sqlite://sesslimit.db",
		Status:        "running",
		DesiredStatus: "running",
		AutoRestart:   true,
	}
	db.Create(&session)

	// Config with 0 max processes so LimitReached is always true
	cfg := &config.Config{
		RAMPerProcessMB: 9999999,
		MaxRAMPercent:   1.0,
		MaxProcesses:    0,
	}

	mgr, err := NewManager(db, cfg)
	if err != nil {
		t.Fatalf("failed to create manager: %v", err)
	}
	defer mgr.ShutdownAll()

	if err := mgr.ReconcileAndRecoverOnBoot(); err != nil {
		t.Fatalf("ReconcileAndRecoverOnBoot failed: %v", err)
	}

	// Should be enqueued in waitlist
	pos := mgr.GetWaitlistPosition(session.ID)
	if pos != 1 {
		t.Errorf("expected waitlist position 1, got %d", pos)
	}

	var checkSession schema.Session
	db.First(&checkSession, session.ID)
	if checkSession.Status != "queued" {
		t.Errorf("expected session status 'queued', got %q", checkSession.Status)
	}
}
