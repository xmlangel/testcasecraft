#!/bin/bash
echo "Stopping Docker Compose services in docker-compose-dev..."
docker compose -f docker-compose.dev.yml down
if [ $? -eq 0 ]; then
    echo "Docker Compose services stopped successfully."
else
    echo "Failed to stop Docker Compose services."
fi
