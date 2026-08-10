// auth/handlers.go
package auth

import (
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	"wha-console/config"
	"wha-console/schema"
)

type AuthHandler struct {
	DB     *gorm.DB
	Secret []byte
	Cfg    *config.Config
}

func NewAuthHandler(db *gorm.DB, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		DB:     db,
		Secret: []byte(cfg.JWTSecret),
		Cfg:    cfg,
	}
}

type signupRequest struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Signup(c echo.Context) error {
	var req signupRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}
	if req.Email == "" || req.Username == "" || req.Password == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "email, username, and password are required"})
	}

	hashed, err := HashPassword(req.Password)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to hash password"})
	}

	user := schema.User{
		Email:    req.Email,
		Username: req.Username,
		Password: hashed,
	}
	if err := h.DB.Create(&user).Error; err != nil {
		return c.JSON(http.StatusConflict, map[string]string{"error": "email or username already in use"})
	}

	return h.IssueTokensAndRespond(c, user.ID)
}

func (h *AuthHandler) Login(c echo.Context) error {
	var req loginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	var user schema.User
	if err := h.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid email or password"})
	}

	valid, err := VerifyPassword(req.Password, user.Password)
	if err != nil || !valid {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid email or password"})
	}

	return h.IssueTokensAndRespond(c, user.ID)
}

func (h *AuthHandler) Refresh(c echo.Context) error {
	cookie, err := c.Cookie("refresh_token")
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "missing refresh token"})
	}

	rt, err := ValidateRefreshToken(h.DB, cookie.Value)
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": err.Error()})
	}

	accessToken, err := GenerateAccessToken(rt.UserID, h.Secret)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to issue access token"})
	}

	return c.JSON(http.StatusOK, map[string]string{"access_token": accessToken})
}

func (h *AuthHandler) Logout(c echo.Context) error {
	cookie, err := c.Cookie("refresh_token")
	if err == nil {
		_ = RevokeRefreshToken(h.DB, cookie.Value)
	}

	// Clear the cookie client-side
	c.SetCookie(&http.Cookie{
		Name:     "refresh_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
	})

	return c.JSON(http.StatusOK, map[string]string{"message": "logged out"})
}

// issueTokensAndRespond generates both tokens, sets the refresh token as an
// httpOnly cookie, and returns the access token in the JSON body.
func (h *AuthHandler) IssueTokensAndRespond(c echo.Context, userID uint) error {
	accessToken, err := GenerateAccessToken(userID, h.Secret)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to issue access token"})
	}

	refreshToken, err := IssueRefreshToken(h.DB, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to issue refresh token"})
	}

	c.SetCookie(&http.Cookie{
		Name:     "refresh_token",
		Value:    refreshToken,
		Path:     "/",
		Expires:  time.Now().Add(RefreshTokenTTL),
		HttpOnly: true,
		Secure:   h.Cfg.CookieSecure,
		SameSite: http.SameSiteStrictMode,
	})

	return c.JSON(http.StatusOK, map[string]string{"access_token": accessToken})
}
