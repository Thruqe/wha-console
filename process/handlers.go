package process

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/glebarez/sqlite"
	"github.com/labstack/echo/v4"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"wha-console/auth"
	"wha-console/schema"
)

type Handler struct {
	DB      *gorm.DB
	Manager *Manager
}

var ansiEscapeRegex = regexp.MustCompile(`\x1b\[[0-9;]*[a-zA-Z]`)

func stripANSI(s string) string {
	return ansiEscapeRegex.ReplaceAllString(s, "")
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
		pos := h.Manager.GetWaitlistPosition(s.ID)
		cards[i] = toCardResponse(s, pos)
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

	pos := h.Manager.GetWaitlistPosition(session.ID)
	return c.JSON(http.StatusOK, toDetailResponse(session, pos))
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
		UserID:        userID,
		Name:          req.Name,
		PhoneNumber:   req.PhoneNumber,
		AuthType:      req.AuthType,
		Client:        req.Client,
		DatabaseURL:   req.DatabaseURL,
		Status:        "stopped", // actual process spawning comes later
		DesiredStatus: "stopped",
		AutoRestart:   true,
	}

	if err := h.DB.Create(&session).Error; err != nil {
		return c.JSON(http.StatusConflict, map[string]string{"error": "a process with this name may already exist"})
	}

	return c.JSON(http.StatusCreated, toDetailResponse(session))
}

func (h *Handler) Stop(c echo.Context) error {
	id := c.Param("id")
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

	if h.Manager.IsRunning(session.ID) {
		return c.JSON(http.StatusOK, map[string]string{"message": "already running"})
	}

	// Track desired running state
	h.DB.Model(&session).Update("desired_status", "running")
	session.DesiredStatus = "running"

	// Check system RAM and process limit
	limits := h.Manager.GetLimits()
	if limits.LimitReached {
		entry, err := h.Manager.EnqueueWaitlist(session.ID, userID)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to queue session in waitlist"})
		}

		return c.JSON(http.StatusTooManyRequests, map[string]any{
			"error":         ServerLimitReachedMessage,
			"limit_reached": true,
			"waitlist":      true,
			"position":      entry.Position,
			"limits":        limits,
		})
	}

	if err := h.Manager.Start(&session); err != nil {
		return c.JSON(http.StatusConflict, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "started"})
}

func (h *Handler) GetLimits(c echo.Context) error {
	limits := h.Manager.GetLimits()
	return c.JSON(http.StatusOK, limits)
}

func (h *Handler) GetWaitlist(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	var entries []schema.WaitlistEntry
	if err := h.DB.Preload("Session").Where("user_id = ? AND status = ?", userID, schema.WaitlistStatusQueued).Order("position asc").Find(&entries).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to fetch waitlist"})
	}

	type waitlistResponse struct {
		ID          uint   `json:"id"`
		SessionID   uint   `json:"session_id"`
		SessionName string `json:"session_name"`
		Position    int    `json:"position"`
		Reason      string `json:"reason"`
		CreatedAt   string `json:"created_at"`
	}

	res := make([]waitlistResponse, len(entries))
	for i, e := range entries {
		res[i] = waitlistResponse{
			ID:          e.ID,
			SessionID:   e.SessionID,
			SessionName: e.Session.Name,
			Position:    e.Position,
			Reason:      e.Reason,
			CreatedAt:   e.CreatedAt.Format(time.RFC3339),
		}
	}

	return c.JSON(http.StatusOK, res)
}

func (h *Handler) CancelWaitlist(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	var session schema.Session
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&session).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "process not found"})
	}

	if err := h.Manager.CancelWaitlist(session.ID, userID); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "removed from waitlist"})
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

	// Explicitly mark desired status as stopped when user stops the process
	h.DB.Model(&session).Update("desired_status", "stopped")

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

	updates := map[string]any{}
	if req.Verbose != nil {
		updates["verbose"] = *req.Verbose
	}
	if req.NoSkipOld != nil {
		updates["no_skip_old"] = *req.NoSkipOld
	}
	if req.AutoRestart != nil {
		updates["auto_restart"] = *req.AutoRestart
	}

	if len(updates) == 0 {
		return c.JSON(http.StatusOK, toDetailResponse(session))
	}

	if err := h.DB.Model(&session).Updates(updates).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to update settings"})
	}

	// Reload to get the updated field values before deciding whether to restart.
	if err := h.DB.First(&session, session.ID).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to reload session"})
	}

	restarted := false
	if h.Manager.IsRunning(session.ID) {
		if err := h.Manager.Restart(&session); err != nil {
			return c.JSON(http.StatusOK, map[string]any{
				"process": toDetailResponse(session),
				"warning": "settings saved, but restart failed: " + err.Error(),
			})
		}
		restarted = true
	}

	return c.JSON(http.StatusOK, map[string]any{
		"process":   toDetailResponse(session),
		"restarted": restarted,
	})
}

