FROM golang:1.24-alpine3.21 AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o auth-service .
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/auth-service .
RUN mkdir -p /app/keys
EXPOSE 8080

ENV MONGO_URI=mongodb://mongo:27017

CMD ["./auth-service"]
