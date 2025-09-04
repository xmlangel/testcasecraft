#!/bin/bash

ACTION=$1
COMPOSE_FILE="docker-compose.dev.yml"

if [ -z "$ACTION" ]; then
    echo "Usage: ./manage.sh [start|stop]"
    exit 1
fi

case "$ACTION" in
    start)
        echo "Starting Docker Compose services in docker-compose-dev..."
        docker compose -f "$COMPOSE_FILE" up -d
        if [ $? -eq 0 ]; then
            echo "Docker Compose services started successfully."
        else
            echo "Failed to start Docker Compose services."
        fi
        ;;
    stop)
        echo "Stopping Docker Compose services in docker-compose-dev..."
        docker compose -f "$COMPOSE_FILE" down
        if [ $? -eq 0 ]; then
            echo "Docker Compose services stopped successfully."
        else
            echo "Failed to stop Docker Compose services."
        fi
        ;;
    *)
        echo "Invalid action: $ACTION"
        echo "Usage: ./manage.sh [start|stop]"
        exit 1
        ;;
esac
