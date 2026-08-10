package webauthn

import (
	"crypto/rand"
	"encoding/base64"
	"net/http"
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	"wha-console/auth"
	"wha-console/config"
	"wha-console/schema"
)

type Handler struct {
	DB    *gorm.DB
	WA    *webauthn.WebAuthn
	Store *sessionStore
	Auth  *auth.AuthHandler // reused for issuing access/refresh tokens on login
}

func NewHandler(db *gorm.DB, cfg *config.Config, authHandler *auth.AuthHandler) (*Handler, error) {
	wa, err := webauthn.New(&webauthn.Config{
		RPID:          cfg.WebAuthnRPID,
		RPDisplayName: cfg.WebAuthnRPDisplayName,
		RPOrigins:     cfg.WebAuthnRPOrigins,
	})
	if err != nil {
		return nil, err
	}
	return &Handler{
		DB:    db,
		WA:    wa,
		Store: newSessionStore(cfg.RedisAddr),
		Auth:  authHandler,
	}, nil
}

func randomKey() string {
	b := make([]byte, 16)
	rand.Read(b)
	return base64.RawURLEncoding.EncodeToString(b)
}

func setSessionCookie(c echo.Context, key string) {
	c.SetCookie(&http.Cookie{
		Name: "webauthn_session", Value: key, Path: "/",
		Expires: time.Now().Add(5 * time.Minute), HttpOnly: true,
	})
}

// --- Registration (add a passkey to an already-logged-in account) ---

func (h *Handler) BeginRegistration(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	var user schema.User
	if err := h.DB.Preload("Credentials").First(&user, userID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "user not found"})
	}

	options, sessionData, err := h.WA.BeginRegistration(user)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	key := randomKey()
	if err := h.Store.save(key, sessionData); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to save session"})
	}
	setSessionCookie(c, key)

	return c.JSON(http.StatusOK, options)
}

func (h *Handler) FinishRegistration(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	cookie, err := c.Cookie("webauthn_session")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "missing session"})
	}
	sessionData, ok := h.Store.get(cookie.Value)
	if !ok {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "session expired"})
	}

	var user schema.User
	if err := h.DB.Preload("Credentials").First(&user, userID).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "user not found"})
	}

	credential, err := h.WA.FinishRegistration(user, *sessionData, c.Request())
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	dbCred := schema.Credential{
		UserID:          userID,
		CredentialID:    credential.ID,
		PublicKey:       credential.PublicKey,
		AttestationType: credential.AttestationType,
		SignCount:       credential.Authenticator.SignCount,
	}
	if err := h.DB.Create(&dbCred).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to save credential"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "passkey registered"})
}

type loginRequest struct {
	Username string `json:"username"`
}

func (h *Handler) BeginLogin(c echo.Context) error {
	options, sessionData, err := h.WA.BeginDiscoverableLogin()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	key := randomKey()
	if err := h.Store.save(key, sessionData); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to save session"})
	}
	setSessionCookie(c, key)

	return c.JSON(http.StatusOK, options)
}

func (h *Handler) FinishLogin(c echo.Context) error {
	cookie, err := c.Cookie("webauthn_session")
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "missing session"})
	}
	sessionData, ok := h.Store.get(cookie.Value)
	if !ok {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "session expired"})
	}

	userHandler := func(rawID, userHandle []byte) (webauthn.User, error) {
		var user schema.User
		if err := h.DB.Preload("Credentials").Where("id = ?", string(userHandle)).First(&user).Error; err != nil {
			return nil, err
		}
		return user, nil
	}

	_, credential, err := h.WA.FinishPasskeyLogin(userHandler, *sessionData, c.Request())
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "authentication failed"})
	}

	var dbCred schema.Credential
	if err := h.DB.Where("credential_id = ?", credential.ID).First(&dbCred).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "credential lookup failed"})
	}

	h.DB.Model(&schema.Credential{}).
		Where("id = ?", dbCred.ID).
		Update("sign_count", credential.Authenticator.SignCount)

	return h.Auth.IssueTokensAndRespond(c, dbCred.UserID)
}
