# 릴리스 노트 - v1.0.1 ~ v1.0.10 (초기 기반 수립)

## 🚀 주요 변경 사항

### 🏗 프로젝트 초기 아키텍처 수립

- **Full-Stack 기반 구축**: Spring Boot 3.x와 React 18 기반의 테스트 케이스 관리 플랫폼의 기본 골격을 완성했습니다.
- **인증 시스템**: JWT 기반의 로그인 및 권한 관리 시스템의 초기 버전을 구현했습니다.

### 📂 코어 테스트 관리 기능

- **계층형 테스트 케이스**: 프로젝트, 폴더, 테스트 케이스로 이어지는 계층 구조 관리 기능을 도입했습니다.
- **테스트 플랜 및 실행**: 테스트 플랜 수립 및 결과 입력(Pass/Fail/Skip/NA)의 핵심 워크플로우를 구축했습니다.

### 🐳 도커 및 빌드 환경

- **Docker Compose 지원**: PostgreSQL 및 인프라 구동을 위한 초기 Docker 설정을 완료했습니다.
- **Gradle 통합 빌드**: 백엔드와 프론트엔드를 한 번에 빌드하고 서빙하는 그레이들 태스크를 정립했습니다.

### 📌 v1.0.10 상세 변경 사항

- **[fix] 보안 취약점 수정**: 시스템 전반의 보안 취약 사항을 점검하고 일부 항목을 수정했습니다.
- **[fix] 고아 문서 정리**: 연결되지 않은(Orphaned) RAG 문서들을 정리하는 로직의 오류를 수정했습니다.
- **[fix] RAG 문서 조회 최적화**: 진행 중인 RAG 문서가 있을 때 3초 간격으로 폴링하던 방식을 제거하고, 새로고침 시에만 조회하도록 변경하여 리소스 낭비를 줄였습니다.
- **[fix] 토큰 갱신 로직 수정**: 인증 토큰 갱신 프로세스의 안정성을 개선했습니다.
- **[chore] Docker 빌드 개선**: AMD64 아키텍처로만 빌드되던 스크립트를 수정하여 플랫폼 호환성을 점검했습니다.
- **[refact] RAG 문서 페이지**: RAG 문서 관리 페이지의 코드를 리팩토링하여 유지보수성을 높였습니다.

### 📌 v1.0.9 상세 변경 사항

- **[fix] 테스트 실행 화면 정리**: 테스트 실행 화면의 레이아웃을 조정하여 가시성을 개선했습니다.
- **[fix] 첨부 파일 버튼 오류 수정**: 테스트 결과에 첨부 파일이 없을 때 버튼이 잘못 표시되던 문제를 해결했습니다.

### 📌 v1.0.8 상세 변경 사항

- **[feat] 이메일 인증(Email Verification)**: 사용자 보안 강화를 위해 이메일 인증 기능을 도입했습니다. 회원 가입 및 프로필 설정에서 이메일 인증을 수행할 수 있습니다.

- **[feat] AppBar 외형 설정**: 기존 프로필 메뉴에 있던 다크모드/라이트모드 전환 기능을 접근성이 좋은 상단 AppBar로 이동했습니다.

- **[feat] AI 질의응답 링크 개선**: RAG 기반 AI 답변에서 참조된 대화 내용의 링크가 누락되던 문제를 수정하여 원본 문맥을 쉽게 파악할 수 있도록 했습니다.
- **[fix] 보안 권고 사항 패치**: 시스템 전반의 보안 취약점을 점검하고 수정했습니다.

### ⚠️ 주의사항 (v1.0.8 업그레이드)

- **데이터베이스 마이그레이션**: v1.0.7 이하 버전에서 업데이트하는 경우, `users` 테이블에 `email_verified` 컬럼을 추가하는 SQL 스크립트를 수동으로 실행해야 합니다.
  ```sql
  ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
  ```

### 📌 v1.0.7 상세 변경 사항

- **[feat] 시스템 대시보드**: 시스템의 CPU, 메모리, 디스크 사용량 등을 실시간으로 모니터링할 수 있는 대시보드를 추가했습니다.

- **[feat] 스케줄러 관리**: 시스템 내부의 스케줄러 작업을 UI에서 직접 제어할 수 있는 기능을 추가했습니다. Cron 표현식을 검증하고 런타임에 스케줄을 변경할 수 있습니다.

- **[feat] 테스트 케이스 대량 삭제**: 개별 삭제만 가능했던 테스트 케이스를 폴더 단위 또는 선택된 항목들을 일괄 삭제할 수 있도록 개선했습니다.
- **[fix] 테스트 케이스 트리 개선**: 트리 구조의 렌더링 성능과 사용성을 개선했습니다.

### 📌 v1.0.5 ~ v1.0.6 상세 변경 사항

- **[feat] 대량 테스트 결과 입력 (Bulk Input)**: 여러 테스트 케이스의 실행 결과를 한 번에 입력할 수 있는 기능을 추가하여 테스트 실행 효율을 높였습니다.

- **[feat] 마크다운 스텝 표시**: 테스트 실행 화면에서 각 테스트 단계(Step)를 마크다운 형식으로 렌더링하여 가독성을 높였습니다.
- **[fix] 스프레드시트 안정화**: 테스트 케이스를 엑셀/스프레드시트 형태로 편집할 때 발생하던 깜빡임 현상과 상위 폴더 삭제 오류를 수정했습니다.

