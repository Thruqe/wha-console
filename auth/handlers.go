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
	Username string `json:"username"`
	Password string `json:"password"`
}

type updateProfileRequest struct {
	Email       string `json:"email"`
	Username    string `json:"username"`
	NewPassword string `json:"new_password"`
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

	identifier := req.Email
	if identifier == "" {
		identifier = req.Username
	}
	if identifier == "" || req.Password == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "email or username and password are required"})
	}

	var user schema.User
	if err := h.DB.Where("email = ? OR username = ?", identifier, identifier).First(&user).Error; err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid email/username or password"})
	}

	valid, err := VerifyPassword(req.Password, user.Password)
	if err != nil || !valid {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid email/username or password"})
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

func (h *AuthHandler) IssueTokensAndRespond(c echo.Context, userID string) error {
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

func (h *AuthHandler) Me(c echo.Context) error {
	userID, ok := UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	var user schema.User
	if err := h.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "user not found"})
	}

	return c.JSON(http.StatusOK, map[string]any{
		"user_id":        user.ID,
		"username":       user.Username,
		"email":          user.Email,
		"profile_color":  user.ProfileColor,
		"created_at":     user.CreatedAt,
	})
}

func (h *AuthHandler) UpdateProfile(c echo.Context) error {
	userID, ok := UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	var req updateProfileRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	var user schema.User
	if err := h.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "user not found"})
	}

	updates := map[string]interface{}{}
	if req.Username != "" && req.Username != user.Username {
		updates["username"] = req.Username
	}
	if req.Email != "" && req.Email != user.Email {
		updates["email"] = req.Email
	}
	if req.NewPassword != "" {
		hashed, err := HashPassword(req.NewPassword)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to hash password"})
		}
		updates["password"] = hashed
	}

	if len(updates) > 0 {
		if err := h.DB.Model(&user).Updates(updates).Error; err != nil {
			return c.JSON(http.StatusConflict, map[string]string{"error": "email or username already in use"})
		}
	}

	return c.JSON(http.StatusOK, map[string]any{
		"message":  "profile updated",
		"user_id":  user.ID,
		"username": user.Username,
		"email":    user.Email,
	})
}