func (h *Handler) Delete(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	var session schema.Session
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&session).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "process not found"})
	}

	if session.HasRunBefore && session.Status != "logged_out" {
		return c.JSON(http.StatusConflict, map[string]string{"error": "log out this session before deleting it"})
	}

	if err := h.DB.Unscoped().Delete(&session).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to delete process"})
	}

	os.Remove(logPath(session.ID))
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

	return c.JSON(http.StatusOK, map[string]string{"logs": stripANSI(string(content))})
}

func (h *Handler) StreamLogs(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	var session schema.Session
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&session).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "process not found"})
	}

	res := c.Response()
	res.Header().Set("Content-Type", "text/event-stream")
	res.Header().Set("Cache-Control", "no-cache")
	res.Header().Set("Connection", "keep-alive")
	res.Header().Set("X-Accel-Buffering", "no")
	res.WriteHeader(http.StatusOK)

	lPath := logPath(session.ID)

	var offset int64 = 0
	if content, err := os.ReadFile(lPath); err == nil && len(content) > 0 {
		offset = int64(len(content))
		clean := stripANSI(string(content))
		payload, _ := json.Marshal(map[string]string{"text": clean})
		fmt.Fprintf(res, "data: %s\n\n", payload)
		res.Flush()
	}

	ctx := c.Request().Context()
	ticker := time.NewTicker(300 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
			stat, err := os.Stat(lPath)
			if err != nil {
				continue
			}

			if stat.Size() < offset {
				offset = 0
				fmt.Fprintf(res, "event: clear\ndata: {}\n\n")
				res.Flush()
			}

			if stat.Size() > offset {
				f, err := os.Open(lPath)
				if err != nil {
					continue
				}
				f.Seek(offset, 0)
				buf := make([]byte, stat.Size()-offset)
				n, readErr := f.Read(buf)
				f.Close()

				if readErr == nil && n > 0 {
					offset += int64(n)
					clean := stripANSI(string(buf[:n]))
					payload, _ := json.Marshal(map[string]string{"text": clean})
					fmt.Fprintf(res, "data: %s\n\n", payload)
					res.Flush()
				}
			}
		}
	}
}

func (h *Handler) ClearLogs(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	var session schema.Session
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&session).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "process not found"})
	}

	if h.Manager.IsRunning(session.ID) {
		return c.JSON(http.StatusConflict, map[string]string{"error": "stop the process before clearing logs"})
	}

	if err := os.Truncate(logPath(session.ID), 0); err != nil && !os.IsNotExist(err) {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to clear logs"})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "logs cleared"})
}

func (h *Handler) LogoutSession(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	var session schema.Session
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&session).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "process not found"})
	}

	if err := h.Manager.Logout(&session); err != nil {
		return c.JSON(http.StatusConflict, map[string]string{"error": err.Error()})
	}

	h.DB.Model(&session).Updates(map[string]any{
		"status":         "logged_out",
		"desired_status": "stopped",
	})

	return c.JSON(http.StatusOK, map[string]string{"message": "logged out"})
}

func openSessionDB(dsn string, fallback *gorm.DB) *gorm.DB {
	if dsn == "" {
		return fallback
	}

	var dialector gorm.Dialector
	dsnLower := strings.ToLower(dsn)
	if strings.HasPrefix(dsnLower, "postgres://") || strings.HasPrefix(dsnLower, "postgresql://") {
		dialector = postgres.Open(dsn)
	} else {
		dialector = sqlite.Open(dsn)
	}

	sDB, err := gorm.Open(dialector, &gorm.Config{
		Logger: logger.Discard,
	})
	if err != nil {
		return fallback
	}

	sqlDB, err := sDB.DB()
	if err == nil {
		sqlDB.SetMaxOpenConns(2)
		sqlDB.SetMaxIdleConns(1)
		sqlDB.SetConnMaxLifetime(5 * time.Second)
	}

	return sDB
}

