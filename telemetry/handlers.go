// telemetry/handlers.go
package telemetry

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"

	"wha-console/auth"
	"wha-console/schema"
)

type Handler struct {
	DB *gorm.DB
}

func NewHandler(db *gorm.DB) *Handler {
	return &Handler{DB: db}
}

type EventRequest struct {
	ConsentID string          `json:"consent_id"`
	EventType string          `json:"event_type"`
	EventName string          `json:"event_name"`
	PageURL   string          `json:"page_url"`
	Metadata  json.RawMessage `json:"metadata"`
}

type CookieConsentRequest struct {
	ConsentID  string `json:"consent_id"`
	Essential  bool   `json:"essential"`
	Analytics  bool   `json:"analytics"`
	Functional bool   `json:"functional"`
	Marketing  bool   `json:"marketing"`
}

func generateUUID() string {
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

// SaveCookiePreference creates or updates the user's cookie consent selection.
func (h *Handler) SaveCookiePreference(c echo.Context) error {
	var req CookieConsentRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	consentID := req.ConsentID
	if consentID == "" {
		cookie, err := c.Cookie("wha_consent_id")
		if err == nil && cookie.Value != "" {
			consentID = cookie.Value
		} else {
			consentID = generateUUID()
		}
	}

	userID, _ := auth.UserIDFromContext(c)

	var pref schema.CookiePreference
	err := h.DB.Where("consent_id = ?", consentID).First(&pref).Error

	now := time.Now()
	ip := c.RealIP()
	ua := c.Request().UserAgent()

	if err != nil {
		pref = schema.CookiePreference{
			ConsentID:        consentID,
			UserID:           userID,
			Essential:        true, // always required
			Analytics:        req.Analytics,
			Functional:       req.Functional,
			Marketing:        req.Marketing,
			IPAddress:        ip,
			UserAgent:        ua,
			ConsentTimestamp: now,
		}
		if err := h.DB.Create(&pref).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to save cookie preferences"})
		}
	} else {
		updates := map[string]any{
			"essential":         true,
			"analytics":         req.Analytics,
			"functional":        req.Functional,
			"marketing":         req.Marketing,
			"ip_address":        ip,
			"user_agent":        ua,
			"consent_timestamp": now,
		}
		if userID != "" {
			updates["user_id"] = userID
		}
		if err := h.DB.Model(&pref).Updates(updates).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to update cookie preferences"})
		}
	}

	// Set HTTP Cookie for 1 year
	c.SetCookie(&http.Cookie{
		Name:     "wha_consent_id",
		Value:    consentID,
		Expires:  now.Add(365 * 24 * time.Hour),
		Path:     "/",
		HttpOnly: false, // accessible to frontend tracking scripts
		SameSite: http.SameSiteLaxMode,
	})

	return c.JSON(http.StatusOK, pref)
}

// GetCookiePreference retrieves current consent settings.
func (h *Handler) GetCookiePreference(c echo.Context) error {
	consentID := c.QueryParam("consent_id")
	if consentID == "" {
		cookie, err := c.Cookie("wha_consent_id")
		if err == nil {
			consentID = cookie.Value
		}
	}

	if consentID == "" {
		return c.JSON(http.StatusOK, map[string]any{
			"exists":    false,
			"essential": true,
			"analytics": false,
		})
	}

	var pref schema.CookiePreference
	if err := h.DB.Where("consent_id = ?", consentID).First(&pref).Error; err != nil {
		return c.JSON(http.StatusOK, map[string]any{
			"exists":     false,
			"consent_id": consentID,
			"essential":  true,
			"analytics":  false,
		})
	}

	return c.JSON(http.StatusOK, map[string]any{
		"exists":     true,
		"preference": pref,
	})
}

// LogTelemetryEvent records user interactions and usage telemetry if analytics consent is granted.
func (h *Handler) LogTelemetryEvent(c echo.Context) error {
	var req EventRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid request body"})
	}

	consentID := req.ConsentID
	if consentID == "" {
		cookie, err := c.Cookie("wha_consent_id")
		if err == nil {
			consentID = cookie.Value
		}
	}

	// Verify consent choice if consentID is present
	consentLevel := "essential"
	if consentID != "" {
		var pref schema.CookiePreference
		if err := h.DB.Where("consent_id = ?", consentID).First(&pref).Error; err == nil {
			if !pref.Analytics {
				// User declined non-essential analytics cookies — ignore non-essential event
				return c.JSON(http.StatusOK, map[string]string{"status": "ignored", "reason": "analytics consent not granted"})
			}
			consentLevel = "analytics"
		}
	}

	userID, _ := auth.UserIDFromContext(c)

	metaStr := ""
	if len(req.Metadata) > 0 {
		metaStr = string(req.Metadata)
	}

	event := schema.TelemetryEvent{
		UserID:       userID,
		ConsentID:    consentID,
		EventType:    req.EventType,
		EventName:    req.EventName,
		PageURL:      req.PageURL,
		UserAgent:    c.Request().UserAgent(),
		IPAddress:    c.RealIP(),
		Metadata:     metaStr,
		ConsentLevel: consentLevel,
	}

	if err := h.DB.Create(&event).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to record telemetry event"})
	}

	// Aggregate daily metrics for site usage study
	today := time.Now().Format("2006-01-02")
	var metric schema.DailyMetric
	err := h.DB.Where("metric_date = ? AND category = ? AND metric_name = ?", today, "telemetry", req.EventType).First(&metric).Error
	if err != nil {
		h.DB.Create(&schema.DailyMetric{
			MetricDate:  today,
			Category:    "telemetry",
			MetricName:  req.EventType,
			MetricValue: 1,
		})
	} else {
		h.DB.Model(&metric).Update("metric_value", gorm.Expr("metric_value + 1"))
	}

	return c.JSON(http.StatusCreated, map[string]string{"status": "recorded"})
}

// GetMetricsSummary returns aggregated statistics for site study.
func (h *Handler) GetMetricsSummary(c echo.Context) error {
	var metrics []schema.DailyMetric
	h.DB.Order("metric_date desc").Limit(100).Find(&metrics)

	var totalEvents int64
	h.DB.Model(&schema.TelemetryEvent{}).Count(&totalEvents)

	var totalConsents int64
	h.DB.Model(&schema.CookiePreference{}).Count(&totalConsents)

	var analyticsConsented int64
	h.DB.Model(&schema.CookiePreference{}).Where("analytics = ?", true).Count(&analyticsConsented)

	return c.JSON(http.StatusOK, map[string]any{
		"total_telemetry_events": totalEvents,
		"total_consent_records":  totalConsents,
		"analytics_consented":    analyticsConsented,
		"daily_metrics":          metrics,
	})
}
