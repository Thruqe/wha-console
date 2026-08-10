# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/web
COPY web/package.json web/bun.lock* ./
RUN npm install
COPY web/ ./
RUN npm run build

# Stage 2: Build Go Backend
FROM golang:1.22-alpine AS builder
RUN apk add --no-cache gcc musl-dev
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=frontend-builder /app/web/dist ./dist
RUN CGO_ENABLED=1 GOOS=linux go build -ldflags="-s -w" -o wha-console .

# Stage 3: Runtime
FROM alpine:3.19
RUN apk add --no-cache ca-certificates tzdata sqlite
WORKDIR /app
COPY --from=builder /app/wha-console /app/wha-console

EXPOSE 8080
CMD ["/app/wha-console"]
