package auth

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"

	"wha-console/schema"
)

const (
	AccessTokenTTL  = 15 * time.Minute
	RefreshTokenTTL = 30 * 24 * time.Hour
)

// AccessClaims is embedded in the JWT payload.
type AccessClaims struct {
	UserID string `json:"user_id"`
	jwt.RegisteredClaims
}

// GenerateAccessToken issues a short-lived, stateless JWT.
func GenerateAccessToken(userID string, secret []byte) (string, error) {
	claims := AccessClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(AccessTokenTTL)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(secret)
}

// ParseAccessToken validates a JWT and returns its claims.
func ParseAccessToken(tokenString string, secret []byte) (*AccessClaims, error) {
	claims := &AccessClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return secret, nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("invalid or expired token")
	}
	return claims, nil
}

// generateOpaqueToken creates a cryptographically random string for refresh tokens.
func generateOpaqueToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

// IssueRefreshToken creates a new refresh token row in the DB and returns the raw token.
func IssueRefreshToken(db *gorm.DB, userID string) (string, error) {
	raw, err := generateOpaqueToken()
	if err != nil {
		return "", err
	}

	rt := schema.RefreshToken{
		UserID:    userID,
		Token:     raw,
		ExpiresAt: time.Now().Add(RefreshTokenTTL),
	}
	if err := db.Create(&rt).Error; err != nil {
		return "", err
	}

	return raw, nil
}

// ValidateRefreshToken checks a raw refresh token against the DB — must exist,
// not be revoked, and not be expired.
func ValidateRefreshToken(db *gorm.DB, raw string) (*schema.RefreshToken, error) {
	var rt schema.RefreshToken
	err := db.Where("token = ? AND revoked = ?", raw, false).First(&rt).Error
	if err != nil {
		return nil, errors.New("invalid refresh token")
	}
	if time.Now().After(rt.ExpiresAt) {
		return nil, errors.New("refresh token expired")
	}
	return &rt, nil
}

// RevokeRefreshToken marks a token as revoked (used on logout).
func RevokeRefreshToken(db *gorm.DB, raw string) error {
	return db.Model(&schema.RefreshToken{}).
		Where("token = ?", raw).
		Update("revoked", true).Error
}
