package process

import (
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	"wha-console/auth"
	"wha-console/schema"
)

type Handler struct {
	DB      *gorm.DB
	Manager *Manager
}

func NewHandler(db *gorm.DB, manager *Manager) *Handler {
	return &Handler{DB: db, Manager: manager}
}

func (h *Handler) List(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	var sessions []schema.Session
	if err := h.DB.Where("user_id = ?", userID).Order("created_at desc").Find(&sessions).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to load processes"})
	}

	cards := make([]CardResponse, len(sessions))
	for i, s := range sessions {
		cards[i] = toCardResponse(s)
	}
	return c.JSON(http.StatusOK, cards)
}

func (h *Handler) Get(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	var session schema.Session
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&session).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "process not found"})
	}

	return c.JSON(http.StatusOK, toDetailResponse(session))
}

func (h *Handler) Start(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	var req CreateRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}
	if err := req.Validate(); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	session := schema.Session{
		UserID:      userID,
		Name:        req.Name,
		PhoneNumber: req.PhoneNumber,
		AuthType:    req.AuthType,
		Client:      req.Client,
		DatabaseURL: req.DatabaseURL,
		Status:      "stopped", // actual process spawning comes later
	}

	if err := h.DB.Create(&session).Error; err != nil {
		return c.JSON(http.StatusConflict, map[string]string{"error": "a process with this name may already exist"})
	}

	return c.JSON(http.StatusCreated, toDetailResponse(session))
}

func (h *Handler) Stop(c echo.Context) error {
	id := c.Param("id")
	// TODO: actually stop the running process once exec.Command spawning exists
	return c.JSON(http.StatusOK, map[string]string{"message": "stopped " + id})
}

func (h *Handler) RunProcess(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	var session schema.Session
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&session).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "process not found"})
	}

	if err := h.Manager.Start(&session); err != nil {
		return c.JSON(http.StatusConflict, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "started"})
}

func (h *Handler) StopProcess(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	var session schema.Session
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&session).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "process not found"})
	}

	sessionID := session.ID
	if err := h.Manager.Stop(sessionID); err != nil {
		return c.JSON(http.StatusConflict, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "stopping"})
}

func (h *Handler) UpdateSettings(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	var session schema.Session
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&session).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "process not found"})
	}

	var req UpdateSettingsRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	updates := map[string]interface{}{}
	if req.Verbose != nil {
		updates["verbose"] = *req.Verbose
	}
	if req.NoSkipOld != nil {
		updates["no_skip_old"] = *req.NoSkipOld
	}

	if len(updates) > 0 {
		if err := h.DB.Model(&session).Updates(updates).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to update settings"})
		}
	}

	return c.JSON(http.StatusOK, toDetailResponse(session))
}

func (h *Handler) Delete(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	result := h.DB.Where("id = ? AND user_id = ?", id, userID).Delete(&schema.Session{})
	if result.Error != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to delete process"})
	}
	if result.RowsAffected == 0 {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "process not found"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "deleted"})
}

func (h *Handler) CheckUpdate(c echo.Context) error {
	// Stub for now — real implementation needs process spawning to check the
	// whatsrook binary's actual version via `whatsrook update check`.
	return c.JSON(http.StatusOK, map[string]string{"message": "update check not yet available — process spawning required"})
}

func (h *Handler) GetLogs(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	var session schema.Session
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&session).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "process not found"})
	}

	content, err := os.ReadFile(logPath(session.ID))
	if err != nil {
		if os.IsNotExist(err) {
			return c.JSON(http.StatusOK, map[string]string{"logs": ""})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to read logs"})
	}

	return c.JSON(http.StatusOK, map[string]string{"logs": string(content)})
}
