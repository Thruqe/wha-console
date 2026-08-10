package schema

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Email        string         `gorm:"uniqueIndex;not null" json:"email"`
	Username     string         `gorm:"uniqueIndex;not null" json:"username"`
	Password     string         `gorm:"not null" json:"-"`
	ProfileColor string         `gorm:"default:'#6366f1'" json:"profile_color"`
	Settings     JSON           `gorm:"type:jsonb" json:"settings"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	RefreshTokens []RefreshToken `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Credentials   []Credential   `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
	Sessions      []Session      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"sessions,omitempty"`
}
