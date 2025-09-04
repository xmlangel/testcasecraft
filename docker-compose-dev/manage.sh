#!/bin/bash

ACTION=$1
COMPOSE_FILE="docker-compose.yml"
ENV_FILE="../.env.dev" # Path to .env.dev relative to docker-compose-dev directory

if [ -z "$ACTION" ]; then
    echo "Usage: ./manage.sh [start|stop|status]"
    exit 1
fi

case "$ACTION" in
    start)
        echo "Starting Docker Compose services in docker-compose-dev using $ENV_FILE..."
        CURRENT_DIR=$(pwd)
        cd docker-compose-dev
        docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d
        cd "$CURRENT_DIR"
        if [ $? -eq 0 ]; then
            echo "Docker Compose services started successfully."
        else
            echo "Failed to start Docker Compose services."
        fi
        ;;
    stop)
        echo "Stopping Docker Compose services in docker-compose-dev using $ENV_FILE..."
        CURRENT_DIR=$(pwd)
        cd docker-compose-dev
        docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down
        cd "$CURRENT_DIR"
        if [ $? -eq 0 ]; then
            echo "Docker Compose services stopped successfully."
        else
            echo "Failed to stop Docker Compose services."
        fi
        ;;
    status)
        echo "Checking Docker Compose services status in docker-compose-dev..."
        CURRENT_DIR=$(pwd)
        cd docker-compose-dev
        docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
        cd "$CURRENT_DIR"
        ;;
    *)
        echo "Invalid action: $ACTION"
        echo "Usage: ./manage.sh [start|stop|status]"
        exit 1
        ;;
esac
