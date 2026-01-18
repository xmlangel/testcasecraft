# Build stage
FROM python:3.11-slim AS builder

# 메타데이터 레이블 추가
LABEL description="TestCaseCraft RAG Service API"

WORKDIR /app

# 빌드에 필요한 시스템 의존성 설치
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python 가상환경 생성 (더 깔끔한 의존성 관리)
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# requirements.txt만 먼저 복사 (레이어 캐싱 최적화)
COPY requirements.txt .

# Python 종속성 설치 (wheel 빌드)
RUN pip install --no-cache-dir --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt && \
    find /opt/venv -type d -name __pycache__ -exec rm -rf {} + && \
    find /opt/venv -type f -name '*.pyc' -delete && \
    find /opt/venv -type f -name '*.pyo' -delete

# 애플리케이션 코드 복사 (마지막에 복사하여 코드 변경 시 캐시 활용)
COPY ./app /app/app


# Runtime stage
FROM python:3.11-slim

# 메타데이터 레이블
LABEL description="TestCaseCraft RAG Service API"

# 런타임 종속성만 설치 (psycopg2용 libpq, 헬스체크용 curl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 빌드 스테이지에서 가상환경 복사 (더 작은 사이즈)
COPY --from=builder /opt/venv /opt/venv

# 애플리케이션 코드 복사
COPY --from=builder /app/app /app/app

# 가상환경 PATH 설정
ENV PATH="/opt/venv/bin:$PATH"

# Python 최적화 플래그
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONOPTIMIZE=1

# 비루트 사용자 생성 및 소유권 설정
RUN useradd -m -u 1000 raguser && \
    chown -R raguser:raguser /app

USER raguser

EXPOSE 8000

# 헬스체크 추가 (30초마다 체크, 3번 실패시 unhealthy)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Uvicorn 실행 (프로덕션 설정)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]

