# RAG Service Document Parser Comparison

**작성일**: 2025-10-22
**버전**: v0.1.0

## 개요

RAG 서비스는 환경 설정에 따라 두 가지 문서 파싱 방식을 지원합니다:

1. **Upstage Layout Analysis API** (클라우드 기반)
2. **로컬 파서** (pypdf + python-docx)

## 환경 설정

### `.env` 파일 설정

```bash
# Document Parser Configuration
# Options: "upstage" (cloud API), "local" (pypdf/python-docx), "auto" (fallback)
DOCUMENT_PARSER=auto  # 기본값

# Upstage API Key (Upstage 파서 사용 시 필수)
UPSTAGE_API_KEY=your_api_key_here
```

### 파서 모드

| 모드 | 설명 | 동작 |
|------|------|------|
| `auto` | 자동 선택 | API 키가 있으면 Upstage 사용, 없으면 로컬 사용 |
| `upstage` | Upstage 강제 | 항상 Upstage API 사용 (API 키 필수) |
| `local` | 로컬 강제 | 항상 pypdf/python-docx 사용 (무료) |

## 테스트 결과 비교

### 테스트 문서
- **파일명**: test.pdf
- **크기**: 228,794 bytes (223 KB)
- **내용**: 한국어 예산서 (17 페이지)

### Upstage Parser (Cloud API)

**로그 출력**:
```
UpstageService initialized (mode: auto, active: upstage)
Parsing with Upstage API: test.pdf
Upstage parsing completed: test.pdf
Created 31 chunks from text (length: 25071)
```

**분석 결과**:
- ✅ **총 청크 수**: 31개
- ✅ **추출된 텍스트**: 25,071 characters
- ✅ **페이지 정보**: 감지됨 (구조 분석)
- ✅ **구조 요소**: 69개 (제목, 표, 레이아웃 등)
- ✅ **처리 시간**: ~23초 (네트워크 포함)
- ✅ **한글 텍스트**: "세 출 각 목 명 세 서" 정확히 추출
- ✅ **Layout Analysis**: HTML, Markdown 형식 제공

**장점**:
- 고급 레이아웃 분석 (표, 제목, 섹션 구조)
- 한글 OCR 및 구조 인식 우수
- HTML/Markdown 형식 제공
- 복잡한 문서 구조 처리 가능

**단점**:
- API 비용 발생 (문서당 과금)
- 네트워크 의존성
- API 키 필수
- 처리 시간이 비교적 김 (~23초)

### Local Parser (pypdf)

**로그 출력**:
```
UpstageService initialized (mode: local, active: local)
Parsing with local parser: test.pdf
Extracted 21393 characters from 17 pages
Local parsing completed: test.pdf
Created 33 chunks from text (length: 21393)
```

**분석 결과**:
- ✅ **총 청크 수**: 33개
- ✅ **추출된 텍스트**: 21,393 characters
- ✅ **페이지 정보**: 17 페이지 (정확히 감지)
- ⚠️ **구조 요소**: 0개 (단순 텍스트 추출만)
- ✅ **처리 시간**: ~1초 (로컬 처리)
- ✅ **한글 텍스트**: "세출각목명세서" 추출 (공백 제거됨)
- ⚠️ **Layout Analysis**: 미지원 (텍스트만)

**장점**:
- 완전 무료 (API 비용 없음)
- 네트워크 불필요
- API 키 불필요
- 빠른 처리 속도 (~1초)
- 개인정보 보호 (로컬 처리)

**단점**:
- 레이아웃 구조 분석 불가
- 복잡한 표 형식 추출 제한
- HTML/Markdown 미지원
- OCR 기능 없음 (이미지 기반 PDF 불가)

## 정량적 비교

