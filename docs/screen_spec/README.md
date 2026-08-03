# TestcaseCraft 화면 기획 문서

> 작성: 2026-08-03 21:42 KST · 기준 버전 **v1.0.102** · 기준 브랜치 `master`(`73340e4f`)
> 대상 독자: 기획·설계 담당, 신규 합류 개발자, QA 리드, 외부 인수 검토자

---

## 1. 이 문서 묶음이 무엇인가

TestcaseCraft의 **실제 화면을 화면 단위로 분해한 설계 문서**다. 화면마다 네 개의 문서를 두고, 업무 흐름 → 화면 구성 → 컴포넌트 규격 → 요건 추적의 순서로 좁혀 간다.

사용자 매뉴얼(`../manual/new/USER_MANUAL.md`)과 역할이 다르다. 매뉴얼은 "어떻게 쓰는가"를 사용자에게 설명하고, 이 문서는 "무엇이 왜 그렇게 되어 있는가"를 설계·인수 관점에서 기술한다. 같은 화면을 다루더라도 매뉴얼은 절차, 이 문서는 영역·요소·상태·권한·계약을 다룹니다.

### 목업 문서와 다른 점

이 문서 묶음의 형식은 `온토비아1.1-목업`의 4문서 구조를 가져왔지만, 그쪽은 **아직 만들지 않은 화면의 제안서**다. 그래서 `(개발 중)`·`(가정)` 배지와 미결 항목 표가 문서의 중심이었다.

TestcaseCraft는 이미 돌아가는 제품입니다. 따라서 다음을 바꿨습니다.

| 항목 | 목업 문서 | 이 문서 |
|---|---|---|
| 서술의 시제 | "이렇게 만들 것이다" | "이렇게 되어 있다" |
| 근거 | 회의록·녹취록 행 번호 | **소스 `파일:행` · REST 엔드포인트 · 테스트 파일** |
| 미구현 표기 | `(개발 중)` 배지 | 실제로 숨겨진 기능만 §숨김·보류 절에 사유와 함께 기록 |
| 권한 | 목업용 제안 매트릭스 | `ProjectSecurityService` · `ProjectUserRepository` 질의로 확정된 판정 |
| 예시 데이터 | 가상 3건 | 캡처에 쓰인 실제 데모 프로젝트(ShopFlow·ShopFlow EN) |
| 검증 방법 | PM 확정 대기 | 화면을 열어 대조 · `data-testid` 로 단위·E2E 테스트 대조 |

**근거를 못 대는 서술은 쓰지 않습니다.** 코드를 읽어도 판정이 갈리는 지점은 `⚠ 확인 필요`로 표시하고 무엇을 확인해야 하는지 함께 적습니다.

---

## 2. 화면 목록

화면 ID는 `S0`~`S11`이다. 폴더 번호와 ID 번호가 같다.

| ID | 폴더 | 화면 | 기본 라우트 | 주 컴포넌트 | 매뉴얼 |
|---|---|---|---|---|---|
| **S0** | `0.로그인계정` | 로그인·회원가입·이메일 인증·매뉴얼 열람 | `/login` · `/verify-email` · `/manual` | `Login.jsx` · `EmailVerification.jsx` · `ManualViewer.jsx` | §1 · §15 |
| **S1** | `1.프로젝트` | 프로젝트 목록·생성·설정·멤버 | `/projects` | `ProjectManager.jsx` | §2 · §17-9 |
| **S2** | `2.작업공간골격` | 헤더·브레드크럼·영역 이동·프로젝트 전환·프로필·북마크 | `/projects/{projectId}` 껍데기 | `App.jsx` · `ProjectHeader.jsx` · `ProjectSidebar.jsx` · `UserProfileDialog.jsx` · `BookmarkPage.jsx` | §3 · §13 · §14 · §4-7 |
| **S3** | `3.대시보드` | 프로젝트 대시보드 · 전사 대시보드 | `/projects/{projectId}` · `/dashboard` | `Dashboard.jsx` · `SystemDashboard.jsx` | §6 · §17-2 |
| **S4** | `4.테스트케이스` | 트리·폴더 케이스 목록·개별 폼·스프레드시트 | `/projects/{projectId}/testcases` | `TestCaseTree.jsx` · `TestCaseForm.jsx` · `TestCaseHybridForm.jsx` | §4 · §5 |
| **S5** | `5.테스트플랜` | 플랜 목록·생성·케이스 선택·플랜 2단 작업공간 | `/projects/{projectId}/testplans` | `TestPlanList.jsx` · `TestPlanForm.jsx` · `PlanExecutionWorkspace.jsx` | §7 |
| **S6** | `6.테스트실행` | 실행 목록·실행 상세·결과 입력 | `/projects/{projectId}/executions` | `TestExecutionList.jsx` · `TestExecutionForm.jsx` · `TestCaseResultPage.jsx` | §8 |
| **S7** | `7.테스트결과` | 결과 통계·상세 테이블·QA 총평·내보내기 | `/projects/{projectId}/results` | `TestResultMainPage.jsx` · `TestResultStatisticsDashboard.jsx` | §9 |
| **S8** | `8.자동화테스트` | JUnit XML 업로드·결과 목록·상세 | `/projects/{projectId}/automation` | `JunitResultDashboard.jsx` · `JunitResultDetail.jsx` | §10 |
| **S9** | `9.RAG문서` | 지식 문서 업로드·임베딩·챗 | `/projects/{projectId}/rag` | `RAGDocumentManager.jsx` | §11 |
| **S10** | `10.탐색세션` | SBTM 차터·세션·노트·보고서 | `/projects/{projectId}/exploratory` | `ExploratorySessionWorkspace.jsx` | §12 |
| **S11** | `11.관리자설정` | 조직·사용자·메일·LLM·스케줄러·번역 | `/organizations` 외 5경로 | `OrganizationList.jsx` · `UserList.jsx` · `MailSettingsManager.jsx` 외 | §17 |

