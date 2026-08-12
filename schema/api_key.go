// schema/api_key.go
package schema

import (
	"crypto/rand"
	"encoding/hex"
	"time"

	"gorm.io/gorm"
)

type APIKey struct {
	ID         uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	Key        string         `gorm:"uniqueIndex;not null" json:"key"` // e.g. "wha_live_..."
	Name       string         `gorm:"not null" json:"name"`
	UserID     string         `gorm:"index;not null" json:"user_id"`
	LastUsedAt *time.Time     `json:"last_used_at,omitempty"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

func GenerateAPIKey() (string, error) {
	b := make([]byte, 24)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return "wha_live_" + hex.EncodeToString(b), nil
}

func (k *APIKey) BeforeCreate(tx *gorm.DB) error {
	if k.Key == "" {
		key, err := GenerateAPIKey()
		if err != nil {
			return err
		}
		k.Key = key
	}
	if k.CreatedAt.IsZero() {
		k.CreatedAt = time.Now()
	}
	return nil
}
