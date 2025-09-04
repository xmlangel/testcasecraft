#!/bin/bash
echo "Starting Docker Compose services in docker-compose-dev..."
docker compose -f docker-compose.dev.yml up -d
if [ $? -eq 0 ]; then
    echo "Docker Compose services started successfully."
else
    echo "Failed to start Docker Compose services."
fi
