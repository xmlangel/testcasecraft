# 🐳 Docker 파일 공유 설정 가이드

## 📋 개요

운영환경에서 Docker 컨테이너와 호스트 간 JUnit 파일 업로드를 위한 완전한 설정 가이드입니다.

## 🔧 현재 설정 상태

### ✅ 이미 구성된 설정
- **Docker 볼륨 마운트**: `./docker_prod_data/uploads:/app/uploads`
- **Nginx 파일 크기 제한**: `client_max_body_size 100M`
- **애플리케이션 업로드 설정**: `junit.file.upload.dir: uploads/junit`
- **컨테이너 내부 디렉토리**: `/app/uploads/junit/`

### ⚠️ 추가 설정 필요
- **호스트 디렉토리 권한**: UID/GID 1001로 설정 필요
- **디렉토리 생성**: JUnit 하위 디렉토리 사전 생성 필요

## 🚀 배포 전 설정

### 1. 자동 설정 (권장)
```bash
# 모든 권한과 디렉토리를 자동으로 설정
./scripts/setup-upload-permissions.sh
```

### 2. 수동 설정
```bash
# 1단계: 디렉토리 생성
mkdir -p ./docker_prod_data/uploads/junit
mkdir -p ./docker_prod_data/app_logs

# 2단계: 소유권 설정 (Docker 컨테이너와 동일한 UID/GID)
sudo chown -R 1001:1001 ./docker_prod_data/uploads
sudo chown -R 1001:1001 ./docker_prod_data/app_logs

# 3단계: 권한 설정
sudo chmod -R 755 ./docker_prod_data/uploads
sudo chmod -R 755 ./docker_prod_data/app_logs
```

## 🧪 배포 후 검증

### 자동 테스트
```bash
# 전체 설정 검증
./scripts/test-upload-setup.sh
```

### 수동 검증
```bash
# 1. 컨테이너 상태 확인
docker ps | grep testcase-app

# 2. 컨테이너 내부 디렉토리 확인
docker exec testcase-app ls -la /app/uploads/

# 3. 호스트 디렉토리 확인
ls -la ./docker_prod_data/uploads/

# 4. 파일 쓰기 테스트
docker exec testcase-app touch /app/uploads/test-file.txt
ls -la ./docker_prod_data/uploads/test-file.txt  # 호스트에서 확인
docker exec testcase-app rm /app/uploads/test-file.txt  # 정리
```

## 📁 디렉토리 구조

```
project-root/
├── docker_prod_data/           # Docker 데이터 루트
│   ├── uploads/               # 📁 업로드 루트 (UID/GID: 1001)
│   │   ├── junit/            # 📁 JUnit 파일 저장소
│   │   │   ├── projectId1/   # 📁 프로젝트별 디렉토리
│   │   │   │   └── test.xml  # 📄 업로드된 JUnit 파일
│   │   │   └── projectId2/
│   │   └── (기타 업로드 파일)
│   ├── app_logs/             # 📁 애플리케이션 로그
│   ├── postgres/             # 📁 PostgreSQL 데이터
│   └── redis/                # 📁 Redis 데이터
└── scripts/
    ├── setup-upload-permissions.sh  # 🛠️ 권한 설정 스크립트
    └── test-upload-setup.sh         # 🧪 검증 스크립트
```

## 🔄 파일 업로드 플로우

### 1. API 호출
```bash
# JWT 토큰 획득
TOKEN=$(curl -X POST http://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -s | jq -r '.accessToken')

# JUnit 파일 업로드
curl -X POST http://your-domain.com/api/junit-results/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.xml" \
  -F "projectId=your-project-id" \
  -F "executionName=테스트 실행"
```

### 2. 파일 저장 경로
- **컨테이너 내부**: `/app/uploads/junit/projectId/`
- **호스트**: `./docker_prod_data/uploads/junit/projectId/`
- **파일명 형식**: `original-name_timestamp.xml`

