// schema/telemetry.go
package schema

import (
	"time"

	"gorm.io/gorm"
)

// TelemetryEvent tracks user interactions, system events, and page usage for analytics.
type TelemetryEvent struct {
	ID           uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	UserID       string         `gorm:"index" json:"user_id,omitempty"`
	ConsentID    string         `gorm:"index" json:"consent_id,omitempty"`
	EventType    string         `gorm:"index;not null" json:"event_type"` // e.g. "page_view", "process_start", "process_stop", "auth_login"
	EventName    string         `gorm:"not null" json:"event_name"`
	PageURL      string         `json:"page_url,omitempty"`
	UserAgent    string         `json:"user_agent,omitempty"`
	IPAddress    string         `json:"ip_address,omitempty"`
	Metadata     string         `gorm:"type:text" json:"metadata,omitempty"` // JSON payload string
	ConsentLevel string         `gorm:"default:'essential'" json:"consent_level"`
	CreatedAt    time.Time      `gorm:"index" json:"created_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (t *TelemetryEvent) BeforeCreate(tx *gorm.DB) error {
	if t.CreatedAt.IsZero() {
		t.CreatedAt = time.Now()
	}
	return nil
}
