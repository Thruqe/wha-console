# WHA-Console

Super simple console management system for managing multiple whatsrook sessions.

## Environment Configuration

Configure the application using the following environment variables (defined in `.env` or system environment):

| Environment Variable       | Description                                          | Default                 | Required |
| -------------------------- | ---------------------------------------------------- | ----------------------- | -------- |
| `DEV_MODE`                 | Enables debug mode and HTTP cookie settings          | `true`                  | No       |
| `DB_DRIVER`                | Database driver name (e.g. `sqlite`)                 | `sqlite`                | No       |
| `DB_DSN`                   | Database connection string or path to file           | `wha-console.db`        | No       |
| `PORT`                     | HTTP server port                                     | `8080`                  | No       |
| `JWT_SECRET`               | Secret key used for signing JWT tokens               | _None_                  | **Yes**  |
| `REDIS_ADDR`               | Host and port for Redis cache / session storage      | `localhost:6379`        | No       |
| `WEBAUTHN_RP_ID`           | Relying Party ID for WebAuthn passkeys               | `localhost`             | **Yes**  |
| `WEBAUTHN_RP_DISPLAY_NAME` | Relying Party display name                           | `WHA-Console`           | No       |
| `WEBAUTHN_RP_ORIGINS`      | Comma-separated list of allowed origins for WebAuthn | `http://localhost:8080` | **Yes**  |

## Roadmap

- [x] Initial Go & Echo backend architecture
- [x] WebAuthn passkey authentication & JWT auth flow
- [x] Embedded Single Page Application (SPA) frontend build
- [ ] Session process monitoring & metrics dashboard
- [ ] Multi-tenant role management & permission control

## Contributing

You are welcome to contribute, Check out [Pull Requests](https://github.com/Thruqe/wha-console/pulls).

## License

This project is licensed under the [MIT License](LICENSE).
