package schema

import (
	"time"
)

type WaitlistStatus string

const (
	WaitlistStatusQueued    WaitlistStatus = "queued"
	WaitlistStatusRunning   WaitlistStatus = "running"
	WaitlistStatusCancelled WaitlistStatus = "cancelled"
)

type WaitlistEntry struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    string         `gorm:"index;not null" json:"user_id"`
	User      User           `gorm:"foreignKey:UserID" json:"-"`
	SessionID uint           `gorm:"uniqueIndex;not null" json:"session_id"`
	Session   Session        `gorm:"foreignKey:SessionID" json:"-"`
	Position  int            `gorm:"not null;default:1" json:"position"`
	Status    WaitlistStatus `gorm:"index;not null;default:'queued'" json:"status"`
	Reason    string         `gorm:"default:''" json:"reason"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
