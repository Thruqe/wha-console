# WHA-Console

Super simple console management system for managing multiple whatsrook sessions.

---

## Environment Configuration

Configure the application using the following environment variables (defined in `.env` or system environment):

| Environment Variable | Description | Default | Required |
| --- | --- | --- | --- |
| `DEV_MODE` | Enables debug mode and HTTP cookie settings | `true` | No |
| `DB_DRIVER` | Database driver name (e.g. `sqlite`) | `sqlite` | No |
| `DB_DSN` | Database connection string or path to file | `wha-console.db` | No |
| `PORT` | HTTP server port | `8080` | No |
| `JWT_SECRET` | Secret key used for signing JWT tokens | _None_ | **Yes** |
| `REDIS_ADDR` | Host and port for Redis cache / session storage | `localhost:6379` | No |
| `WEBAUTHN_RP_ID` | Relying Party ID for WebAuthn passkeys | `localhost` | **Yes** |
| `WEBAUTHN_RP_DISPLAY_NAME` | Relying Party display name | `WHA-Console` | No |
| `WEBAUTHN_RP_ORIGINS` | Comma-separated list of allowed origins for WebAuthn | `http://localhost:8080` | **Yes** |

---

## Deployment & Running

### Docker Compose
Run locally with Redis service:
```bash
docker-compose up --build
```

### Heroku Container Stack
This repository is configured for Heroku deployments using the **container** stack (utilizing `Dockerfile` and `app.json`):

```bash
heroku stack:set container -a your-app-name
git push heroku master
```

---

## Roadmap

- [x] Initial Go & Echo backend architecture
- [x] WebAuthn passkey authentication & JWT auth flow
- [x] Embedded Single Page Application (SPA) frontend build
- [x] Docker & Docker Compose setup
- [x] Heroku Container stack support (`app.json` + `Dockerfile`)
- [ ] Session process monitoring & metrics dashboard
- [ ] Multi-tenant role management & permission control

---

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## License

This project is licensed under the [MIT License](LICENSE).
