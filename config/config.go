package config

import (
	"os"
	"strconv"
)

type Config struct {
	DevMode            bool
	Port               string
	DBDriver           string
	DBDSN              string
	JWTSecret          string
	CookieSecure       bool
	GitHubClientID     string
	GitHubClientSecret string
	GitHubRedirectURL  string
	RedisAddr          string
	RAMPerProcessMB    uint64
	MaxRAMPercent      float64
	MaxProcesses       int
}

func Load() *Config {
	devMode := getBoolEnv("DEV_MODE", true)

	return &Config{
		DevMode:            devMode,
		Port:               getEnv("PORT", "8080"),
		DBDriver:           getEnv("DB_DRIVER", "sqlite"),
		DBDSN:              getEnv("DB_DSN", "wha-console.db"),
		JWTSecret:          getEnv("JWT_SECRET", ""),
		CookieSecure:       !devMode,
		GitHubClientID:     getEnv("GITHUB_CLIENT_ID", ""),
		GitHubClientSecret: getEnv("GITHUB_CLIENT_SECRET", ""),
		GitHubRedirectURL:  getEnv("GITHUB_REDIRECT_URL", "http://localhost:8080/api/auth/github/callback"),
		RedisAddr:          getEnv("REDIS_ADDR", "localhost:6379"),
		RAMPerProcessMB:    getUint64Env("RAM_PER_PROCESS_MB", 150),
		MaxRAMPercent:      getFloat64Env("MAX_RAM_PERCENT", 80.0),
		MaxProcesses:       getIntEnv("MAX_PROCESSES", 0),
	}
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

func getIntEnv(key string, fallback int) int {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(val)
	if err != nil {
		return fallback
	}
	return parsed
}

func getUint64Env(key string, fallback uint64) uint64 {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	parsed, err := strconv.ParseUint(val, 10, 64)
	if err != nil {
		return fallback
	}
	return parsed
}

func getFloat64Env(key string, fallback float64) float64 {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	parsed, err := strconv.ParseFloat(val, 64)
	if err != nil {
		return fallback
	}
	return parsed
}
