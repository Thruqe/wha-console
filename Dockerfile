FROM oven/bun:latest AS frontend-builder
WORKDIR /app/web
COPY web/package.json web/bun.lock* ./
RUN bun install
COPY web/ ./
RUN bun run build

FROM golang:1.26-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=frontend-builder /app/dist ./dist
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o wha-console .

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates tzdata sqlite3 curl tar \
    ffmpeg python3 python3-pip && \
    pip3 install --no-cache-dir --break-system-packages yt-dlp && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/wha-console /app/wha-console
COPY bin/ /app/bin/
RUN mkdir -p /app/bin && \
    curl -fsSL https://github.com/Thruqe/whatsrook/releases/download/alpha/whatsrook-linux-amd64.tar.gz | tar -xz --overwrite -C /app/bin/ && \
    chmod +x /app/bin/whatsrook
RUN mkdir -p /app/logs
EXPOSE 8080
CMD ["/app/wha-console"]
