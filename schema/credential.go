package schema

import (
	"time"

	"gorm.io/gorm"
)

// Credential stores a single WebAuthn passkey for a user.
// A user can register multiple (phone, laptop, security key, etc).
type Credential struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	UserID          string         `gorm:"index;not null" json:"user_id"`
	CredentialID    []byte         `gorm:"uniqueIndex;not null" json:"-"` // WebAuthn credential ID (raw bytes)
	PublicKey       []byte         `gorm:"not null" json:"-"`             // COSE-encoded public key
	AttestationType string         `json:"attestation_type"`
	Transport       JSON           `gorm:"type:jsonb" json:"transport"` // e.g. ["internal","hybrid"]
	SignCount       uint32         `json:"sign_count"`                  // anti-clone counter
	Nickname        string         `json:"nickname"`                    // user-facing label, e.g. "MacBook Touch ID"
	CreatedAt       time.Time      `json:"created_at"`
	LastUsedAt      *time.Time     `json:"last_used_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}
