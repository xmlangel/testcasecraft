#!/bin/bash

# PostgreSQL 15 → 18 업그레이드 스크립트 (데이터 보존)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BACKUP_DIR="./backup"
DUMP_FILE="$BACKUP_DIR/postgres15_dump.sql"
OLD_DATA_DIR="./data/postgres"
OLD_DATA_BACKUP="$BACKUP_DIR/postgres15_data_$(date +%Y%m%d_%H%M%S)"

echo "🔄 PostgreSQL 15 → 18 업그레이드 시작"
echo "========================================"
echo ""

# 1. 백업 디렉토리 생성
echo "📁 1단계: 백업 디렉토리 생성..."
mkdir -p "$BACKUP_DIR"
echo "✅ 백업 디렉토리 생성 완료: $BACKUP_DIR"
echo ""

# 2. 기존 컨테이너 중지
echo "🛑 2단계: 기존 컨테이너 중지..."
docker-compose down 2>/dev/null || true
echo "✅ 컨테이너 중지 완료"
echo ""

# 3. PostgreSQL 15 임시 컨테이너로 데이터 덤프
echo "💾 3단계: PostgreSQL 15 데이터 덤프 중..."
if [ -d "$OLD_DATA_DIR" ]; then
    echo "   기존 데이터 디렉토리 발견: $OLD_DATA_DIR"

    # PostgreSQL 15 임시 컨테이너 시작
    docker run --name postgres15_temp \
        -e POSTGRES_USER=testcase_user \
        -e POSTGRES_PASSWORD=testcase_password \
        -v "$SCRIPT_DIR/$OLD_DATA_DIR:/var/lib/postgresql/data" \
        -d postgres:15

    echo "   PostgreSQL 15 임시 컨테이너 시작 대기 중..."
    sleep 10

    # 데이터 덤프
    echo "   덤프 파일 생성 중: $DUMP_FILE"
    docker exec postgres15_temp pg_dumpall -U testcase_user > "$DUMP_FILE"

    # 임시 컨테이너 중지 및 삭제
    docker stop postgres15_temp
    docker rm postgres15_temp

    echo "✅ 데이터 덤프 완료: $DUMP_FILE"
    echo "   덤프 파일 크기: $(du -h "$DUMP_FILE" | cut -f1)"
else
    echo "⚠️  기존 데이터 디렉토리 없음. 덤프 건너뛰기."
fi
echo ""

# 4. 기존 데이터 디렉토리 백업 및 제거
echo "📦 4단계: 기존 데이터 디렉토리 백업..."
if [ -d "$OLD_DATA_DIR" ]; then
    mv "$OLD_DATA_DIR" "$OLD_DATA_BACKUP"
    echo "✅ 기존 데이터 백업 완료: $OLD_DATA_BACKUP"
else
    echo "   기존 데이터 디렉토리 없음"
fi
echo ""

# 5. docker-compose.yml 백업 및 PostgreSQL 18로 변경
echo "📝 5단계: docker-compose.yml 업데이트..."
cp docker-compose-dev.yml docker-compose-dev.yml.backup
sed -i.bak 's/image: postgres:15/image: postgres:18/g; s/image: postgres:16/image: postgres:18/g' docker-compose-dev.yml
rm -f docker-compose-dev.yml.bak
echo "✅ PostgreSQL 18로 변경 완료"
echo ""

# 6. PostgreSQL 18 컨테이너 시작
echo "🚀 6단계: PostgreSQL 18 컨테이너 시작..."
docker-compose up -d postgres
echo "   PostgreSQL 18 초기화 대기 중..."
sleep 15

# 헬스체크
echo "   헬스체크 중..."
MAX_ATTEMPTS=30
ATTEMPT=1
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if docker-compose exec -T postgres pg_isready -U testcase_user 2>/dev/null; then
        echo "✅ PostgreSQL 18 준비 완료!"
        break
    fi

    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        echo "❌ PostgreSQL 18 시작 실패"
        exit 1
    fi

    echo "   대기 중... ($ATTEMPT/$MAX_ATTEMPTS)"
    sleep 2
    ((ATTEMPT++))
done
echo ""

# 7. 덤프 데이터 복원
if [ -f "$DUMP_FILE" ]; then
    echo "📥 7단계: 데이터 복원 중..."
    docker-compose exec -T postgres psql -U testcase_user -d postgres < "$DUMP_FILE"
    echo "✅ 데이터 복원 완료!"
else
    echo "⚠️  덤프 파일 없음. 데이터 복원 건너뛰기."
fi
echo ""

# 8. 검증
echo "🔍 8단계: 업그레이드 검증..."
echo "   PostgreSQL 버전 확인:"
docker-compose exec -T postgres psql -U testcase_user -d testcase_management -c "SELECT version();" || true
echo ""
echo "   데이터베이스 목록:"
docker-compose exec -T postgres psql -U testcase_user -d postgres -c "\l" || true
echo ""

# 완료
echo "========================================"
echo "✅ PostgreSQL 업그레이드 완료!"
echo ""
echo "📋 백업 정보:"
echo "   - 덤프 파일: $DUMP_FILE"
echo "   - 기존 데이터: $OLD_DATA_BACKUP"
echo ""
echo "🚀 다음 단계:"
echo "   1. 데이터 확인: docker-compose exec postgres psql -U testcase_user -d testcase_management"
echo "   2. 전체 애플리케이션 시작: ./start.sh start"
echo ""
