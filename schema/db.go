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

	return db, nil
}
