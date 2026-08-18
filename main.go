package main

import (
	"embed"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"wha-console/auth"
	"wha-console/config"
	"wha-console/process"
	"wha-console/schema"
	"wha-console/telemetry"
)

//go:embed dist
var distFS embed.FS

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, relying on system env vars")
	}

	cfg := config.Load()

	if cfg.JWTSecret == "" {
		log.Fatal("JWT_SECRET must be set")
	}

	db, err := schema.NewDB(schema.DBConfig{
		Driver: cfg.DBDriver,
		DSN:    cfg.DBDSN,
	})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	procManager, err := process.NewManager(db, cfg)
	if err != nil {
		log.Fatalf("failed to init process manager: %v", err)
	}
	if err := procManager.ReconcileAndRecoverOnBoot(); err != nil {
		log.Printf("warning: failed to reconcile and recover process states: %v", err)
	}

	e := echo.New()
	e.Debug = cfg.DevMode

	e.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
		LogURI:    true,
		LogStatus: true,
		LogValuesFunc: func(c echo.Context, v middleware.RequestLoggerValues) error {
			log.Printf("%s %s -> %d (%s)", c.Request().Method, v.URI, v.Status, v.Latency)
			return nil
		},
	}))
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// --- API routes ---
	api := e.Group("/api")
	api.GET("/health", healthCheck)

	authHandler := auth.NewAuthHandler(db, cfg)
	authGroup := api.Group("/auth")
	authGroup.GET("/github/login", authHandler.GitHubLogin)
	authGroup.GET("/github/callback", authHandler.GitHubCallback)
	authGroup.GET("/me", authHandler.Me, authHandler.RequireAuth)
	authGroup.PATCH("/profile", authHandler.UpdateProfile, authHandler.RequireAuth)
	authGroup.POST("/refresh", authHandler.Refresh)
	authGroup.POST("/logout", authHandler.Logout)

	processHandler := process.NewHandler(db, procManager)
	api.GET("/limits", processHandler.GetLimits, authHandler.RequireAuth)

	processGroup := api.Group("/processes", authHandler.RequireAuth)
	processGroup.GET("", processHandler.List)
	processGroup.POST("", processHandler.Start)
	processGroup.GET("/limits", processHandler.GetLimits)
	processGroup.GET("/waitlist", processHandler.GetWaitlist)
	processGroup.DELETE("/:id/waitlist", processHandler.CancelWaitlist)
	processGroup.GET("/:id", processHandler.Get)
	processGroup.PATCH("/:id/settings", processHandler.UpdateSettings)
	processGroup.DELETE("/:id", processHandler.Delete)
	processGroup.POST("/:id/update", processHandler.CheckUpdate)

	processGroup.POST("/:id/run", processHandler.RunProcess)
	processGroup.POST("/:id/stop", processHandler.StopProcess)
	processGroup.GET("/:id/logs", processHandler.GetLogs)
	processGroup.GET("/:id/logs/stream", processHandler.StreamLogs)
	processGroup.POST("/:id/logs/clear", processHandler.ClearLogs)
	processGroup.GET("/:id/stats", processHandler.GetBotStats)
	processGroup.GET("/:id/groups", processHandler.GetGroupsList)
	processGroup.GET("/:id/communities", processHandler.GetCommunitiesList)
	processGroup.GET("/:id/contacts", processHandler.GetContactsList)

	processGroup.POST("/:id/logout", processHandler.LogoutSession)

	// --- API Key routes (Uninhibited / Excluded from rate limiters) ---
	api.GET("/keys", authHandler.ListAPIKeys, authHandler.RequireAuth)
	api.POST("/keys", authHandler.CreateAPIKey, authHandler.RequireAuth)
	api.DELETE("/keys/:id", authHandler.RevokeAPIKey, authHandler.RequireAuth)

	// Rate limiter middleware for general interactive routes
	rateLimiterConfig := middleware.RateLimiterConfig{
		Skipper: func(c echo.Context) bool {
			path := c.Path()
			if strings.HasPrefix(path, "/api/keys") {
				return true
			}
			authHeader := c.Request().Header.Get("Authorization")
			apiKey := c.Request().Header.Get("X-API-Key")
			return apiKey != "" || strings.Contains(authHeader, "wha_live_")
		},
		Store: middleware.NewRateLimiterMemoryStore(100),
	}
	api.Use(middleware.RateLimiterWithConfig(rateLimiterConfig))

	// --- Telemetry & Cookie Preference routes ---
	telemetryHandler := telemetry.NewHandler(db)
	api.POST("/telemetry/event", telemetryHandler.LogTelemetryEvent)
	api.GET("/telemetry/metrics", telemetryHandler.GetMetricsSummary, authHandler.RequireAuth)
	api.POST("/cookies/preference", telemetryHandler.SaveCookiePreference)
	api.GET("/cookies/preference", telemetryHandler.GetCookiePreference)

	distFiles := echo.MustSubFS(distFS, "dist")

	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:       ".",
		Filesystem: http.FS(distFiles),
		HTML5:      true,
	}))

	// graceful shutdown
	sigCh := make(chan os.Signal, 1)
	signal.Notify(sigCh, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-sigCh
		log.Println("shutting down, stopping all processes...")
		procManager.ShutdownAll()
		os.Exit(0)
	}()

	log.Printf("starting server on :%s (dev mode: %v)", cfg.Port, cfg.DevMode)
	e.Logger.Fatal(e.Start(":" + cfg.Port))
}

func healthCheck(c echo.Context) error {
	return c.JSON(200, map[string]string{"status": "ok"})
}
