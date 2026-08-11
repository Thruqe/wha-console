FROM oven/bun:latest AS frontend-builder
WORKDIR /app/web
COPY web/package.json web/bun.lock* ./
RUN bun install
COPY web/ ./
RUN bun run build

FROM golang:1.26-alpine AS builder
RUN apk add --no-cache gcc musl-dev
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=frontend-builder /app/dist ./dist
RUN CGO_ENABLED=1 GOOS=linux go build -ldflags="-s -w" -o wha-console .

FROM alpine:latest
RUN apk add --no-cache ca-certificates tzdata sqlite
WORKDIR /app
COPY --from=builder /app/wha-console /app/wha-console
COPY bin/ /app/bin/
RUN chmod +x /app/bin/whatsrook
RUN mkdir -p /app/logs
EXPOSE 8080
CMD ["/app/wha-console"]
