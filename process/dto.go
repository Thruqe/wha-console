package process

import (
	"time"

	"wha-console/schema"
)

type CreateRequest struct {
	Name        string            `json:"name"`
	PhoneNumber string            `json:"phone_number"`
	AuthType    schema.AuthType   `json:"auth_type"`
	Client      schema.ClientType `json:"client"`
	DatabaseURL string            `json:"database_url"`
}

type UpdateSettingsRequest struct {
	Verbose   *bool `json:"verbose"`
	NoSkipOld *bool `json:"no_skip_old"`
}

func (r CreateRequest) Validate() error {
	if r.Name == "" {
		return errRequired("name")
	}
	if r.PhoneNumber == "" {
		return errRequired("phone_number")
	}
	if r.AuthType != schema.AuthTypePair && r.AuthType != schema.AuthTypeQR {
		return errInvalid("auth_type", "pair", "qr")
	}
	switch r.Client {
	case schema.ClientChrome, schema.ClientAndroid, schema.ClientIOS:
		// ok
	default:
		return errInvalid("client", "chrome", "android", "ios")
	}
	return validatePostgresURL(r.DatabaseURL)
}

// CardResponse is what the dashboard list shows — phone number masked.
type CardResponse struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	PhoneMasked string    `json:"phone_masked"`
	AuthType    string    `json:"auth_type"`
	Client      string    `json:"client"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

func toCardResponse(s schema.Session) CardResponse {
	return CardResponse{
		ID:          s.ID,
		Name:        s.Name,
		PhoneMasked: s.PhoneNumberMasked(),
		AuthType:    string(s.AuthType),
		Client:      string(s.Client),
		Status:      s.Status,
		CreatedAt:   s.CreatedAt,
	}
}

// DetailResponse is the full view — shown only inside the process's own page.
type DetailResponse struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	PhoneNumber string    `json:"phone_number"` // full number here, per detail-page rule
	AuthType    string    `json:"auth_type"`
	Client      string    `json:"client"`
	Status      string    `json:"status"`
	Verbose     bool      `json:"verbose"`
	NoSkipOld   bool      `json:"no_skip_old"`
	CreatedAt   time.Time `json:"created_at"`
}

func toDetailResponse(s schema.Session) DetailResponse {
	return DetailResponse{
		ID:          s.ID,
		Name:        s.Name,
		PhoneNumber: s.PhoneNumber,
		AuthType:    string(s.AuthType),
		Client:      string(s.Client),
		Status:      s.Status,
		Verbose:     s.Verbose,
		NoSkipOld:   s.NoSkipOld,
		CreatedAt:   s.CreatedAt,
	}
}

func errRequired(field string) error {
	return &fieldError{field: field, msg: field + " is required"}
}

func errInvalid(field string, allowed ...string) error {
	return &fieldError{field: field, msg: field + " must be one of: " + joinStrings(allowed)}
}

type fieldError struct {
	field string
	msg   string
}

func (e *fieldError) Error() string { return e.msg }

func joinStrings(items []string) string {
	out := ""
	for i, s := range items {
		if i > 0 {
			out += ", "
		}
		out += s
	}
	return out
}
