package schema

import (
	"path/filepath"
	"testing"
)

func TestAutoMigrateAndRunMigrations(t *testing.T) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test_migrate.db")

	db, err := NewDB(DBConfig{
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

	// Create user
	user := User{
		ID:       "user-123",
		Username: "tester",
		Email:    "tester@example.com",
		Password: "hashedpassword",
	}
	if err := db.Create(&user).Error; err != nil {
		t.Fatalf("failed to create user: %v", err)
	}

	// Create a session
	session := Session{
		UserID:        user.ID,
		Name:          "session-1",
		PhoneNumber:   "+1234567890",
		AuthType:      AuthTypeQR,
		Client:        ClientChrome,
		DatabaseURL:   "sqlite://session.db",
		Status:        "running",
		DesiredStatus: "running",
		AutoRestart:   true,
	}
	if err := db.Create(&session).Error; err != nil {
		t.Fatalf("failed to create session: %v", err)
	}

	// Simulate old schema row by updating status to running and desired_status to empty
	if err := db.Model(&session).Updates(map[string]interface{}{
		"desired_status": "",
	}).Error; err != nil {
		t.Fatalf("failed to modify session: %v", err)
	}

	// Run migration helper again
	if err := runMigrations(db); err != nil {
		t.Fatalf("runMigrations failed: %v", err)
	}

	var updatedSession Session
	if err := db.First(&updatedSession, session.ID).Error; err != nil {
		t.Fatalf("failed to fetch updated session: %v", err)
	}

	if updatedSession.DesiredStatus != "running" {
		t.Errorf("expected DesiredStatus 'running', got %q", updatedSession.DesiredStatus)
	}
	if !updatedSession.AutoRestart {
		t.Errorf("expected AutoRestart to be true")
	}
}
