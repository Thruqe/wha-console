// config/config.go
package config

import (
	"os"
	"strconv"
	"strings"
)

type Config struct {
	DevMode               bool
	Port                  string
	DBDriver              string
	DBDSN                 string
	JWTSecret             string
	CookieSecure          bool
	WebAuthnRPID          string
	WebAuthnRPDisplayName string
	WebAuthnRPOrigins     []string
	RedisAddr             string
}

// config/config.go
func Load() *Config {
	devMode := getBoolEnv("DEV_MODE", true)

	origins := parseSliceEnv("WEBAUTHN_RP_ORIGINS", []string{"http://localhost:8080"})

	return &Config{
		DevMode:               devMode,
		Port:                  getEnv("PORT", "8080"),
		DBDriver:              getEnv("DB_DRIVER", "sqlite"),
		DBDSN:                 getEnv("DB_DSN", "wha-console.db"),
		JWTSecret:             getEnv("JWT_SECRET", ""),
		CookieSecure:          !devMode,
		WebAuthnRPID:          getEnv("WEBAUTHN_RP_ID", "localhost"),
		WebAuthnRPDisplayName: getEnv("WEBAUTHN_RP_DISPLAY_NAME", "wha-console"),
		WebAuthnRPOrigins:     origins,
		RedisAddr:             getEnv("REDIS_ADDR", "localhost:6379"),
	}
}

func parseSliceEnv(key string, fallback []string) []string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}

	rawOrigins := strings.Split(val, ",")
	var origins []string
	for _, o := range rawOrigins {
		if trimmed := strings.TrimSpace(o); trimmed != "" {
			origins = append(origins, trimmed)
		}
	}
	return origins
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}

func getBoolEnv(key string, fallback bool) bool {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(val)
	if err != nil {
		return fallback
	}
	return parsed
}