## 🚨 문제 해결

### 권한 오류 (Permission Denied)
```bash
# 증상: 파일 업로드 시 "Permission denied" 오류
# 해결: 권한 재설정
sudo chown -R 1001:1001 ./docker_prod_data/uploads
sudo chmod -R 755 ./docker_prod_data/uploads
```

### 디렉토리 없음 오류
```bash
# 증상: "No such file or directory" 오류
# 해결: 디렉토리 생성
mkdir -p ./docker_prod_data/uploads/junit
sudo chown -R 1001:1001 ./docker_prod_data/uploads
```

### 볼륨 마운트 실패
```bash
# 증상: 컨테이너에서 파일 변경이 호스트에 반영되지 않음
# 해결: Docker 컨테이너 재시작
docker-compose restart app
```

### 디스크 공간 부족
```bash
# 증상: "No space left on device" 오류
# 확인: 디스크 사용량 체크
df -h
du -sh ./docker_prod_data/uploads/

# 해결: 오래된 파일 정리 또는 디스크 확장
```

## 📊 모니터링

### 디스크 사용량 추적
```bash
# 업로드 디렉토리 크기 확인
du -sh ./docker_prod_data/uploads/

# 프로젝트별 사용량
du -sh ./docker_prod_data/uploads/junit/*/

# 시간별 사용량 추적 (크론탭 설정 예시)
# 0 */6 * * * du -sh /path/to/docker_prod_data/uploads/ >> /var/log/disk-usage.log
```

### 로그 모니터링
```bash
# 업로드 관련 로그 확인
docker-compose logs app | grep -i upload
docker-compose logs app | grep -i junit

# 실시간 로그 감시
docker-compose logs -f app | grep -E "(upload|junit)"
```

## 🔒 보안 고려사항

### 파일 권한
- **최소 권한 원칙**: 755 권한으로 제한
- **소유권 분리**: Docker 컨테이너 전용 UID/GID 사용
- **디렉토리 격리**: uploads 디렉토리는 애플리케이션 전용

### 파일 업로드 제한
- **파일 크기**: 최대 100MB (Nginx + Spring Boot 설정)
- **파일 형식**: XML 파일만 허용
- **경로 검증**: 디렉토리 탐색 공격 방지

### 백업 전략
```bash
# 정기 백업 스크립트 예시
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "backup_uploads_$DATE.tar.gz" ./docker_prod_data/uploads/
# 30일 이상된 백업 파일 자동 삭제
find ./backups/ -name "backup_uploads_*.tar.gz" -mtime +30 -delete
```

## ✅ 체크리스트

배포 전 확인사항:
- [ ] `./scripts/setup-upload-permissions.sh` 실행 완료
- [ ] `./docker_prod_data/uploads/junit/` 디렉토리 존재
- [ ] 디렉토리 소유권이 1001:1001로 설정됨
- [ ] 디렉토리 권한이 755로 설정됨
- [ ] Docker 컨테이너 정상 실행 중
- [ ] `./scripts/test-upload-setup.sh` 테스트 통과

배포 후 검증사항:
- [ ] JWT 로그인 성공
- [ ] JUnit 파일 업로드 성공
- [ ] 호스트에서 업로드된 파일 확인 가능
- [ ] 애플리케이션 로그에 오류 없음
- [ ] 디스크 공간 충분함

---

## 🎉 결론

이 가이드를 따라 설정하면 Docker 환경에서 JUnit 파일 업로드가 완벽하게 작동합니다:

1. **자동 스크립트 실행**: `./scripts/setup-upload-permissions.sh`
2. **Docker 배포**: `docker-compose up -d`
3. **테스트 검증**: `./scripts/test-upload-setup.sh`
4. **실제 업로드 테스트**: API 호출로 파일 업로드

모든 단계를 완료하면 개발환경과 동일하게 파일이 호스트 폴더에 저장됩니다! 🚀