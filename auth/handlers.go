// auth/handlers.go
package auth

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
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

type updateProfileRequest struct {
	Username     string `json:"username"`
	ProfileColor string `json:"profile_color"`
}

type githubTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	Scope       string `json:"scope"`
	Error       string `json:"error"`
}

type githubUserResponse struct {
	ID        int64  `json:"id"`
	Login     string `json:"login"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatar_url"`
}

type githubEmailResponse struct {
	Email    string `json:"email"`
	Primary  bool   `json:"primary"`
	Verified bool   `json:"verified"`
}

func generateStateToken() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// GitHubLogin initiates the OAuth2 flow by redirecting the user to GitHub
func (h *AuthHandler) GitHubLogin(c echo.Context) error {
	if h.Cfg.GitHubClientID == "" {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "GitHub OAuth is not configured"})
	}

	state, err := generateStateToken()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to generate oauth state"})
	}

	c.SetCookie(&http.Cookie{
		Name:     "oauth_state",
		Value:    state,
		Path:     "/",
		Expires:  time.Now().Add(10 * time.Minute),
		HttpOnly: true,
		Secure:   h.Cfg.CookieSecure,
		SameSite: http.SameSiteLaxMode,
	})

	authURL := fmt.Sprintf(
		"https://github.com/login/oauth/authorize?client_id=%s&redirect_uri=%s&scope=%s&state=%s",
		url.QueryEscape(h.Cfg.GitHubClientID),
		url.QueryEscape(h.Cfg.GitHubRedirectURL),
		url.QueryEscape("read:user user:email"),
		url.QueryEscape(state),
	)

	return c.Redirect(http.StatusTemporaryRedirect, authURL)
}

// GitHubCallback handles the redirect back from GitHub
func (h *AuthHandler) GitHubCallback(c echo.Context) error {
	stateQuery := c.QueryParam("state")
	code := c.QueryParam("code")

	cookie, err := c.Cookie("oauth_state")
	if err != nil || cookie.Value == "" || cookie.Value != stateQuery {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid oauth state"})
	}

	// Invalidate state cookie
	c.SetCookie(&http.Cookie{
		Name:     "oauth_state",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		HttpOnly: true,
	})

	// Exchange code for access token
	tokenReqBody, _ := json.Marshal(map[string]string{
		"client_id":     h.Cfg.GitHubClientID,
		"client_secret": h.Cfg.GitHubClientSecret,
		"code":          code,
		"redirect_uri":  h.Cfg.GitHubRedirectURL,
	})

	req, err := http.NewRequest(http.MethodPost, "https://github.com/login/oauth/access_token", bytes.NewBuffer(tokenReqBody))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to prepare token exchange request"})
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return c.JSON(http.StatusBadGateway, map[string]string{"error": "failed to contact GitHub token endpoint"})
	}
	defer resp.Body.Close()

	var tokenResp githubTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil || tokenResp.AccessToken == "" {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "failed to acquire access token from GitHub"})
	}

	// Fetch GitHub user profile
	userReq, _ := http.NewRequest(http.MethodGet, "https://api.github.com/user", nil)
	userReq.Header.Set("Authorization", "Bearer "+tokenResp.AccessToken)
	userReq.Header.Set("Accept", "application/vnd.github+json")

	userResp, err := client.Do(userReq)
	if err != nil || userResp.StatusCode != http.StatusOK {
		return c.JSON(http.StatusBadGateway, map[string]string{"error": "failed to fetch GitHub profile"})
	}
	defer userResp.Body.Close()

	var ghUser githubUserResponse
	if err := json.NewDecoder(userResp.Body).Decode(&ghUser); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to parse GitHub profile"})
	}

	// If primary email is not public, query user/emails
	email := ghUser.Email
	if email == "" {
		email = fetchPrimaryGitHubEmail(client, tokenResp.AccessToken)
	}

	ghIDStr := strconv.FormatInt(ghUser.ID, 10)
	var user schema.User

	// Upsert User by GitHubID
	err = h.DB.Where("github_id = ?", ghIDStr).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			username := ghUser.Login
			if ghUser.Name != "" {
				username = ghUser.Login
			}
			user = schema.User{
				GitHubID:     ghIDStr,
				Username:     username,
				Email:        email,
				AvatarURL:    ghUser.AvatarURL,
				ProfileColor: "#6366f1",
			}
			if createErr := h.DB.Create(&user).Error; createErr != nil {
				return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to create user account"})
			}
		} else {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "database error"})
		}
	} else {
		// Update profile info on login
		h.DB.Model(&user).Updates(map[string]interface{}{
			"avatar_url": ghUser.AvatarURL,
			"email":      email,
		})
	}

	// Issue refresh token cookie
	refreshToken, err := IssueRefreshToken(h.DB, user.ID)
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
		SameSite: http.SameSiteLaxMode,
	})

	// Redirect back to frontend dashboard
	return c.Redirect(http.StatusTemporaryRedirect, "/#oauth_success=true")
}

func fetchPrimaryGitHubEmail(client *http.Client, token string) string {
	req, err := http.NewRequest(http.MethodGet, "https://api.github.com/user/emails", nil)
	if err != nil {
		return ""
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/vnd.github+json")

	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		return ""
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return ""
	}

	var emails []githubEmailResponse
	if err := json.Unmarshal(body, &emails); err != nil {
		return ""
	}

	for _, e := range emails {
		if e.Primary && e.Verified {
			return e.Email
		}
	}
	if len(emails) > 0 {
		return emails[0].Email
	}
	return ""
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
		"user_id":       user.ID,
		"github_id":     user.GitHubID,
		"username":      user.Username,
		"email":         user.Email,
		"avatar_url":    user.AvatarURL,
		"profile_color": user.ProfileColor,
		"created_at":    user.CreatedAt,
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
	if req.ProfileColor != "" {
		updates["profile_color"] = req.ProfileColor
	}

	if len(updates) > 0 {
		if err := h.DB.Model(&user).Updates(updates).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to update profile"})
		}
	}

	return c.JSON(http.StatusOK, map[string]any{
		"message":       "profile updated",
		"user_id":       user.ID,
		"username":      user.Username,
		"email":         user.Email,
		"avatar_url":    user.AvatarURL,
		"profile_color": user.ProfileColor,
	})
}
