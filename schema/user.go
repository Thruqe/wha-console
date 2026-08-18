package schema

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           string         `gorm:"primaryKey" json:"id"`
	GitHubID     string         `gorm:"column:github_id;uniqueIndex;not null" json:"github_id"`
	Email        string         `gorm:"index" json:"email"`
	Username     string         `gorm:"not null" json:"username"`
	AvatarURL    string         `gorm:"column:avatar_url" json:"avatar_url"`
	ProfileColor string         `gorm:"default:'#6366f1'" json:"profile_color"`
	Settings     JSON           `gorm:"type:text" json:"settings"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	Sessions      []Session      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"sessions,omitempty"`
	RefreshTokens []RefreshToken `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

// BeforeCreate generates the ID if not already set — runs automatically via GORM hooks.
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		id, err := GenerateUserID()
		if err != nil {
			return err
		}
		u.ID = id
	}
	return nil
}
