// auth/middleware.go
package auth

import (
	"net/http"
	"strings"
	"wha-console/schema"

	"github.com/labstack/echo/v4"
)

const UserIDContextKey = "user_id"

// RequireAuth validates the Authorization: Bearer <token> header and
// attaches the authenticated user ID to the request context.
func (h *AuthHandler) RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "missing authorization header"})
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid authorization header format"})
		}

		claims, err := ParseAccessToken(parts[1], h.Secret)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "invalid or expired token"})
		}

		// Confirm the user still actually exists — a valid signature alone
		// isn't enough if the DB was wiped or the account was deleted.
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
