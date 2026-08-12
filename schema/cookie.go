// schema/cookie.go
package schema

import (
	"time"

	"gorm.io/gorm"
)

// CookiePreference tracks cookie consent choices, categories, and telemetry consent state for compliance and study.
type CookiePreference struct {
	ID               uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	ConsentID        string         `gorm:"uniqueIndex;not null" json:"consent_id"`
	UserID           string         `gorm:"index" json:"user_id,omitempty"`
	Essential        bool           `gorm:"default:true;not null" json:"essential"` // Strictly necessary session cookies
	Analytics        bool           `gorm:"default:false;not null" json:"analytics"` // Telemetry and usage statistics
	Functional       bool           `gorm:"default:false;not null" json:"functional"` // Preference retention
	Marketing        bool           `gorm:"default:false;not null" json:"marketing"`
	IPAddress        string         `json:"ip_address,omitempty"`
	UserAgent        string         `json:"user_agent,omitempty"`
	ConsentTimestamp time.Time      `json:"consent_timestamp"`
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`
}

func (c *CookiePreference) BeforeCreate(tx *gorm.DB) error {
	if c.CreatedAt.IsZero() {
		c.CreatedAt = time.Now()
	}
	if c.ConsentTimestamp.IsZero() {
		c.ConsentTimestamp = time.Now()
	}
	return nil
}
