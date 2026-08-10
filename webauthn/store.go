// webauthn/store.go
package webauthn

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

type sessionStore struct {
	rdb *redis.Client
}

func newSessionStore(addr string) *sessionStore {
	return &sessionStore{
		rdb: redis.NewClient(&redis.Options{Addr: addr}),
	}
}

func (s *sessionStore) save(key string, sd *webauthn.SessionData) error {
	b, err := json.Marshal(sd)
	if err != nil {
		return err
	}
	return s.rdb.Set(ctx, sessionKey(key), b, 5*time.Minute).Err()
}

func (s *sessionStore) get(key string) (*webauthn.SessionData, bool) {
	val, err := s.rdb.Get(ctx, sessionKey(key)).Result()
	if err != nil {
		return nil, false
	}
	s.rdb.Del(ctx, sessionKey(key)) // one-time use

	var sd webauthn.SessionData
	if err := json.Unmarshal([]byte(val), &sd); err != nil {
		return nil, false
	}
	return &sd, true
}

func sessionKey(key string) string {
	return fmt.Sprintf("webauthn:session:%s", key)
}