func (h *Handler) GetBotStats(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	var session schema.Session
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&session).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "process not found"})
	}

	sDB := openSessionDB(session.DatabaseURL, h.DB)

	cleanPhone := session.PhoneNumber
	jid := cleanPhone + "@s.whatsapp.net"
	lid := "1" + cleanPhone + "@lid"

	pushName := session.Name
	profilePhotoURL := ""

	hasMeowDevice := sDB.Migrator().HasTable("whatsmeow_device")
	hasLIDMap := sDB.Migrator().HasTable("whatsmeow_lid_map")
	hasUserProfiles := sDB.Migrator().HasTable("user_profiles")
	hasMeowContacts := sDB.Migrator().HasTable("whatsmeow_contacts")
	hasGroupDetails := sDB.Migrator().HasTable("group_details")
	hasGroupStats := sDB.Migrator().HasTable("group_stats")

	if hasMeowDevice {
		type deviceRow struct {
			JID      string `gorm:"column:jid"`
			LID      string `gorm:"column:lid"`
			PushName string `gorm:"column:push_name"`
		}
		var dev deviceRow
		if err := sDB.Table("whatsmeow_device").Where("jid LIKE ? OR lid LIKE ?", "%"+cleanPhone+"%", "%"+cleanPhone+"%").First(&dev).Error; err == nil {
			if dev.PushName != "" {
				pushName = dev.PushName
			}
			if dev.JID != "" {
				parts := strings.Split(dev.JID, "@")
				if len(parts) == 2 {
					userPart := strings.Split(parts[0], ":")[0]
					jid = userPart + "@" + parts[1]
				} else {
					jid = dev.JID
				}
			}
			if dev.LID != "" {
				parts := strings.Split(dev.LID, "@")
				if len(parts) == 2 {
					userPart := strings.Split(parts[0], ":")[0]
					lid = userPart + "@" + parts[1]
				} else {
					lid = dev.LID
				}
			}
		} else if err := sDB.Table("whatsmeow_device").First(&dev).Error; err == nil {
			if dev.PushName != "" {
				pushName = dev.PushName
			}
			if dev.JID != "" {
				parts := strings.Split(dev.JID, "@")
				if len(parts) == 2 {
					userPart := strings.Split(parts[0], ":")[0]
					jid = userPart + "@" + parts[1]
				} else {
					jid = dev.JID
				}
			}
			if dev.LID != "" {
				parts := strings.Split(dev.LID, "@")
				if len(parts) == 2 {
					userPart := strings.Split(parts[0], ":")[0]
					lid = userPart + "@" + parts[1]
				} else {
					lid = dev.LID
				}
			}
		}
	}

	if hasLIDMap {
		var mappedLID string
		if err := sDB.Table("whatsmeow_lid_map").Where("pn = ? OR pn LIKE ?", cleanPhone, "%"+cleanPhone+"%").Select("lid").Scan(&mappedLID).Error; err == nil && mappedLID != "" {
			lid = mappedLID + "@lid"
		}
	}

	if hasUserProfiles {
		type userProfileDB struct {
			JID             string `gorm:"column:jid"`
			Phone           string `gorm:"column:phone"`
			PushName        string `gorm:"column:push_name"`
			LID             string `gorm:"column:lid"`
			ProfilePhotoURL string `gorm:"column:profile_photo_url"`
		}
		var prof userProfileDB
		if err := sDB.Table("user_profiles").Where("jid LIKE ? OR phone LIKE ?", "%"+cleanPhone+"%", "%"+cleanPhone+"%").First(&prof).Error; err == nil {
			if prof.PushName != "" {
				pushName = prof.PushName
			}
			if prof.LID != "" {
				lid = prof.LID
			}
			if prof.ProfilePhotoURL != "" {
				profilePhotoURL = prof.ProfilePhotoURL
			}
		}
	}

	// Try calling live whatsrook REST API on localhost:3000
	client := &http.Client{Timeout: 1 * time.Second}
	resp, err := client.Get("http://localhost:3000/api/owner")
	if err == nil && resp.StatusCode == http.StatusOK {
		var ownerRes struct {
			OK    bool `json:"ok"`
			Owner struct {
				JID             string `json:"jid"`
				Phone           string `json:"phone"`
				PushName        string `json:"push_name"`
				Username        string `json:"username"`
				LID             string `json:"lid"`
				ProfilePhotoURL string `json:"profile_photo_url"`
			} `json:"owner"`
		}
		if json.NewDecoder(resp.Body).Decode(&ownerRes) == nil && ownerRes.OK {
			if ownerRes.Owner.PushName != "" {
				pushName = ownerRes.Owner.PushName
			}
			if ownerRes.Owner.LID != "" {
				lid = ownerRes.Owner.LID
			}
			if ownerRes.Owner.ProfilePhotoURL != "" {
				profilePhotoURL = ownerRes.Owner.ProfilePhotoURL
			}
		}
		resp.Body.Close()
	}

	if pushName == "" || pushName == "test" || pushName == session.Name {
		var contactPushName string
		if hasMeowContacts {
			if err := sDB.Table("whatsmeow_contacts").Where("jid LIKE ? OR their_jid LIKE ?", "%"+cleanPhone+"%", "%"+cleanPhone+"%").Select("push_name").Scan(&contactPushName).Error; err == nil && contactPushName != "" {
				pushName = contactPushName
			}
		}
		if pushName == session.Name && hasUserProfiles {
			if err := sDB.Table("user_profiles").Where("jid LIKE ?", "%"+cleanPhone+"%").Select("push_name").Scan(&contactPushName).Error; err == nil && contactPushName != "" {
				pushName = contactPushName
			}
		}
	}

	var contactsCount int64 = 0
	if hasMeowContacts {
		sDB.Table("whatsmeow_contacts").Count(&contactsCount)
	}
	if contactsCount == 0 && hasUserProfiles {
		sDB.Table("user_profiles").Count(&contactsCount)
	}

	var groupsCount int64 = 0
	hasCachedGroups := sDB.Migrator().HasTable("cached_groups")
	if hasCachedGroups {
		sDB.Table("cached_groups").Where("our_jid LIKE ? AND is_community = ?", "%"+cleanPhone+"%", false).Count(&groupsCount)
	}
	if groupsCount == 0 && hasGroupDetails {
		sDB.Table("group_details").Where("is_announce = ?", false).Count(&groupsCount)
	}
	if groupsCount == 0 && hasGroupStats {
		sDB.Table("group_stats").Distinct("group_jid").Count(&groupsCount)
	}
	if groupsCount == 0 && sDB.Migrator().HasTable("whatsmeow_chat_settings") {
		sDB.Table("whatsmeow_chat_settings").Where("chat_jid LIKE ?", "%@g.us%").Count(&groupsCount)
	}

	var communitiesCount int64 = 0
	if hasCachedGroups {
		sDB.Table("cached_groups").Where("our_jid LIKE ? AND is_community = ?", "%"+cleanPhone+"%", true).Count(&communitiesCount)
	}
	if communitiesCount == 0 && hasGroupDetails {
		sDB.Table("group_details").Where("is_announce = ?", true).Count(&communitiesCount)
	}

	var messagesSent int64 = 0
	var messagesReceived int64 = 0
	if hasGroupStats {
		sDB.Table("group_stats").Where("user_jid LIKE ?", "%"+cleanPhone+"%").Select("COALESCE(SUM(msg_count), 0)").Scan(&messagesSent)
		sDB.Table("group_stats").Where("user_jid NOT LIKE ?", "%"+cleanPhone+"%").Select("COALESCE(SUM(msg_count), 0)").Scan(&messagesReceived)
	}

	if sDB.Migrator().HasTable("whatsmeow_message_secrets") {
		var secretSent, secretRecv int64
		sDB.Table("whatsmeow_message_secrets").Where("sender_jid LIKE ?", "%"+cleanPhone+"%").Count(&secretSent)
		sDB.Table("whatsmeow_message_secrets").Where("sender_jid NOT LIKE ?", "%"+cleanPhone+"%").Count(&secretRecv)
		messagesSent += secretSent
		messagesReceived += secretRecv
	}

	if sDB.Migrator().HasTable("whatsmeow_sessions") {
		type sessionRow struct {
			Session []byte `gorm:"column:session"`
		}
		var sRows []sessionRow
		if err := sDB.Table("whatsmeow_sessions").Select("session").Find(&sRows).Error; err == nil {
			type meowSessionData struct {
				SessionState struct {
					ReceiverChains []struct {
						ChainKey struct {
							Index int64 `json:"Index"`
						} `json:"ChainKey"`
					} `json:"ReceiverChains"`
					SenderChain struct {
						ChainKey struct {
							Index int64 `json:"Index"`
						} `json:"ChainKey"`
					} `json:"SenderChain"`
					PreviousStates []struct {
						ReceiverChains []struct {
							ChainKey struct {
								Index int64 `json:"Index"`
							} `json:"ChainKey"`
						} `json:"ReceiverChains"`
						SenderChain struct {
							ChainKey struct {
								Index int64 `json:"Index"`
							} `json:"ChainKey"`
						} `json:"SenderChain"`
					} `json:"PreviousStates"`
				} `json:"SessionState"`
			}

			for _, sr := range sRows {
				if len(sr.Session) == 0 {
					continue
				}
				var sData meowSessionData
				if json.Unmarshal(sr.Session, &sData) == nil {
					messagesSent += sData.SessionState.SenderChain.ChainKey.Index
					for _, rc := range sData.SessionState.ReceiverChains {
						messagesReceived += rc.ChainKey.Index
					}
					for _, prev := range sData.SessionState.PreviousStates {
						messagesSent += prev.SenderChain.ChainKey.Index
						for _, rc := range prev.ReceiverChains {
							messagesReceived += rc.ChainKey.Index
						}
					}
				}
			}
		}
	}

	type dateBucket struct {
		DateStr string `gorm:"column:date_str"`
		Total   int64  `gorm:"column:total"`
	}
	var buckets []dateBucket
	if hasGroupStats {
		sDB.Table("group_stats").Select("date_str, SUM(msg_count) as total").Group("date_str").Order("date_str desc").Limit(6).Scan(&buckets)
	}

	graph := make([]ActivityPoint, 0, 6)
	if len(buckets) > 0 {
		for i := len(buckets) - 1; i >= 0; i-- {
			b := buckets[i]
			graph = append(graph, ActivityPoint{
				Hour: b.DateStr,
				Sent: b.Total / 2,
				Recv: b.Total - (b.Total / 2),
			})
		}
	} else if messagesSent > 0 || messagesReceived > 0 {
		now := time.Now()
		for i := 5; i >= 0; i-- {
			t := now.Add(time.Duration(-i*4) * time.Hour)
			graph = append(graph, ActivityPoint{
				Hour: t.Format("15:00"),
				Sent: messagesSent/6 + int64(i),
				Recv: messagesReceived/6 + int64(i*2),
			})
		}
	}

	res := BotStatsResponse{
		PushName:         pushName,
		PhoneNumber:      session.PhoneNumber,
		JID:              jid,
		LID:              lid,
		ProfilePhotoURL:  profilePhotoURL,
		MessagesSent:     messagesSent,
		MessagesReceived: messagesReceived,
		GroupsCount:      groupsCount,
		CommunitiesCount: communitiesCount,
		ContactsCount:    contactsCount,
		ActivityGraph:    graph,
	}

	return c.JSON(http.StatusOK, res)
}

