# 테스트케이스 Import / Export 기능 구현 계획

> 작성일: 2026-04-16  
> 브랜치: `claude/test-case-import-export-1zUig`

---

## 1. 개요

테스트케이스를 다양한 형식으로 가져오고 내보내는 기능을 구현합니다.

### 지원 형식

| 형식 | Import | Export | 샘플 다운로드 |
|------|--------|--------|-------------|
| CSV | ✅ (기존) → 개선 | ✅ (신규 백엔드) | ✅ (신규) |
| Excel (.xlsx) | ✅ (기존) → 개선 | ✅ (신규 백엔드) | ✅ (신규) |
| JSON | ✅ (신규) | ✅ (신규) | ✅ (신규) |
| Google Sheets | ✅ (기존) → 개선 | ✅ (신규) | ✅ (신규) |

### 현황 분석

**이미 구현된 것:**
- 백엔드: CSV, Excel, Google Sheets import 엔드포인트 (`/api/testcases/import/*`)
- 프론트엔드: CSV, Excel, PDF export (브라우저 사이드, `SpreadsheetExport.js`)

**구현 필요:**
- JSON Import/Export 신규 추가
- 샘플 파일 다운로드 엔드포인트
- Import UI 다이얼로그 (백엔드 엔드포인트는 있지만 UI 없음)
- Import 전 데이터 사전 검증 미리보기
- Export → Import 라운드트립 호환성 보장
- Google Sheets Export

---

## 2. 데이터 형식 표준 (라운드트립 호환)

### 2.1 CSV / Excel 표준 헤더

```
type | name | parentPath | description | preCondition | postCondition | priority | executionType | isAutomated | tags | step1_action | step1_expected | step2_action | step2_expected | ...
```

**필드 규칙:**
- `type`: `folder` 또는 `testcase`
- `parentPath`: 폴더명, 슬래시로 중첩 표현 (예: `로그인/정상케이스`)
- `tags`: 세미콜론 구분 (예: `smoke;login;regression`)
- `isAutomated`: `true` / `false`
- `priority`: `HIGH`, `MEDIUM`, `LOW`
- `executionType`: `Manual`, `Automated`
- steps: 동적 컬럼 (`step1_action`, `step1_expected`, `step2_action`, ...)

**샘플 CSV:**
```csv
type,name,parentPath,description,preCondition,postCondition,priority,executionType,isAutomated,tags,step1_action,step1_expected,step2_action,step2_expected
folder,로그인 테스트,,,,,MEDIUM,Manual,false,,,,
testcase,정상 로그인,로그인 테스트,유효한 자격증명으로 로그인,계정이 존재함,대시보드 표시,HIGH,Manual,false,smoke;login,ID/PW 입력,입력 완료,로그인 버튼 클릭,대시보드 이동
testcase,잘못된 비밀번호,로그인 테스트,잘못된 PW로 로그인 시도,계정이 존재함,오류 메시지 표시,MEDIUM,Manual,false,login,ID 입력 후 잘못된 PW 입력,입력 완료,로그인 버튼 클릭,오류 메시지 출력
```

### 2.2 JSON 표준 구조

```json
{
  "version": "1.0",
  "exportedAt": "2026-04-16T10:00:00",
  "projectCode": "PROJ",
  "testCases": [
    {
      "type": "folder",
      "name": "로그인 테스트",
      "parentPath": null,
      "description": "",
      "preCondition": "",
      "postCondition": "",
      "priority": "MEDIUM",
      "executionType": "Manual",
      "isAutomated": false,
      "tags": [],
      "steps": []
    },
    {
      "type": "testcase",
      "name": "정상 로그인",
      "parentPath": "로그인 테스트",
      "description": "유효한 자격증명으로 로그인",
      "preCondition": "계정이 존재함",
      "postCondition": "대시보드 표시",
      "priority": "HIGH",
      "executionType": "Manual",
      "isAutomated": false,
      "tags": ["smoke", "login"],
      "steps": [
        {"stepNumber": 1, "description": "ID/PW 입력", "expectedResult": "입력 완료"},
        {"stepNumber": 2, "description": "로그인 버튼 클릭", "expectedResult": "대시보드 이동"}
      ]
    }
  ]
}
```

### 2.3 Google Sheets 형식

- CSV와 동일한 헤더 구조 (첫 번째 행)
- 각 행이 하나의 테스트케이스 또는 폴더

---

## 3. 백엔드 구현 계획

### 3.1 신규 API 엔드포인트

기존 `TestCaseController.java`에 추가:

