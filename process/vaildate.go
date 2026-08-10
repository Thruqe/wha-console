package process

import (
	"errors"
	"net/url"
	"strings"
)

func validatePostgresURL(dsn string) error {
	if dsn == "" {
		return errors.New("database URL is required")
	}
	u, err := url.Parse(dsn)
	if err != nil {
		return errors.New("invalid database URL")
	}
	scheme := strings.ToLower(u.Scheme)
	if scheme != "postgres" && scheme != "postgresql" {
		return errors.New("database URL must be a postgres connection string")
	}
	return nil
}