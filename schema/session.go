package schema

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// JSON is a portable JSON column type that works on both Postgres and SQLite.
type JSON map[string]any

func (j JSON) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

func (j *JSON) Scan(value any) error {
	if value == nil {
		*j = JSON{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		if s, ok := value.(string); ok {
			bytes = []byte(s)
		} else {
			return errors.New("failed to scan JSON value")
		}
	}
	return json.Unmarshal(bytes, j)
}

type Session struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UserID     uint           `gorm:"index;not null" json:"user_id"`
	User       User           `gorm:"foreignKey:UserID" json:"-"` // back-reference, avoid serializing to prevent cycles
	Name       string         `gorm:"not null" json:"name"`
	Status     string         `gorm:"index;not null;default:'stopped'" json:"status"`
	Settings   JSON           `gorm:"type:jsonb" json:"settings"`
	Activities JSON           `gorm:"type:jsonb" json:"activities"`
	CreatedAt  time.Time      `json:"creation"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}
