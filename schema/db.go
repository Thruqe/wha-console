// schema/db.go
package schema

import (
	"fmt"

	"log"
	"os"
	"time"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type DBConfig struct {
	Driver string // "postgres" or "sqlite"
	DSN    string
}

func NewDB(cfg DBConfig) (*gorm.DB, error) {
	var dialector gorm.Dialector

	switch cfg.Driver {
	case "postgres":
		dialector = postgres.Open(cfg.DSN)
	case "sqlite":
		dialector = sqlite.Open(cfg.DSN)
	default:
		return nil, fmt.Errorf("unsupported driver: %s", cfg.Driver)
	}

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             200 * time.Millisecond,
			LogLevel:                  logger.Warn,
			IgnoreRecordNotFoundError: true,
			Colorful:                  false,
		},
	)

	db, err := gorm.Open(dialector, &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		return nil, err
	}

	if err := db.AutoMigrate(
		&User{},
		&Session{},
		&WaitlistEntry{},
		&RefreshToken{},
		&Credential{},
		&TelemetryEvent{},
		&DailyMetric{},
		&CookiePreference{},
		&APIKey{},
	); err != nil {
		return nil, err
	}

	if err := runMigrations(db); err != nil {
		return nil, err
	}

	return db, nil
}

func runMigrations(db *gorm.DB) error {
	// Backfill auto_restart for existing sessions where it was NULL
	if err := db.Model(&Session{}).Where("auto_restart IS NULL").Update("auto_restart", true).Error; err != nil {
		log.Printf("schema migration note: auto_restart backfill skipped: %v", err)
	}

	// Backfill desired_status for existing sessions where status was 'running'
	if err := db.Model(&Session{}).Where("status = ? AND (desired_status IS NULL OR desired_status = '' OR desired_status = 'stopped')", "running").Update("desired_status", "running").Error; err != nil {
		log.Printf("schema migration note: desired_status backfill skipped: %v", err)
	}

	// Ensure any remaining sessions have a valid default desired_status
	if err := db.Model(&Session{}).Where("desired_status IS NULL OR desired_status = ''").Update("desired_status", "stopped").Error; err != nil {
		log.Printf("schema migration note: desired_status default backfill skipped: %v", err)
	}

	return nil
}
