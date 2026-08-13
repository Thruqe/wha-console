package schema

import (
	"time"

	"gorm.io/gorm"
)

type AuthType string

const (
	AuthTypePair AuthType = "pair"
	AuthTypeQR   AuthType = "qr"
)

type ClientType string

const (
	ClientChrome  ClientType = "chrome"
	ClientAndroid ClientType = "android"
	ClientIOS     ClientType = "ios"
)

type Session struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	UserID string `gorm:"index;not null;uniqueIndex:idx_user_session_name" json:"user_id"`
	User   User   `gorm:"foreignKey:UserID" json:"-"`

	Name        string     `gorm:"not null;uniqueIndex:idx_user_session_name" json:"name"`
	PhoneNumber string     `gorm:"not null" json:"-"` // never serialized wholesale — expose last 4 via a method
	AuthType    AuthType   `gorm:"not null" json:"auth_type"`
	Client      ClientType `gorm:"not null" json:"client"`
	DatabaseURL string     `gorm:"not null" json:"-"` // sensitive — never serialize

	Status string `gorm:"index;not null;default:'stopped'" json:"status"` // running, stopped, crashed

	DesiredStatus string `gorm:"index;not null;default:'stopped'" json:"desired_status"` // running, stopped
	AutoRestart   bool   `gorm:"default:true" json:"auto_restart"`

	Verbose   bool `gorm:"default:false" json:"verbose"`
	NoSkipOld bool `gorm:"default:false" json:"no_skip_old"`

	Settings   JSON `gorm:"type:jsonb" json:"settings"`
	Activities JSON `gorm:"type:jsonb" json:"activities"`

	PID *int `json:"-" gorm:"column:pid"`

	HasRunBefore bool `gorm:"default:false" json:"-"`

	CreatedAt time.Time      `json:"creation"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// PhoneNumberMasked returns only the last 4 digits, safe for the dashboard card.
func (s Session) PhoneNumberMasked() string {
	if len(s.PhoneNumber) < 4 {
		return "••••"
	}
	return "•••• " + s.PhoneNumber[len(s.PhoneNumber)-4:]
}