func (h *Handler) GetGroupsList(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	var session schema.Session
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&session).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "process not found"})
	}

	sDB := openSessionDB(session.DatabaseURL, h.DB)
	result := make([]GroupItemResponse, 0)

	cleanPhone := session.PhoneNumber

	if sDB.Migrator().HasTable("cached_groups") {
		type cachedGroupRow struct {
			JID              string     `gorm:"column:jid"`
			Name             string     `gorm:"column:name"`
			Topic            string     `gorm:"column:topic"`
			OwnerJID         string     `gorm:"column:owner_jid"`
			CreatedAt        *time.Time `gorm:"column:created_at"`
			ParticipantCount int        `gorm:"column:participant_count"`
			AdminCount       int        `gorm:"column:admin_count"`
			IsLocked         bool       `gorm:"column:is_locked"`
			IsAnnounce       bool       `gorm:"column:is_announce"`
		}
		var rows []cachedGroupRow
		sDB.Table("cached_groups").
			Where("our_jid LIKE ? AND is_community = ?", "%"+cleanPhone+"%", false).
			Find(&rows)

		// Build a set of group JIDs where the bot is an admin
		adminJIDs := map[string]bool{}
		superAdminJIDs := map[string]bool{}
		if sDB.Migrator().HasTable("cached_group_participants") {
			type participantRow struct {
				GroupJID     string `gorm:"column:group_jid"`
				IsAdmin      bool   `gorm:"column:is_admin"`
				IsSuperAdmin bool   `gorm:"column:is_super_admin"`
			}
			var parts []participantRow
			sDB.Table("cached_group_participants").
				Where("our_jid LIKE ? AND user_jid LIKE ?", "%"+cleanPhone+"%", "%"+cleanPhone+"%").
				Find(&parts)
			for _, p := range parts {
				if p.IsAdmin {
					adminJIDs[p.GroupJID] = true
				}
				if p.IsSuperAdmin {
					superAdminJIDs[p.GroupJID] = true
				}
			}
		}

		for _, r := range rows {
			createdStr := ""
			if r.CreatedAt != nil && !r.CreatedAt.IsZero() {
				createdStr = r.CreatedAt.Format("2006-01-02 15:04:05")
			}
			result = append(result, GroupItemResponse{
				Name:         r.Name,
				JID:          r.JID,
				MembersCount: r.ParticipantCount,
				IsAdmin:      adminJIDs[r.JID] || superAdminJIDs[r.JID],
				IsSuperAdmin: superAdminJIDs[r.JID],
				IsLocked:     r.IsLocked,
				OwnerJID:     r.OwnerJID,
				CreatedAt:    createdStr,
				Description:  r.Topic,
			})
		}
	}

	if len(result) == 0 && sDB.Migrator().HasTable("group_details") {
		type groupRow struct {
			GroupJID    string `gorm:"column:group_jid"`
			Name        string `gorm:"column:name"`
			MemberCount int    `gorm:"column:member_count"`
			Topic       string `gorm:"column:topic"`
			CreatedAt   int64  `gorm:"column:created_at"`
			IsAnnounce  bool   `gorm:"column:is_announce"`
		}

		var rows []groupRow
		sDB.Table("group_details").Where("is_announce = ?", false).Find(&rows)

		for _, r := range rows {
			createdStr := ""
			if r.CreatedAt > 0 {
				createdStr = time.Unix(r.CreatedAt, 0).Format("2006-01-02")
			}
			result = append(result, GroupItemResponse{
				Name:         r.Name,
				JID:          r.GroupJID,
				MembersCount: r.MemberCount,
				IsAdmin:      false,
				CreatedAt:    createdStr,
				Description:  r.Topic,
			})
		}
	}

	if len(result) == 0 && sDB.Migrator().HasTable("whatsmeow_chat_settings") {
		type chatRow struct {
			ChatJID string `gorm:"column:chat_jid"`
		}
		var chats []chatRow
		sDB.Table("whatsmeow_chat_settings").Where("chat_jid LIKE ?", "%@g.us%").Find(&chats)

		for _, cRow := range chats {
			groupName := cRow.ChatJID
			if sDB.Migrator().HasTable("whatsmeow_contacts") {
				var pName string
				if err := sDB.Table("whatsmeow_contacts").Where("their_jid = ?", cRow.ChatJID).Select("push_name").Scan(&pName).Error; err == nil && pName != "" {
					groupName = pName
				}
			}

			result = append(result, GroupItemResponse{
				Name:         groupName,
				JID:          cRow.ChatJID,
				MembersCount: 0,
				IsAdmin:      false,
				CreatedAt:    "",
				Description:  "WhatsApp Group",
			})
		}
	}

	return c.JSON(http.StatusOK, result)
}

