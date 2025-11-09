#!/bin/bash

# Docker 볼륨 문제 해결 스크립트

echo "🧹 1단계: 기존 컨테이너 정리..."
docker-compose down -v

echo ""
echo "🔍 2단계: Docker 볼륨 확인..."
docker volume ls | grep docker-compose-dev-spring

echo ""
echo "🗑️ 3단계: 문제가 있는 볼륨 제거..."
docker volume rm docker-compose-dev-spring_postgres-rag-data 2>/dev/null || true
docker volume rm docker-compose-dev-spring_minio-data 2>/dev/null || true

echo ""
echo "🧹 4단계: 사용하지 않는 Docker 리소스 정리..."
docker system prune -f

echo ""
echo "🔍 5단계: 볼륨 재확인..."
docker volume ls

echo ""
echo "✅ 정리 완료! 이제 다시 시작하세요:"
echo "   docker-compose up -d"
