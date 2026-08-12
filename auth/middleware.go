// auth/middleware.go
package auth

import (
	"net/http"
	"strings"
	"time"
	"wha-console/schema"

	"github.com/labstack/echo/v4"
)

const UserIDContextKey = "user_id"

// RequireAuth validates either a JWT Bearer token or an X-API-Key / Bearer wha_live_... API key,
// attaching the authenticated user ID to the request context.
func (h *AuthHandler) RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		// 1. Check X-API-Key header first
		apiKeyHeader := c.Request().Header.Get("X-API-Key")
		if apiKeyHeader == "" {
			apiKeyHeader = c.QueryParam("api_key")
		}

		authHeader := c.Request().Header.Get("Authorization")
		token := ""

		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && parts[0] == "Bearer" {
				token = parts[1]
				if strings.HasPrefix(token, "wha_live_") {
					apiKeyHeader = token
				}
			}
		}

		// If API Key is present, authenticate via API Key
		if apiKeyHeader != "" {
			var apiKey schema.APIKey
			if err := h.DB.Where("key = ?", apiKeyHeader).First(&apiKey).Error; err != nil {
				return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid API key"})
			}

			// Update last used timestamp
			now := time.Now()
			h.DB.Model(&apiKey).Update("last_used_at", now)

			c.Set(UserIDContextKey, apiKey.UserID)
			return next(c)
		}

		// 2. Authenticate via JWT Token
		if token == "" {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "missing authorization token or API key"})
		}

		claims, err := ParseAccessToken(token, h.Secret)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid or expired token"})
		}

		var exists int64
		h.DB.Model(&schema.User{}).Where("id = ?", claims.UserID).Count(&exists)
		if exists == 0 {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "user no longer exists"})
		}

		c.Set(UserIDContextKey, claims.UserID)
		return next(c)
	}
}

// UserIDFromContext is a small helper for handlers to pull the authenticated
// user ID out of context without repeating the type assertion everywhere.
func UserIDFromContext(c echo.Context) (string, bool) {
	id, ok := c.Get(UserIDContextKey).(string)
	return id, ok
}