| 항목 | Upstage API | Local Parser | 차이 |
|------|-------------|--------------|------|
| **청크 수** | 31개 | 33개 | +2개 |
| **텍스트 길이** | 25,071 chars | 21,393 chars | -3,678 chars (-14.7%) |
| **페이지 감지** | ✅ 구조 분석 | ✅ 17 페이지 | 동일 |
| **구조 요소** | 69개 | 0개 | -69개 |
| **처리 시간** | ~23초 | ~1초 | **23배 빠름** |
| **비용** | 유료 (API) | 무료 | 💰 비용 절감 |
| **네트워크** | 필수 | 불필요 | ⚡ 오프라인 가능 |

## 품질 분석

### 텍스트 추출 정확도

**Upstage API**:
```
"세 출 각 목 명 세 서"  ✅ 공백 유지
"[110]일반회계 34,178,000 $ 40,726"  ✅ 구조 보존
```

**Local Parser**:
```
"세출각목명세서"  ⚠️ 공백 제거됨
"[110]일반회계 34,178,000$40,726"  ⚠️ 공백 일부 손실
```

### 추출 텍스트 차이 원인

1. **레이아웃 정보**: Upstage는 레이아웃 구조를 분석하여 공백/개행 보존
2. **텍스트 정규화**: pypdf는 단순 텍스트 추출로 일부 서식 손실
3. **구조 요소**: Upstage는 표, 제목, 섹션 등 구조 정보 포함

## 사용 시나리오별 권장사항

### Upstage API를 사용해야 하는 경우

✅ **복잡한 문서 구조 분석 필요**
- 표, 제목, 레이아웃 구조가 중요한 경우
- HTML/Markdown 형식 변환이 필요한 경우
- 문서 구조를 유지한 검색이 필요한 경우

✅ **높은 정확도 요구**
- 한글 OCR이 필요한 경우 (이미지 기반 PDF)
- 복잡한 레이아웃의 정확한 텍스트 추출
- 표 데이터의 정확한 구조 보존

✅ **상업적 용도**
- API 비용을 감당할 수 있는 경우
- 품질이 중요한 프로덕션 환경
- SLA가 보장되는 서비스 필요

### Local Parser를 사용해야 하는 경우

✅ **비용 절감 최우선**
- API 비용 부담이 큰 경우
- 대량 문서 처리 (수천 개 이상)
- 개발/테스트 환경

✅ **빠른 처리 속도 필요**
- 실시간 문서 처리
- 지연 시간이 중요한 경우
- 오프라인 환경

✅ **개인정보 보호**
- 민감한 문서를 외부 API로 전송 불가
- 내부 네트워크 격리 환경
- 규정 준수 (GDPR, HIPAA 등)

### Auto 모드 권장 (기본값)

```bash
DOCUMENT_PARSER=auto
```

**동작 방식**:
- API 키가 있으면 Upstage 사용
- API 키가 없거나 오류 시 로컬 파서로 자동 전환
- 개발 환경에서 유연한 테스트 가능

## 구현 상세

### 코드 구조

```
app/services/upstage_service.py
├── __init__()                    # 파서 모드 선택
├── analyze_document()            # 공통 인터페이스
├── _parse_with_upstage()        # Upstage API 파싱
└── _parse_with_local()          # 로컬 파서 (pypdf/python-docx)
```

### 환경변수 우선순위

1. `DOCUMENT_PARSER=upstage` → 강제로 Upstage 사용
2. `DOCUMENT_PARSER=local` → 강제로 로컬 사용
3. `DOCUMENT_PARSER=auto` (기본값):
   - `UPSTAGE_API_KEY` 있음 → Upstage 사용
   - `UPSTAGE_API_KEY` 없음 → 로컬 사용

### 지원 파일 형식

| 파일 형식 | Upstage API | Local Parser |
|-----------|-------------|--------------|
| PDF | ✅ 완전 지원 | ✅ 텍스트 기반만 |
| DOCX | ✅ 완전 지원 | ✅ python-docx |
| DOC | ✅ 완전 지원 | ⚠️ 제한적 |
| TXT | ❌ 미지원 | ✅ 완전 지원 |
| 이미지 PDF | ✅ OCR 지원 | ❌ 미지원 |

## 테스트 방법

### 1. Upstage Parser 테스트

