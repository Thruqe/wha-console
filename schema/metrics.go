// schema/metrics.go
package schema

import (
	"time"

	"gorm.io/gorm"
)

// DailyMetric aggregates time-series usage metrics (e.g. daily active users, process run counts, API calls).
type DailyMetric struct {
	ID          uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	MetricDate  string         `gorm:"index;not null" json:"metric_date"` // YYYY-MM-DD
	Category    string         `gorm:"index;not null" json:"category"`    // e.g. "usage", "process", "auth", "traffic"
	MetricName  string         `gorm:"index;not null" json:"metric_name"` // e.g. "total_logins", "processes_started"
	MetricValue int64          `gorm:"default:0" json:"metric_value"`
	Metadata    string         `gorm:"type:text" json:"metadata,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (m *DailyMetric) BeforeCreate(tx *gorm.DB) error {
	if m.CreatedAt.IsZero() {
		m.CreatedAt = time.Now()
	}
	return nil
}
