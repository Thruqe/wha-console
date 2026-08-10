package schema

import (
	"github.com/go-webauthn/webauthn/webauthn"
)

// WebAuthnID, WebAuthnName, etc. make User satisfy webauthn.User.
func (u User) WebAuthnID() []byte {
	return []byte(u.ID)
}

func (u User) WebAuthnName() string {
	return u.Username
}

func (u User) WebAuthnDisplayName() string {
	return u.Username
}

func (u User) WebAuthnCredentials() []webauthn.Credential {
	creds := make([]webauthn.Credential, len(u.Credentials))
	for i, c := range u.Credentials {
		creds[i] = webauthn.Credential{
			ID:              c.CredentialID,
			PublicKey:       c.PublicKey,
			AttestationType: c.AttestationType,
			Authenticator: webauthn.Authenticator{
				SignCount: c.SignCount,
			},
		}
	}
	return creds
}
