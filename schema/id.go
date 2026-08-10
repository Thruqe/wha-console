// schema/id.go
package schema

import (
	"crypto/rand"
	"time"
)

const idCharset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

// GenerateUserID produces a YYYYMMDD-XXXX-XXXX style ID:
// registration date + two random 4-char uppercase alphanumeric groups.
func GenerateUserID() (string, error) {
	datePart := time.Now().UTC().Format("20060102")

	group1, err := randomGroup(4)
	if err != nil {
		return "", err
	}
	group2, err := randomGroup(4)
	if err != nil {
		return "", err
	}

	return datePart + "-" + group1 + "-" + group2, nil
}

func randomGroup(n int) (string, error) {
	b := make([]byte, n)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	for i, v := range b {
		b[i] = idCharset[int(v)%len(idCharset)]
	}
	return string(b), nil
}