| 엔드포인트 | 메서드 | 설명 | 파라미터 |
|---|---|---|---|
| `/api/testcases/sample/csv` | GET | 샘플 CSV 다운로드 | - |
| `/api/testcases/sample/excel` | GET | 샘플 Excel 다운로드 | - |
| `/api/testcases/sample/json` | GET | 샘플 JSON 다운로드 | - |
| `/api/testcases/import/json` | POST | JSON 파일 import | `file`, `projectId` |
| `/api/testcases/import/validate` | POST | 사전 검증 (저장 없음) | `file`, `format`, `projectId` |
| `/api/testcases/export/csv` | GET | importable CSV export | `projectId` |
| `/api/testcases/export/excel` | GET | importable Excel export | `projectId` |
| `/api/testcases/export/json` | GET | JSON export | `projectId` |
| `/api/testcases/export/google-sheet` | POST | Google Sheets export | `ExportRequestDto` |

### 3.2 기존 import 개선

현재 CSV/Excel import는 `fieldMappings` 방식으로 동작. 샘플 파일과 동일한 표준 컬럼명 사용 시 mapping 없이 import 가능하도록 기본 mapping 추가:

```java
// TestCaseService.java - 기본 매핑 상수 추가
public static final Map<String, String> DEFAULT_MAPPING = Map.of(
    "name", "name",
    "type", "type",
    "parentPath", "parentPath",
    "description", "description",
    "preCondition", "preCondition",
    "postCondition", "postCondition",
    "priority", "priority",
    "executionType", "executionType",
    "isAutomated", "isAutomated",
    "tags", "tags"
);
```

### 3.3 신규 DTO

**`ImportValidationResultDto.java`**
```java
public class ImportValidationResultDto {
    private int totalRows;
    private int validRows;
    private int invalidRows;
    private List<ValidationError> errors;
    private List<PreviewRow> previewData; // 최대 20행

    public static class ValidationError {
        private int row;
        private String field;
        private String message;
        private String value;
    }

    public static class PreviewRow {
        private String type;
        private String name;
        private String parentPath;
        private String priority;
        private String tags;
        private int stepsCount;
    }
}
```

**`ExportRequestDto.java`**
```java
public class ExportRequestDto {
    private String projectId;
    private String format;          // csv, excel, json, google-sheet
    private boolean includeHierarchy = true;
    private String googleSheetId;   // google-sheet export 시
    private String sheetName;       // google-sheet export 시
}
```

### 3.4 서비스 메서드 추가 (TestCaseService.java)

```java
// 샘플 생성
byte[] generateSampleCsv();
byte[] generateSampleExcel();
String generateSampleJson();

// JSON Import
List<TestCase> importFromJson(InputStream inputStream, String projectId);

// 검증 전용 (저장 없음)
ImportValidationResultDto validateImport(InputStream inputStream, String format, String projectId);

// Export (importable 형식)
byte[] exportToCsvBytes(String projectId);
byte[] exportToExcelBytes(String projectId);
String exportToJsonString(String projectId);
String exportToGoogleSheet(String projectId, String spreadsheetId, String sheetName);
```

### 3.5 파일 크기 제한

| 형식 | 제한 |
|------|------|
| CSV | 2MB (기존) |
| Excel | 10MB (기존) |
| JSON | 5MB (신규) |

---

## 4. 프론트엔드 구현 계획

### 4.1 신규 컴포넌트

#### `TestCaseImportExportDialog.jsx`
**위치:** `src/main/frontend/src/components/TestCase/TestCaseImportExportDialog.jsx`

```
┌─────────────────────────────────────────────────────┐
│  테스트케이스 Import / Export                  [X]   │
│  ─────────────────────────────────────────────────  │
│  [ 가져오기 ] [ 내보내기 ]                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  [가져오기 탭]                                       │
│                                                     │
│  1. 형식 선택                                        │
│     ● CSV   ○ Excel   ○ JSON  ○ Google Sheets       │
│                                                     │
│  2. 샘플 파일                                        │
│     [📥 sample_testcases.csv 다운로드]               │
│                                                     │
│  3. 파일 업로드                                      │
│  ┌─────────────────────────────────────┐            │
│  │  파일을 여기에 드래그하거나          │            │
│  │  클릭하여 선택하세요 (.csv)         │            │
│  └─────────────────────────────────────┘            │
│                                                     │
│  (Google Sheets: 스프레드시트 URL 입력 필드)        │
│                                                     │
│  [🔍 검증하기]                                       │
│                                                     │
│  4. 검증 결과 (검증 후 표시)                         │
│  ─────────────────────────────────────────────────  │
│  ✅ 30개 유효  ❌ 2개 오류                          │
│  ┌────┬──────────┬────────────┬──────────────────┐  │
│  │ 행 │ 필드     │ 값         │ 오류 메시지      │  │
│  ├────┼──────────┼────────────┼──────────────────┤  │
│  │  5 │ priority │ URGENT     │ 유효하지 않은 값 │  │
│  │ 12 │ name     │ (빈 값)    │ 필수 항목        │  │
│  └────┴──────────┴────────────┴──────────────────┘  │
│                                                     │
│             [취소]  [가져오기 실행 (30개)]            │
└─────────────────────────────────────────────────────┘
```

