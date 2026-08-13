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
	ID               uint      `json:"id"`
	Name             string    `json:"name"`
	PhoneMasked      string    `json:"phone_masked"`
	AuthType         string    `json:"auth_type"`
	Client           string    `json:"client"`
	Status           string    `json:"status"`
	WaitlistPosition int       `json:"waitlist_position,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
}

func toCardResponse(s schema.Session, waitlistPos ...int) CardResponse {
	pos := 0
	if len(waitlistPos) > 0 {
		pos = waitlistPos[0]
	}
	return CardResponse{
		ID:               s.ID,
		Name:             s.Name,
		PhoneMasked:      s.PhoneNumberMasked(),
		AuthType:         string(s.AuthType),
		Client:           string(s.Client),
		Status:           s.Status,
		WaitlistPosition: pos,
		CreatedAt:        s.CreatedAt,
	}
}

// DetailResponse is the full view — shown only inside the process's own page.
type DetailResponse struct {
	ID               uint      `json:"id"`
	Name             string    `json:"name"`
	PhoneNumber      string    `json:"phone_number"`
	AuthType         string    `json:"auth_type"`
	Client           string    `json:"client"`
	Status           string    `json:"status"`
	WaitlistPosition int       `json:"waitlist_position,omitempty"`
	Verbose          bool      `json:"verbose"`
	NoSkipOld        bool      `json:"no_skip_old"`
	HasRunBefore     bool      `json:"has_run_before"`
	CreatedAt        time.Time `json:"created_at"`
}

func toDetailResponse(s schema.Session, waitlistPos ...int) DetailResponse {
	pos := 0
	if len(waitlistPos) > 0 {
		pos = waitlistPos[0]
	}
	return DetailResponse{
		ID:               s.ID,
		Name:             s.Name,
		PhoneNumber:      s.PhoneNumber,
		AuthType:         string(s.AuthType),
		Client:           string(s.Client),
		Status:           s.Status,
		WaitlistPosition: pos,
		Verbose:          s.Verbose,
		NoSkipOld:        s.NoSkipOld,
		HasRunBefore:     s.HasRunBefore,
		CreatedAt:        s.CreatedAt,
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

type ActivityPoint struct {
	Hour string `json:"hour"`
	Sent int64  `json:"sent"`
	Recv int64  `json:"recv"`
}

type BotStatsResponse struct {
	PushName         string          `json:"push_name"`
	PhoneNumber      string          `json:"phone_number"`
	JID              string          `json:"jid"`
	LID              string          `json:"lid"`
	ProfilePhotoURL  string          `json:"profile_photo_url"`
	MessagesSent     int64           `json:"messages_sent"`
	MessagesReceived int64           `json:"messages_received"`
	GroupsCount      int64           `json:"groups_count"`
	CommunitiesCount int64           `json:"communities_count"`
	ContactsCount    int64           `json:"contacts_count"`
	ActivityGraph    []ActivityPoint `json:"activity_graph"`
}

type GroupItemResponse struct {
	Name         string `json:"name"`
	JID          string `json:"jid"`
	MembersCount int    `json:"membersCount"`
	IsAdmin      bool   `json:"isAdmin"`
	CreatedAt    string `json:"createdAt"`
	Description  string `json:"description"`
}

type ContactItemResponse struct {
	PushName    string `json:"pushName"`
	PhoneNumber string `json:"phoneNumber"`
	JID         string `json:"jid"`
	Status      string `json:"status"`
}

type CommunityItemResponse struct {
	Name           string `json:"name"`
	JID            string `json:"jid"`
	SubGroupsCount int    `json:"subGroupsCount"`
	TotalMembers   int    `json:"totalMembers"`
	Description    string `json:"description"`
}