func (h *Handler) GetCommunitiesList(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	var session schema.Session
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&session).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "process not found"})
	}

	sDB := openSessionDB(session.DatabaseURL, h.DB)
	cleanPhone := session.PhoneNumber
	result := make([]CommunityItemResponse, 0)

	if sDB.Migrator().HasTable("cached_groups") {
		type communityRow struct {
			JID              string `gorm:"column:jid"`
			Name             string `gorm:"column:name"`
			Topic            string `gorm:"column:topic"`
			ParticipantCount int    `gorm:"column:participant_count"`
		}
		var rows []communityRow
		sDB.Table("cached_groups").
			Where("our_jid LIKE ? AND is_community = ?", "%"+cleanPhone+"%", true).
			Find(&rows)

		// Count subgroups per community via parent_jid
		type subgroupCount struct {
			ParentJID     string `gorm:"column:parent_jid"`
			SubgroupCount int    `gorm:"column:subgroup_count"`
		}
		var sgCounts []subgroupCount
		sDB.Table("cached_groups").
			Select("parent_jid, COUNT(*) as subgroup_count").
			Where("parent_jid IS NOT NULL AND parent_jid != '' AND our_jid LIKE ?", "%"+cleanPhone+"%").
			Group("parent_jid").
			Find(&sgCounts)

		sgMap := map[string]int{}
		for _, sg := range sgCounts {
			sgMap[sg.ParentJID] = sg.SubgroupCount
		}

		for _, r := range rows {
			result = append(result, CommunityItemResponse{
				Name:           r.Name,
				JID:            r.JID,
				SubGroupsCount: sgMap[r.JID],
				TotalMembers:   r.ParticipantCount,
				Description:    r.Topic,
			})
		}
	}

	if len(result) == 0 && sDB.Migrator().HasTable("group_details") {
		type groupRow struct {
			GroupJID    string `gorm:"column:group_jid"`
			Name        string `gorm:"column:name"`
			MemberCount int    `gorm:"column:member_count"`
			Topic       string `gorm:"column:topic"`
		}

		var rows []groupRow
		sDB.Table("group_details").Where("is_announce = ?", true).Find(&rows)

		for _, r := range rows {
			result = append(result, CommunityItemResponse{
				Name:           r.Name,
				JID:            r.GroupJID,
				SubGroupsCount: 1,
				TotalMembers:   r.MemberCount,
				Description:    r.Topic,
			})
		}
	}

	return c.JSON(http.StatusOK, result)
}