전 화면을 관통하는 업무 흐름과 권한 정본은 [`00_전체_업무프로세스.md`](00_전체_업무프로세스.md)에 있다.

---

## 3. 화면 폴더의 4문서 구조

| 파일 | 무엇을 답하는가 | 주 독자 |
|---|---|---|
| `01_<화면>_업무프로세스.md` | 이 화면이 어떤 업무를 맡고, 전후 화면과 어떻게 이어지며, 누가 무엇을 할 수 있는가 | 기획·QA 리드 |
| `02_<화면>_화면정의.md` | 화면을 영역 A~n으로 나눈 배치, 영역별 요소·표시 규칙·상태·권한별 차이 | 기획·설계·개발 |
| `03_<화면>_컴포넌트.md` | 컴포넌트 트리, props·상태, `data-testid`, 호출하는 API, 렌더 규칙 | 개발·테스트 자동화 |
| `04_요건반영목록.md` | 요건 ↔ 화면 영역 ↔ 소스 근거의 추적표 | 인수 검토·유지보수 |

한 화면의 네 문서는 서로를 가리킵니다. **02에 있는 영역·요소는 04에 행이 있어야 하고, 04에만 생긴 요소는 02·03에 되돌려 적습니다.**

---

## 4. 표기 규약

### 근거 표기

| 표기 | 뜻 |
|---|---|
| `App.jsx:1073` | 프런트엔드 소스 위치. 기준 경로는 `src/main/frontend/src/` |
| `TestCaseController.java:88` | 백엔드 소스 위치. 기준 경로는 `src/main/java/com/testcase/testcasemanagement/` |
| `GET /api/testcases/project/{projectId}` | REST 계약. 정본은 컨트롤러 애노테이션 |
| `data-testid="tab-testcases"` | 화면 요소의 안정 식별자. 단위·E2E 테스트가 이 값으로 요소를 잡는다 |
| 매뉴얼 §4-4 | `../manual/new/USER_MANUAL.md`의 절 번호 |
| `⚠ 확인 필요` | 코드만으로 판정이 갈려 실행 확인이 필요한 지점 |

### 권한 표기

프로젝트 권한 6종과 시스템 권한을 함께 쓴다. 자세한 판정 규칙은 `00_전체_업무프로세스.md` §5.

`RW` 조회+편집 · `R` 조회만 · `W(결과)` 결과 기록만 · `—` 접근 불가

### 상태 표기

| 표기 | 뜻 |
|---|---|
| 정상 | 요건이 화면에 구현되어 동작한다 |
| **부분** | 일부 조건에서만 동작한다. 어떤 조건인지 함께 적는다 |
| **숨김** | 코드는 있으나 화면에서 꺼져 있다. 사유와 해제 조건을 적는다 |
| **환경 의존** | 환경 변수·외부 서비스 상태에 따라 노출이 갈린다 |

---

## 5. 갱신 규칙

1. **화면을 바꾸면 그 화면의 4문서를 함께 고친다.** 영역이 늘면 02·03·04 세 곳에 행이 생긴다.
2. **라우트를 바꾸면 `00_전체_업무프로세스.md` §6 라우트 표가 정본이다.** 화면별 문서는 그 표를 참조만 한다.
3. **권한 판정을 바꾸면 `00_전체_업무프로세스.md` §5를 먼저 고친 뒤** 각 화면의 권한표를 맞춘다. 권한표가 네 곳에 흩어지면 드리프트가 시작된다.
4. **캡처는 이 문서에 새로 만들지 않는다.** 매뉴얼의 `images/`·`images_en/`을 참조하고, 부족하면 `manual-capture` 스킬로 매뉴얼 쪽에 추가한 뒤 여기서 가리킨다.
5. 문서 머리말의 기준 버전·기준 커밋을 갱신한다. 갱신일에는 시각(KST)까지 적는다.

---

## 6. 연관 문서

| 문서 | 관계 |
|---|---|
| `../manual/new/USER_MANUAL.md` | 같은 화면의 사용 절차. 이 문서의 캡처 출처 |
| `../manual/*.md` | 기능별 상세 매뉴얼(케이스·플랜·실행·결과·통계·사용자 관리 등) |
| `../ARCHITECTURE.md` | 시스템 구조·모듈 경계 |
| `../plan/LEFT_NAV_RESTRUCTURE.md` | S2 영역 이동 구조(가로 탭 ↔ 좌측 메뉴)의 설계 배경 |
| `../plan/BOOKMARK_FAVORITES_SRS.md` | S2 북마크 요건 정의서 |
| `../plan/TREE_DND_REORGANIZE_PLAN.md` | S4 트리 드래그앤드롭 설계 |
| `../plan/RAG_SERVICE_STRUCTURE.md` · `RAG_EMBEDDING_PROCESS.md` | S9 RAG 파이프라인 |
| `../deployment/DOCKER_SETUP.md` | 환경 변수(RAG·탐색 세션 노출 조건 포함) |
| `../release_note/` | 버전별 변경 이력 |
