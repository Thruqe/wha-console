package process

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	"wha-console/auth"
)

type Handler struct {
	DB *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{DB: db}
}

func (h *Handler) List(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}
	// TODO: query sessions where UserID = userID
	_ = userID
	return c.JSON(http.StatusOK, []string{})
}

func (h *Handler) Start(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}
	// TODO: spawn a process tied to userID
	_ = userID
	return c.JSON(http.StatusCreated, map[string]string{"message": "process started"})
}

func (h *Handler) Stop(c echo.Context) error {
	id := c.Param("id")
	// TODO: stop the process with this id
	return c.JSON(http.StatusOK, map[string]string{"message": "stopped " + id})
}