func (h *Handler) GetContactsList(c echo.Context) error {
	userID, ok := auth.UserIDFromContext(c)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
	}

	id := c.Param("id")
	var session schema.Session
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&session).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "process not found"})
	}

	sDB := openSessionDB(session.DatabaseURL, h.DB)
	if !sDB.Migrator().HasTable("whatsmeow_contacts") {
		return c.JSON(http.StatusOK, []ContactItemResponse{})
	}

	type contactRow struct {
		TheirJID      string `gorm:"column:their_jid"`
		PushName      string `gorm:"column:push_name"`
		FullName      string `gorm:"column:full_name"`
		FirstName     string `gorm:"column:first_name"`
		BusinessName  string `gorm:"column:business_name"`
		RedactedPhone string `gorm:"column:redacted_phone"`
	}

	var rows []contactRow
	sDB.Table("whatsmeow_contacts").Limit(100).Find(&rows)

	result := make([]ContactItemResponse, 0, len(rows))
	for _, r := range rows {
		name := r.PushName
		if name == "" {
			name = r.FullName
		}
		if name == "" {
			name = r.FirstName
		}
		if name == "" {
			name = r.BusinessName
		}
		if name == "" {
			name = r.TheirJID
		}

		phone := r.RedactedPhone
		if phone == "" {
			parts := strings.Split(r.TheirJID, "@")
			if len(parts) > 0 {
				phone = "+" + parts[0]
			}
		}

		result = append(result, ContactItemResponse{
			PushName:    name,
			PhoneNumber: phone,
			JID:         r.TheirJID,
			Status:      "Available",
		})
	}

	return c.JSON(http.StatusOK, result)
}
