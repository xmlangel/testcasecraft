#!/bin/sh
# docker-entrypoint.sh — JWT_SECRET 자동 생성/재사용 후 앱 실행.
#
# 동작:
#   - JWT_SECRET 이 설정돼 있으면 그대로 사용 (잘못된 값은 앱 시작 검증에서 fail-fast).
#   - 미설정/빈 값이면:
#       1) ${JWT_SECRET_FILE} (기본 /app/data/jwt-secret) 이 있으면 재사용
#       2) 없으면 512비트 키를 생성해 파일로 저장(0600) 후 사용
#     → 볼륨(./data/app:/app/data)을 마운트하면 컨테이너 재생성에도 키가 유지되어
#       로그인 세션이 끊기지 않는다.
set -e

JWT_SECRET_FILE="${JWT_SECRET_FILE:-/app/data/jwt-secret}"

if [ -z "${JWT_SECRET}" ]; then
  if [ -s "${JWT_SECRET_FILE}" ]; then
    echo "[entrypoint] JWT_SECRET not set — reusing persisted secret: ${JWT_SECRET_FILE}"
    JWT_SECRET="$(cat "${JWT_SECRET_FILE}")"
  else
    echo "[entrypoint] JWT_SECRET not set — generating a new 512-bit secret"
    JWT_SECRET="$(head -c 64 /dev/urandom | base64 | tr -d '\n')"
    if mkdir -p "$(dirname "${JWT_SECRET_FILE}")" 2>/dev/null \
        && ( umask 077 && printf '%s' "${JWT_SECRET}" > "${JWT_SECRET_FILE}" ) 2>/dev/null; then
      echo "[entrypoint] Persisted to ${JWT_SECRET_FILE} — reused across restarts"
    else
      echo "[entrypoint] WARNING: could not persist to ${JWT_SECRET_FILE}." \
        "A new secret will be generated on every restart and all sessions will be invalidated." \
        "Mount a writable volume at $(dirname "${JWT_SECRET_FILE}") or set JWT_SECRET explicitly." >&2
    fi
  fi
  export JWT_SECRET
fi

exec "$@"