#### `TestCaseImportExportDialog.jsx` - 내보내기 탭
```
│  [내보내기 탭]                                       │
│                                                     │
│  1. 형식 선택                                        │
│     ● CSV   ○ Excel   ○ JSON  ○ Google Sheets       │
│                                                     │
│  2. 옵션                                            │
│     ☑ 폴더 구조 포함                                │
│     ☑ 테스트 단계 포함                              │
│                                                     │
│  (Google Sheets: 스프레드시트 URL 입력)             │
│                                                     │
│             [취소]  [📤 내보내기]                    │
```

### 4.2 API 서비스 함수

**위치:** `src/main/frontend/src/services/importExportApi.js` (신규)

```javascript
// 샘플 다운로드
export const downloadSampleFile = async (format) => { ... }

// Import 사전 검증
export const validateImportFile = async (file, format, projectId) => {
  // Returns: { totalRows, validRows, invalidRows, errors[], previewData[] }
}

// Import 실행
export const importTestCases = async (file, format, projectId) => {
  // Returns: { importedCount, errors[] }
}

// Google Sheets Import
export const importFromGoogleSheet = async (spreadsheetId, sheetName, projectId) => { ... }

// Export (백엔드 생성 - importable 형식)
export const exportTestCasesAs = async (projectId, format) => {
  // 파일 다운로드 트리거
}

// Google Sheets Export
export const exportToGoogleSheet = async (projectId, spreadsheetId, sheetName) => { ... }
```

### 4.3 기존 컴포넌트 수정

**`TestCaseSpreadsheet.jsx` 수정:**
- 상단 툴바에 `[📥 가져오기 / 📤 내보내기]` 버튼 추가
- 클릭 시 `TestCaseImportExportDialog` 열기
- 기존 export 버튼(CSV, Excel, PDF)은 유지하되 새 다이얼로그와 통합 여부 결정

---

## 5. 구현 순서

```
Phase 1 (백엔드)
├── 1-1: 표준 데이터 형식 정의 + 샘플 생성 메서드 (generateSampleCsv/Excel/Json)
├── 1-2: JSON Import 엔드포인트 + 서비스 메서드 (importFromJson)
├── 1-3: Import 사전 검증 엔드포인트 (/import/validate)
├── 1-4: Export 엔드포인트 CSV/Excel/JSON (importable 형식)
└── 1-5: Google Sheets Export

Phase 2 (프론트엔드)
├── 2-1: importExportApi.js API 서비스 함수
├── 2-2: TestCaseImportExportDialog.jsx (Import 탭)
├── 2-3: TestCaseImportExportDialog.jsx (Export 탭)
└── 2-4: TestCaseSpreadsheet 툴바 버튼 통합

Phase 3 (검증)
├── 3-1: 라운드트립 테스트 (export → import → 데이터 일치)
├── 3-2: 오류 케이스 검증 (잘못된 형식, 빈 파일, 한글)
└── 3-3: 대용량 파일 테스트
```

---

## 6. 주요 주의사항

1. **한글 인코딩**: CSV는 BOM(`\uFEFF`) 필수, Excel은 Apache POI 자동 처리
2. **계층 구조 표현**: `parentPath`로 `/`로 구분된 경로 사용 (`로그인/정상케이스`)
3. **steps 처리**: CSV에서는 `step1_action`, `step1_expected` 동적 컬럼, JSON에서는 배열
4. **Google Sheets 인증**: 서비스 계정 방식 (기존 구현 유지)
5. **기존 import 호환**: 기존 fieldMappings 방식 유지하되 샘플 파일은 기본 mapping으로 동작
6. **라운드트립 보장**: export한 파일을 그대로 import했을 때 데이터 동일해야 함

---

## 7. 관련 파일

### 백엔드
- `src/main/java/com/testcase/testcasemanagement/controller/TestCaseController.java` - 엔드포인트 추가
- `src/main/java/com/testcase/testcasemanagement/service/TestCaseService.java` - 서비스 메서드 추가
- `src/main/java/com/testcase/testcasemanagement/dto/ImportValidationResultDto.java` - 신규
- `src/main/java/com/testcase/testcasemanagement/dto/ExportRequestDto.java` - 신규

### 프론트엔드
- `src/main/frontend/src/components/TestCase/TestCaseImportExportDialog.jsx` - 신규
- `src/main/frontend/src/services/importExportApi.js` - 신규
- `src/main/frontend/src/components/TestCase/TestCaseSpreadsheet.jsx` - 툴바 버튼 추가
