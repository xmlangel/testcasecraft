# Release Note v1.0.9
-2025-11-28
* [fix] 테스트 실행화면 정리
  - 레이아웃 조정
* [fix] 테스트 결과에 첨부 파일 없을때 버튼 표시 안되던 문제 수정

# Release Note v1.0.8
## v1.0.8
-2025-11-26
* [feat] Appearance 에 있던 Dark/Light 전환을 AppBar 로이동
* [feat] AI 질의응답에서 대화내용 링크 없던 사항 링크 연결
* [feat] 사용자 이메일 인증 구현
* [fix] 일부 다국어적용
* [fix] 보안권고사항 수정

## 주의
- 최초 설치는 문제없음
- 1.0.7 이전 버전 사용자는 1.0.8 이상 버전으로 업그레이드시 아래 스크립트를 실행해야함.

```
docker compose exec postgres psql -U testcase_user -d testcase_management -c "ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;"
```

<table>
  <tr>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/v1.0.8_AppBar_Apperance.png"  /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/v1.0.8_Mail_Setting.png"  /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/v1.0.8_Mail_Setting_detail.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/v1.0.8_Profile_Email_Verify.png"  /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/v1.0.8_Profile_Email_Verify_complete.png" width="40%" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/v1.0.8_Profile_Email_Verify_mail.png"  /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/v1.0.8_User_Management_Email.png" /></td>
    <td></td>
  </tr>
</table>
# Release Note v1.0.7
## v1.0.7
-2025-11-25
* [feat] 사용자 프로필 에 버전 정보표기  
	- 백엔드
	- 프런트엔드
	- RAG서비스
* [feat] 시스템 대시보드에 성능 모니터링 기능추가
	- 백엔드 API 추가
	- 화면추가
* [feat] 시스템 스케줄러 설정화면 추가
	- SchedulerConfigDialog로 Cron 표현식 편집  
	- 관리자 메뉴에 '스케줄러 관리' 항목 추가  
	- 주요 기능:  
	   - 런타임 스케줄 변경 (서버 재시작 불필요)  
	   - 활성화/비활성화 토글  
	   - 즉시 실행 기능  
	   - 다음 실행 시간 미리보기  
	   - Cron 표현식 검증 및 예시 제공
* [feat] 테스트케이스 대량삭제 추가
	- 1개 단위 삭제되던걸 대량삭제 용이한 구조로 변경
* [fix] 테스트 케이스 트리 개선
* [fix] AI 질의응답 새 스래드 생성시 이전 내용 같이 전송하던 부분을 초기화 하도록 수정
* [fix] 누락된 다국어 일부적용
* [fix] 조직대시보드-->시스템 대시보드 로 이름변경
* [fix] 보안검토사항 수정 : CVE-2021-22573
* [fix] 첨부파일이 있을때 테스트 케이스 삭제 안되던 문제 수정 테스트 케이스를 삭제하면 테스트케이스에 있는 첨부파일도 같이 삭제되도록함.
<table>
  <tr>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/v1.0.7_01_system_dashboard_system_performanct_metrics.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/v1.0.7_02_version_info.png"/></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/v1.0.7_03_Scheduler_Management.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/v1.0.7_04_Scheduler_Management_Edit_Scheduler_Configuration.png"/></td>
  </tr>
</table>
# Release Note v1.0.6

## v1.0.5, v1.0.6
-2025-11-24
- [feat] 대량 테스트 결과 입력추가
- [feat] 대량 테스트 결과(Bulk test Result) 입력 API 추가
- [feat] 테스트 결과 입력창에 이전/다음버튼 표시
- [feat] 테스트 실행화면 테스트 스탭 항목 마크다운으로 표시
- [fix] RAG 채팅창에서 테스트 케이스 생성시 버전기록 안되던 문제 수정
- [fix] 테스트케이스 스프레드시트로 저장시 깜빡임 문제 수정
- [fix] 테스트케이스 스프레드시트에서 상위폴더 삭제 안되던 문제 수정
- [fix] 고급 스프레드시트 숨김

 
## v1.0.2, v1.0.3, v1.0.4
-2025-11-22
- [fix] 테스트실헹에서 첨부파일 없을때에도 버튼 표시 문제 수정
- [fix] 로고 이미지 권한문제로 표출안되던 문제 수정
- [fix] 번역관리 숨김
- [feat] Test Plan 매핑 추가

## v1.0.1
-2025-11-21
- [fix] 초기 설치시 pgvector 초기화 안되던 문제수정
- [feat] TestcaseCraft 로고추가
- [feat] 클립보드 첨부파일 삭제 API 추가

## v1.0.0
-2025-11-20
- [feat] RAG 기능추가
 - 1.0.0 1차배포
 - 보안취약 사항들 업데이트

## v0.0.1, v0.0.3
-2025-08-27
 - 테스트케이스 관리 프로그램 최초 등록
 

<table>
  <tr>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/01_Light_Login.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/02_Light_SignUp.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/03_Light_Project_List.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/04_Light_Project_Dashboard.png" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/05_Light_Test_CASE_Form_INPUT.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/06_Light_Test_CASE_Sprdadsheet_01.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/07_Light_Test_CASE_Sprdadsheet_02.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/08_Light_Test_Plan_List.png" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/09_00_Light_Test_Execution_List.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/09_01_Light_Test_execution_1.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/09_02_Light_Test_execution_Input_result.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/09_03_Light_Test_execution_Previos_Execution_result.png" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/10_Light_Test_Result_01.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/11_Light_Test_Result_02.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/12_Light_Automation_Dashboard.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/13_Light_Automation_Recent_Result.png" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/14_Light_Automation_Result_Detail_Tests.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/15_Light_Automation_Result_Detail_Fail_Tests.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/16_Light_Automation_Result_Detail_Slow_Tests.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/17_Light_RAG_DOC.png" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/18_Light_RAG_DOC_Chat_01.png" /></td>
    <td><img src="https://github.com/xmlangel/testcasecraft/blob/master/doc/19_Light