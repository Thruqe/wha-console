// auth/key_handlers.go
package auth

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"wha-console/schema"
)

type createKeyRequest struct {
	Name string `json:"name"`
}

func (h *AuthHandler) ListAPIKeys(c echo.Context) error {
	userID, ok := UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	var keys []schema.APIKey
	if err := h.DB.Where("user_id = ?", userID).Order("created_at desc").Find(&keys).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to list API keys"})
	}

	return c.JSON(http.StatusOK, keys)
}

func (h *AuthHandler) CreateAPIKey(c echo.Context) error {
	userID, ok := UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	var req createKeyRequest
	if err := c.Bind(&req); err != nil || req.Name == "" {
		req.Name = "Default API Key"
	}

	key, err := schema.GenerateAPIKey()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to generate API key"})
	}

	apiKey := schema.APIKey{
		Name:   req.Name,
		Key:    key,
		UserID: userID,
	}

	if err := h.DB.Create(&apiKey).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to save API key"})
	}

	return c.JSON(http.StatusCreated, apiKey)
}

func (h *AuthHandler) RevokeAPIKey(c echo.Context) error {
	userID, ok := UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&schema.APIKey{}).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to revoke API key"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "API key revoked"})
}
