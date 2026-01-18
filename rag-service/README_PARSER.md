# RAG Service - Document Parser Guide

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# dev-docker/.env 파일 편집
DOCUMENT_PARSER=auto  # 권장값 (auto/upstage/local)
UPSTAGE_API_KEY=your_api_key_here  # Upstage 사용 시 필요
```

### 2. 서비스 시작

```bash
cd dev-docker
docker-compose up -d
```

### 3. 테스트

```bash
cd rag-service
python3 test_pdf_analysis.py
```

## 📋 파서 모드 설명

### Auto Mode (권장)
```bash
DOCUMENT_PARSER=auto
```
- API 키가 있으면 **Upstage** 사용
- API 키가 없으면 **로컬 파서** 사용
- 개발/프로덕션 환경 모두 적합

### Upstage Mode (고품질)
```bash
DOCUMENT_PARSER=upstage
UPSTAGE_API_KEY=your_key  # 필수
```
- 클라우드 기반 고급 문서 분석
- 표, 제목, 레이아웃 구조 추출
- API 비용 발생

### Local Mode (무료/빠름)
```bash
DOCUMENT_PARSER=local
```
- pypdf + python-docx 사용
- 완전 무료, 오프라인 가능
- 빠른 처리 속도 (~1초)

## ⚡ 성능 비교

| 항목 | Upstage | Local | 차이 |
|------|---------|-------|------|
| **처리 속도** | ~23초 | ~1초 | **23배 빠름** |
| **비용** | 유료 | 무료 | 💰 절감 |
| **구조 분석** | ✅ 69개 요소 | ❌ 미지원 | - |
| **텍스트 품질** | 25K chars | 21K chars | -15% |
| **네트워크** | 필수 | 불필요 | ⚡ 오프라인 |

## 🎯 사용 시나리오

### Upstage 사용 권장
- 복잡한 문서 구조 분석 필요
- 표/제목 등 레이아웃 보존 중요
- 한글 OCR 필요 (이미지 PDF)
- 상업적 용도, 높은 품질 요구

### Local Parser 사용 권장
- 비용 절감 최우선 (대량 문서)
- 빠른 처리 속도 필요
- 오프라인 환경
- 개인정보 보호 (내부 문서)

## 📊 테스트 결과

### Upstage Parser
```
✅ 청크: 31개
✅ 텍스트: 25,071 characters
✅ 구조 요소: 69개 (표, 제목 등)
✅ 처리 시간: ~23초
```

### Local Parser
```
✅ 청크: 33개
✅ 텍스트: 21,393 characters
⚠️ 구조 요소: 0개 (텍스트만)
✅ 처리 시간: ~1초
```

## 🔧 설정 변경

### 파서 모드 변경
```bash
# 1. .env 파일 수정
vim dev-docker/.env

# 2. 서비스 재시작
docker-compose restart rag-service

# 3. 로그 확인
docker-compose logs rag-service | grep "UpstageService initialized"
```

### 환경변수 확인
```bash
docker exec testcase-rag-service env | grep -i parser
```

## 📚 추가 문서

- `PARSER_COMPARISON.md` - 상세 비교 분석
- `test_pdf_analysis.py` - PDF 테스트 스크립트
- `test_parser_modes.py` - 파서 모드 비교 테스트

## 🐛 트러블슈팅

### Upstage API 401 Unauthorized
```bash
# API 키 확인
echo $UPSTAGE_API_KEY

# .env 파일 확인
cat dev-docker/.env | grep UPSTAGE
```

### Local Parser 오류
```bash
# 의존성 확인
docker exec testcase-rag-service pip list | grep -i "pypdf\|docx"

# 재빌드
docker-compose build --no-cache rag-service
```

### 파서 모드가 변경되지 않음
```bash
# 컨테이너 재생성 필요 (restart 대신)
docker-compose down
docker-compose up -d
```

## 💡 추천 설정

### 개발 환경
```bash
DOCUMENT_PARSER=local  # 빠르고 무료
```

### 프로덕션 환경
```bash
DOCUMENT_PARSER=upstage  # 최고 품질
UPSTAGE_API_KEY=your_production_key
```

### 하이브리드 환경
```bash
DOCUMENT_PARSER=auto  # 유연한 자동 전환
UPSTAGE_API_KEY=your_key
```

## 🔮 향후 계획

- [ ] Ollama 임베딩 통합
- [ ] pdfplumber 추가 (표 추출 개선)
- [ ] Tesseract OCR 지원 (이미지 PDF)
- [ ] 병렬 파싱 (대량 문서 처리)
- [ ] 캐싱 전략 (중복 파싱 방지)

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. `docker-compose logs rag-service`
2. `PARSER_COMPARISON.md` 문서
3. 테스트 스크립트 실행 결과
