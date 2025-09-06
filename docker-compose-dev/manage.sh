#!/bin/bash

ACTION=$1
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env" # 로컬 .env 파일 사용

if [ -z "$ACTION" ]; then
    echo "Usage: ./manage.sh [start|stop|restart|status|ssl-cert|logs]"
    exit 1
fi

case "$ACTION" in
    start)
        echo "🚀 Starting Docker Compose services with Nginx..."
        # SSL 인증서 확인
        if [ ! -f "./nginx/ssl/cert.pem" ] || [ ! -f "./nginx/ssl/key.pem" ]; then
            echo "⚠️ SSL 인증서가 없습니다. 자체 서명 인증서를 생성합니다..."
            ./nginx/ssl/generate-cert.sh
        fi
        
        docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d
        if [ $? -eq 0 ]; then
            echo "✅ Docker Compose services started successfully."
            echo ""
            echo "🌐 접속 URL:"
            echo "   HTTP:  http://192.168.29.184"
            echo "   HTTPS: https://192.168.29.184"
            echo "   API:   https://192.168.29.120/api/"
            echo ""
            echo "📊 서비스 상태 확인: ./manage.sh status"
        else
            echo "❌ Failed to start Docker Compose services."
        fi
        ;;
    stop)
        echo "🛑 Stopping Docker Compose services..."
        docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" down
        if [ $? -eq 0 ]; then
            echo "✅ Docker Compose services stopped successfully."
        else
            echo "❌ Failed to stop Docker Compose services."
        fi
        ;;
    restart)
        echo "🔄 Restarting Docker Compose services..."
        docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" restart
        if [ $? -eq 0 ]; then
            echo "✅ Docker Compose services restarted successfully."
        else
            echo "❌ Failed to restart Docker Compose services."
        fi
        ;;
    status)
        echo "📊 Docker Compose services status:"
        docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
        echo ""
        echo "📝 Nginx logs (마지막 10줄):"
        docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs --tail=10 nginx
        ;;
    ssl-cert)
        echo "🔐 SSL 인증서 재생성..."
        ./nginx/ssl/generate-cert.sh
        echo "🔄 Nginx 재시작..."
        docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" restart nginx
        echo "✅ SSL 인증서 업데이트 완료."
        ;;
    logs)
        echo "📝 서비스 로그:"
        docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" logs -f
        ;;
    *)
        echo "❌ Invalid action: $ACTION"
        echo "Usage: ./manage.sh [start|stop|restart|status|ssl-cert|logs]"
        exit 1
        ;;
esac
