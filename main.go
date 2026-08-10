package main

import (
	"embed"
	"log"
	"net/http"

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

	processHandler := process.NewHandler(db)
	processGroup := api.Group("/processes", authHandler.RequireAuth)
	processGroup.GET("", processHandler.List)
	processGroup.POST("", processHandler.Start)
	processGroup.DELETE("/:id", processHandler.Stop)

	// --- Static frontend (built by Vite, embedded in the binary) ---
	distFiles := echo.MustSubFS(distFS, "dist")

	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:       ".",
		Filesystem: http.FS(distFiles),
		HTML5:      true, // falls back to index.html for unmatched routes (SPA routing)
	}))

	log.Printf("starting server on :%s (dev mode: %v)", cfg.Port, cfg.DevMode)
	e.Logger.Fatal(e.Start(":" + cfg.Port))
}

func healthCheck(c echo.Context) error {
	return c.JSON(200, map[string]string{"status": "ok"})
}