```bash
# .env 설정
DOCUMENT_PARSER=upstage
UPSTAGE_API_KEY=your_api_key

# 서비스 재시작
docker-compose restart rag-service

# 테스트 실행
python3 test_pdf_analysis.py
```

### 2. Local Parser 테스트

```bash
# .env 설정
DOCUMENT_PARSER=local

# 서비스 재시작
docker-compose restart rag-service

# 테스트 실행
python3 test_pdf_analysis.py
```

### 3. Auto Mode 테스트

```bash
# .env 설정
DOCUMENT_PARSER=auto
UPSTAGE_API_KEY=your_api_key  # 있으면 Upstage, 없으면 Local

# 서비스 재시작
docker-compose restart rag-service

# 테스트 실행
python3 test_pdf_analysis.py
```

## 로그 확인

### Upstage 사용 확인
```bash
docker-compose logs rag-service | grep "UpstageService initialized"
# 출력: UpstageService initialized (mode: auto, active: upstage)
```

### Local 사용 확인
```bash
docker-compose logs rag-service | grep "UpstageService initialized"
# 출력: UpstageService initialized (mode: local, active: local)
```

## 비용 분석

### Upstage API 비용 (예상)
- 문서당 과금 (정확한 가격은 Upstage 공식 웹사이트 참조)
- 대량 처리 시 비용 증가
- 월별 사용량에 따라 가변적

### Local Parser 비용
- **$0** - 완전 무료
- 서버 리소스만 필요 (CPU, 메모리)
- 대량 처리 시 비용 절감 효과 극대화

### ROI 계산 예시

**시나리오**: 월 10,000개 문서 처리

| 항목 | Upstage API | Local Parser | 절감액 |
|------|-------------|--------------|--------|
| API 비용 | ~$XXX | $0 | ~$XXX |
| 처리 시간 | ~64 시간 | ~2.7 시간 | -61.3 시간 |
| 네트워크 비용 | 발생 | $0 | 절감 |

## 결론

### Hybrid Approach 권장 (기본값: auto)

```bash
DOCUMENT_PARSER=auto
```

**이유**:
1. ✅ **유연성**: 개발 환경에서는 로컬, 프로덕션에서는 Upstage
2. ✅ **비용 효율**: API 키 없이도 기본 기능 동작
3. ✅ **장애 대응**: Upstage API 장애 시 자동 로컬 fallback
4. ✅ **테스트 용이**: 환경 변수만 변경하여 테스트 가능

### 최종 권장사항

| 환경 | 설정 | 이유 |
|------|------|------|
| **개발/테스트** | `DOCUMENT_PARSER=local` | 빠르고 비용 없음 |
| **스테이징** | `DOCUMENT_PARSER=auto` | 프로덕션 시뮬레이션 |
| **프로덕션** | `DOCUMENT_PARSER=upstage` | 최고 품질, 안정성 |
| **오프라인** | `DOCUMENT_PARSER=local` | 네트워크 불필요 |

## 향후 개선 사항

### 1. 추가 로컬 파서
- [ ] pdfplumber (표 추출 개선)
- [ ] Tesseract OCR (이미지 PDF 지원)
- [ ] Apache Tika (다양한 파일 형식)

### 2. Ollama 통합 (향후)
- [ ] Ollama 임베딩 모델 지원
- [ ] 로컬 LLM 기반 문서 요약
- [ ] 완전 오프라인 RAG 시스템

### 3. 성능 최적화
- [ ] 병렬 파싱 (여러 문서 동시 처리)
- [ ] 캐싱 전략 (동일 문서 재파싱 방지)
- [ ] 스트리밍 파싱 (대용량 문서)

## 참고 자료

- [Upstage API Documentation](https://developers.upstage.ai/)
- [pypdf GitHub](https://github.com/py-pdf/pypdf)
- [python-docx Documentation](https://python-docx.readthedocs.io/)
- [LangChain Text Splitters](https://python.langchain.com/docs/modules/data_connection/document_transformers/)