### 📌 v1.0.2 ~ v1.0.4 상세 변경 사항

- **[feat] Test Plan 매핑**: 테스트 플랜과 테스트 케이스 간의 매핑 구조를 유연하게 개선했습니다.
- **[fix] UI 버그 수정**: 테스트 실행 화면에서 첨부파일이 없을 때도 다운로드 버튼이 표시되던 문제와 로고 이미지 권한 문제를 해결했습니다.
- **[fix] 번역 관리 기능 숨김**: 아직 안정화되지 않은 번역 관리 메뉴를 임시로 비활성화했습니다.

### 📌 v1.0.0 ~ v1.0.1 (Initial Release)

- **[v1.0.1] 초기 안정화**: 설치 초기 pgvector 초기화 문제 수정 및 로고 업데이트, 클립보드 이미지 관리 API를 추가했습니다.
- **[v1.0.0] 프로젝트 런칭**: RAG(검색 증강 생성) 기반의 AI 지원 기능을 포함한 테스트 케이스 관리 시스템의 첫 번째 정식 버전을 배포했습니다.

## 📸 전체 스크린샷 갤러리 (Screenshots)

<img src="../images/v1.0.8_Profile_Email_Verify_complete.png" width="200" style="margin:5px"> <img src="../images/v1.0.8_Profile_Email_Verify.png" width="200" style="margin:5px"> <img src="../images/v1.0.8_Profile_Email_Verify_mail.png" width="200" style="margin:5px"> <img src="../images/v1.0.8_AppBar_Apperance.png" width="200" style="margin:5px"> <img src="../images/v1.0.8_Mail_Setting.png" width="200" style="margin:5px"> <img src="../images/v1.0.8_Mail_Setting_detail.png" width="200" style="margin:5px"> <img src="../images/v1.0.8_User_Management_Email.png" width="200" style="margin:5px"> <img src="../images/v1.0.7_01_system_dashboard_system_performanct_metrics.png" width="200" style="margin:5px"> <img src="../images/v1.0.7_02_version_info.png" width="200" style="margin:5px"> <img src="../images/v1.0.7_03_Scheduler_Management.png" width="200" style="margin:5px"> <img src="../images/v1.0.7_04_Scheduler_Management_Edit_Scheduler_Configuration.png" width="200" style="margin:5px"> <img src="../images/01_Light_Login.png" width="200" style="margin:5px"> <img src="../images/02_Light_SignUp.png" width="200" style="margin:5px"> <img src="../images/03_Light_Project_List.png" width="200" style="margin:5px"> <img src="../images/04_Light_Project_Dashboard.png" width="200" style="margin:5px"> <img src="../images/05_Light_Test_CASE_Form_INPUT.png" width="200" style="margin:5px"> <img src="../images/06_Light_Test_CASE_Sprdadsheet_01.png" width="200" style="margin:5px"> <img src="../images/07_Light_Test_CASE_Sprdadsheet_02.png" width="200" style="margin:5px"> <img src="../images/08_Light_Test_Plan_List.png" width="200" style="margin:5px"> <img src="../images/09_00_Light_Test_Execution_List.png" width="200" style="margin:5px"> <img src="../images/09_01_Light_Test_execution_1.png" width="200" style="margin:5px"> <img src="../images/09_02_Light_Test_execution_Input_result.png" width="200" style="margin:5px"> <img src="../images/09_03_Light_Test_execution_Previos_Execution_result.png" width="200" style="margin:5px"> <img src="../images/10_Light_Test_Result_01.png" width="200" style="margin:5px"> <img src="../images/11_Light_Test_Result_02.png" width="200" style="margin:5px"> <img src="../images/12_Light_Automation_Dashboard.png" width="200" style="margin:5px"> <img src="../images/13_Light_Automation_Recent_Result.png" width="200" style="margin:5px"> <img src="../images/14_Light_Automation_Result_Detail_Tests.png" width="200" style="margin:5px"> <img src="../images/15_Light_Automation_Result_Detail_Fail_Tests.png" width="200" style="margin:5px"> <img src="../images/16_Light_Automation_Result_Detail_Slow_Tests.png" width="200" style="margin:5px"> <img src="../images/17_Light_RAG_DOC.png" width="200" style="margin:5px"> <img src="../images/18_Light_RAG_DOC_Chat_01.png" width="200" style="margin:5px"> <img src="../images/19_Light_RAG_DOC_Chat_Referenct_RAC.png" width="200" style="margin:5px"> <img src="../images/20_00_Light_RAG_DOC_Chat_Creation.png" width="200" style="margin:5px"> <img src="../images/20_01_Light_RAG_PDF.png" width="200" style="margin:5px"> <img src="../images/20_02_Light_RAG_View_Document_chunks.png" width="200" style="margin:5px"> <img src="../images/21_Light_User_Profile_Basic_info.png" width="200" style="margin:5px"> <img src="../images/22_Light_User_Profile_Password.png" width="200" style="margin:5px"> <img src="../images/23_Light_User_Profile_Language.png" width="200" style="margin:5px"> <img src="../images/24_Light_User_Profile_Appearance.png" width="200" style="margin:5px"> <img src="../images/25_Light_User_Profile_Jira_Settings.png" width="200" style="margin:5px"> <img src="../images/26_Light_User_Profile_Add_Jira_Settings.png" width="200" style="margin:5px"> <img src="../images/27_light_test_execution_bulk_input.png" width="200" style="margin:5px">
