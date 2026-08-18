package schema

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

// JSON is a portable JSON column type that works on both Postgres (JSONB) and SQLite (TEXT).
type JSON map[string]any

func (j JSON) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

func (j *JSON) Scan(value any) error {
	if value == nil {
		*j = JSON{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		if s, ok := value.(string); ok {
			bytes = []byte(s)
		} else {
			return errors.New("failed to scan JSON value")
		}
	}
	return json.Unmarshal(bytes, j)
}
