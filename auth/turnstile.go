// auth/turnstile.go
package auth

import (
	"encoding/json"
	"net/http"
	"net/url"
	"os"
	"time"
)

type turnstileVerifyResponse struct {
	Success     bool     `json:"success"`
	ErrorCodes  []string `json:"error-codes"`
	ChallengeTS string   `json:"challenge_ts"`
	Hostname    string   `json:"hostname"`
}

// VerifyTurnstile verifies Cloudflare Turnstile tokens against Cloudflare's API.
func VerifyTurnstile(responseToken, remoteIP string) bool {
	secretKey := os.Getenv("TURNSTILE_SECRET_KEY")
	if secretKey == "" {
		// If secret key is not set, pass verification (dev mode default)
		return true
	}

	if responseToken == "" {
		return false
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.PostForm("https://challenges.cloudflare.com/turnstile/v0/siteverify", url.Values{
		"secret":   {secretKey},
		"response": {responseToken},
		"remoteip": {remoteIP},
	})
	if err != nil {
		return false
	}
	defer resp.Body.Close()

	var res turnstileVerifyResponse
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return false
	}

	return res.Success
}
