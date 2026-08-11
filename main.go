package main

import (
	"embed"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"wha-console/auth"
	"wha-console/config"
	"wha-console/process"
	"wha-console/schema"
	"wha-console/webauthn"
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

	procManager, err := process.NewManager(db)
	if err != nil {
		log.Fatalf("failed to init process manager: %v", err)
	}
	if err := procManager.ReconcileOnBoot(); err != nil {
		log.Printf("warning: failed to reconcile process states: %v", err)
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
	authGroup.POST("/signup", authHandler.Signup)
	authGroup.POST("/login", authHandler.Login)
	authGroup.GET("/me", authHandler.Me, authHandler.RequireAuth)
	authGroup.POST("/refresh", authHandler.Refresh)
	authGroup.POST("/logout", authHandler.Logout)

	waHandler, err := webauthn.NewHandler(db, cfg, authHandler)
	if err != nil {
		log.Fatalf("failed to init webauthn: %v", err)
	}
	waGroup := api.Group("/webauthn")
	waGroup.POST("/register/begin", waHandler.BeginRegistration, authHandler.RequireAuth)
	waGroup.POST("/register/finish", waHandler.FinishRegistration, authHandler.RequireAuth)
	waGroup.POST("/login/begin", waHandler.BeginLogin)
	waGroup.POST("/login/finish", waHandler.FinishLogin)

	processHandler := process.NewHandler(db, procManager)
	processGroup := api.Group("/processes", authHandler.RequireAuth)
	processGroup.GET("", processHandler.List)
	processGroup.POST("", processHandler.Start)
	processGroup.DELETE("/:id", processHandler.Stop)

	processGroup.GET("", processHandler.List)
	processGroup.GET("/:id", processHandler.Get)
	processGroup.POST("", processHandler.Start)
	processGroup.DELETE("/:id", processHandler.Stop)

	processGroup.GET("", processHandler.List)
	processGroup.GET("/:id", processHandler.Get)
	processGroup.POST("", processHandler.Start)
	processGroup.PATCH("/:id/settings", processHandler.UpdateSettings)
	processGroup.DELETE("/:id", processHandler.Delete)
	processGroup.POST("/:id/update", processHandler.CheckUpdate)

	processGroup.POST("/:id/run", processHandler.RunProcess)
	processGroup.POST("/:id/stop", processHandler.StopProcess)
	processGroup.GET("/:id/logs", processHandler.GetLogs)
	processGroup.POST("/:id/logs/clear", processHandler.ClearLogs)

	processGroup.POST("/:id/logout", processHandler.LogoutSession)

	distFiles := echo.MustSubFS(distFS, "dist")

	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:       ".",
		Filesystem: http.FS(distFiles),
		HTML5:      true, // falls back to index.html for unmatched routes (SPA routing)
	}))

	// graceful shutdown — ensure all children are stopped on exit
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
