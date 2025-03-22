#!/bin/bash
APP_NAME="plant-care-be"
APP_VERSION="0.0.1"

echo "Stopping and removing existing container..."
docker stop $APP_NAME 2>/dev/null || true
docker rm $APP_NAME 2>/dev/null || true

echo "Building Docker image..."
docker build -t $APP_NAME:$APP_VERSION .

echo "Starting container..."
docker run -d \
    --name $APP_NAME \
    -p 8080:8080 \
    -e POSTGRES_HOST=localhost \
    -e POSTGRES_PORT=5432 \
    -e POSTGRES_DB=mobile \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -e MONGODB_URI=mongodb://localhost:27017/mobile \
    $APP_NAME:$APP_VERSION

echo "Container started! Application is running on http://localhost:8080"
