-- ==========================================
-- 번역 데이터 SQL 스크립트 (전체 버전)
-- Java 코드에서 추출한 모든 번역 키와 데이터
-- ==========================================

-- 중복 제거를 위한 설정
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

-- 번역 키 데이터 INSERT (ON DUPLICATE KEY UPDATE 사용)
INSERT INTO translation_keys (key_name, category, description) VALUES
-- 로그인 관련
('login.title', 'login', '로그인 페이지 제목'),
('login.username', 'login', '사용자명 입력'),
('login.password', 'login', '비밀번호 입력'),
('login.button', 'login', '로그인 버튼'),

-- 대시보드 관련
('dashboard.title', 'dashboard', '대시보드 제목'),

-- 프로젝트 관리
('project.title', 'project', '프로젝트 관리 제목'),

-- 조직 관리
('organization.management.title', 'organization', '조직 관리 제목'),

-- 사용자 관리
('userList.title', 'user', '사용자 관리 제목'),

-- 테스트케이스 폼
('testcase.form.title.create', 'testcase', '테스트케이스 생성 제목'),

-- 테스트 플랜 폼
('testPlan.form.title.create', 'testPlan', '새 테스트 플랜 생성'),
('testPlan.form.title.edit', 'testPlan', '테스트 플랜 수정'),
('testPlan.form.planName', 'testPlan', '플랜 이름'),
('testPlan.form.description', 'testPlan', '설명'),
('testPlan.form.testcaseSelection', 'testPlan', '테스트케이스 선택'),
('testPlan.form.selectedCount', 'testPlan', '선택된 개수'),
('testPlan.form.projectSelectFirst', 'testPlan', '프로젝트 먼저 선택'),
('testPlan.form.button.cancel', 'testPlan', '취소 버튼'),
('testPlan.form.button.save', 'testPlan', '저장 버튼'),
('testPlan.form.button.processing', 'testPlan', '처리 중 버튼'),

-- 테스트 플랜 검증
('testPlan.validation.nameRequired', 'testPlan', '이름 필수'),
('testPlan.validation.testcaseRequired', 'testPlan', '테스트케이스 선택 필수'),
('testPlan.error.saveFailed', 'testPlan', '저장 실패 오류'),

-- 테스트 플랜 목록
('testPlan.list.add', 'testPlan', '테스트 플랜 추가'),
('testPlan.list.table.id', 'testPlan', 'ID'),
('testPlan.list.table.name', 'testPlan', '이름'),
('testPlan.list.table.description', 'testPlan', '설명'),
('testPlan.list.table.testcaseCount', 'testPlan', '테스트케이스 수'),
('testPlan.list.table.createdAt', 'testPlan', '생성일'),
('testPlan.list.table.execute', 'testPlan', '실행'),
('testPlan.list.table.edit', 'testPlan', '수정'),
('testPlan.list.table.delete', 'testPlan', '삭제'),
('testPlan.list.empty.message', 'testPlan', '등록된 테스트 플랜이 없습니다'),

-- 테스트 실행 다이얼로그
('testPlan.execution.dialog.title', 'testPlan', '테스트 실행 다이얼로그 제목'),
('testPlan.execution.button.newExecution', 'testPlan', '새 실행 생성'),
('testPlan.execution.empty.message', 'testPlan', '실행 이력 없음'),
('testPlan.execution.progress', 'testPlan', '진행률'),
('testPlan.execution.action.edit', 'testPlan', '편집'),
('testPlan.execution.action.view', 'testPlan', '전체화면 보기'),
('testPlan.execution.dialog.close', 'testPlan', '닫기'),

-- 테스트 플랜 삭제
('testPlan.delete.dialog.title', 'testPlan', '테스트 플랜 삭제'),
('testPlan.delete.dialog.message', 'testPlan', '삭제 확인 메시지'),
('testPlan.delete.button.cancel', 'testPlan', '취소'),
('testPlan.delete.button.delete', 'testPlan', '삭제'),

-- 테스트 플랜 선택기
('testPlan.selector.label', 'testPlan', '테스트 플랜 선택'),
('testPlan.selector.all', 'testPlan', '전체'),
('testPlan.selector.caseCount', 'testPlan', '케이스 수'),
('testPlan.selector.selected', 'testPlan', '선택된 플랜'),
('testPlan.selector.testcaseCount', 'testPlan', '테스트케이스 개수'),

-- 실행 상태
('testPlan.status.notStarted', 'testPlan', '시작 안됨'),
('testPlan.status.inProgress', 'testPlan', '진행 중'),
('testPlan.status.completed', 'testPlan', '완료됨'),

-- 탭 라벨
('testPlan.tab.label', 'testPlan', '테스트플랜 탭'),
('testExecution.title', 'testExecution', '테스트 실행'),

-- 테스트 실행 목록
('testExecution.list.title', 'testExecution', '실행 이력'),
('testExecution.list.newExecution', 'testExecution', '새 실행'),
('testExecution.list.noExecutions', 'testExecution', '실행 이력 없음'),
('testExecution.list.delete.title', 'testExecution', '실행 삭제'),
('testExecution.list.delete.confirm', 'testExecution', '삭제 확인'),
('testExecution.list.delete.cancel', 'testExecution', '취소'),
('testExecution.list.delete.delete', 'testExecution', '삭제'),

-- 테스트 실행 상태
('testExecution.status.notStarted', 'testExecution', '시작 전'),
('testExecution.status.inProgress', 'testExecution', '진행 중'),
('testExecution.status.completed', 'testExecution', '완료'),

-- 테스트 실행 폼
('testExecution.form.title.create', 'testExecution', '테스트 실행 등록'),
('testExecution.form.title.edit', 'testExecution', '테스트 실행 편집'),
('testExecution.form.executionName', 'testExecution', '실행명'),
('testExecution.form.testPlan', 'testExecution', '테스트플랜'),
('testExecution.form.testPlan.select', 'testExecution', '선택'),
('testExecution.form.description', 'testExecution', '설명'),
('testExecution.form.startImmediately', 'testExecution', '즉시 실행 시작'),
('testExecution.form.startImmediately.description', 'testExecution', '즉시 실행 설명'),

-- 테스트 실행 폼 버튼
('testExecution.form.button.list', 'testExecution', '목록'),
('testExecution.form.button.cancel', 'testExecution', '취소'),
('testExecution.form.button.save', 'testExecution', '저장'),
('testExecution.form.button.saveAndStart', 'testExecution', '저장 및 시작'),
('testExecution.form.button.start', 'testExecution', '실행시작'),
('testExecution.form.button.complete', 'testExecution', '실행완료'),
('testExecution.form.button.restart', 'testExecution', '재실행'),
('testExecution.form.button.hideGuide', 'testExecution', '안내 숨기기'),
('testExecution.form.button.showGuide', 'testExecution', '실행 절차'),

-- 테스트 실행 정보
('testExecution.info.title', 'testExecution', '실행 정보'),
('testExecution.info.status', 'testExecution', '상태'),
('testExecution.info.startDate', 'testExecution', '시작일시'),
('testExecution.info.endDate', 'testExecution', '종료일시'),
('testExecution.info.progress', 'testExecution', '진행률'),
('testExecution.info.total', 'testExecution', '총 개수'),

-- 테스트 실행 가이드
('testExecution.guide.title', 'testExecution', '테스트 실행 절차 안내'),
('testExecution.guide.close', 'testExecution', '닫기'),
('testExecution.guide.step1.title', 'testExecution', '1단계 제목'),
('testExecution.guide.step1.description', 'testExecution', '1단계 설명'),
('testExecution.guide.step2.title', 'testExecution', '2단계 제목'),
('testExecution.guide.step2.description', 'testExecution', '2단계 설명'),
('testExecution.guide.step3.title', 'testExecution', '3단계 제목'),
('testExecution.guide.step3.description', 'testExecution', '3단계 설명'),
('testExecution.guide.step4.title', 'testExecution', '4단계 제목'),
('testExecution.guide.step4.description', 'testExecution', '4단계 설명'),
('testExecution.guide.step5.title', 'testExecution', '5단계 제목'),
('testExecution.guide.step5.description', 'testExecution', '5단계 설명'),
('testExecution.guide.step6.title', 'testExecution', '6단계 제목'),
('testExecution.guide.step6.description', 'testExecution', '6단계 설명'),

-- 테스트 케이스 테이블 헤더
('testExecution.table.header.folderCase', 'testExecution', '폴더/케이스'),
('testExecution.table.header.caseName', 'testExecution', '케이스명'),
('testExecution.table.header.result', 'testExecution', '결과'),
('testExecution.table.header.executedAt', 'testExecution', '실행일시'),
('testExecution.table.header.executedBy', 'testExecution', '실행자'),
('testExecution.table.header.notes', 'testExecution', '비고'),
('testExecution.table.header.jiraId', 'testExecution', 'JIRA ID'),
('testExecution.table.header.resultInput', 'testExecution', '결과입력'),
('testExecution.table.header.previousResults', 'testExecution', '이전결과'),
('testExecution.table.header.attachments', 'testExecution', '첨부파일'),

-- 테스트 케이스 테이블 버튼
('testExecution.table.button.resultInput', 'testExecution', '결과입력'),
('testExecution.table.button.previousResults', 'testExecution', '이전결과'),
('testExecution.table.button.attachments', 'testExecution', '첨부파일'),

-- 페이지네이션
('testExecution.pagination.info', 'testExecution', '페이지네이션 정보'),
('testExecution.pagination.page', 'testExecution', '페이지'),
('testExecution.table.noTestCases', 'testExecution', '테스트 케이스 없음'),

-- 이전 결과 다이얼로그
('testExecution.previousResults.title', 'testExecution', '이전 실행 결과'),
('testExecution.previousResults.noResults', 'testExecution', '이전 결과 없음'),
('testExecution.previousResults.close', 'testExecution', '닫기'),
('testExecution.previousResults.table.executedAt', 'testExecution', '실행일시'),
('testExecution.previousResults.table.result', 'testExecution', '결과'),
('testExecution.previousResults.table.executionId', 'testExecution', '실행ID'),
('testExecution.previousResults.table.executionName', 'testExecution', '실행명'),
('testExecution.previousResults.table.executedBy', 'testExecution', '실행자'),
('testExecution.previousResults.table.notes', 'testExecution', '비고'),
('testExecution.previousResults.table.jiraId', 'testExecution', 'JIRA ID'),
('testExecution.previousResults.table.attachments', 'testExecution', '첨부파일'),

-- 첨부파일 다이얼로그
('testExecution.attachments.title', 'testExecution', '테스트 결과 첨부파일'),
('testExecution.attachments.close', 'testExecution', '닫기'),

-- JIRA 이슈 링크
('testExecution.jira.urlNotSet', 'testExecution', 'JIRA URL 미설정'),

-- 성공 메시지
('testExecution.success.savedAndStarted', 'testExecution', '저장 및 시작 성공'),

-- 추가 실행 관련 키들
('testExecution.form.status', 'testExecution', '상태'),
('testExecution.table.folderCase', 'testExecution', '폴더/케이스'),
('testExecution.form.titleNew', 'testExecution', '테스트 실행 등록'),
('testExecution.form.titleEdit', 'testExecution', '테스트 실행 편집'),
('testExecution.actions.enterResult', 'testExecution', '결과입력'),
('testExecution.actions.prevResults', 'testExecution', '이전결과'),
('testExecution.actions.startExecution', 'testExecution', '실행시작'),
('testExecution.actions.completeExecution', 'testExecution', '실행완료'),
('testExecution.actions.rerunExecution', 'testExecution', '재실행'),
('testExecution.dialog.attachments.title', 'testExecution', '첨부파일'),
('testExecution.dialog.attachments.close', 'testExecution', '닫기'),
('testExecution.progress.completed', 'testExecution', '완료'),
('testExecution.progress.total', 'testExecution', '전체'),

-- 기타 실행 관련
('testExecution.table.caseName', 'testExecution', '케이스명'),
('testExecution.table.result', 'testExecution', '결과'),
('testExecution.table.executedAt', 'testExecution', '실행일시'),
('testExecution.table.executedBy', 'testExecution', '실행자'),
('testExecution.table.notes', 'testExecution', '비고'),
('testExecution.table.jiraId', 'testExecution', 'JIRA ID'),
('testExecution.table.enterResult', 'testExecution', '결과입력'),
('testExecution.table.prevResults', 'testExecution', '이전결과'),
('testExecution.table.attachments', 'testExecution', '첨부파일'),
('testExecution.table.executionId', 'testExecution', '실행ID'),
('testExecution.table.executionName', 'testExecution', '실행명'),
('testExecution.table.viewAttachments', 'testExecution', '첨부파일 보기'),
('testExecution.form.registerTitle', 'testExecution', '테스트 실행 등록'),
('testExecution.form.executionInfo', 'testExecution', '실행 정보'),
('testExecution.form.startDate', 'testExecution', '시작일시'),
('testExecution.form.endDate', 'testExecution', '종료일시'),
('testExecution.form.editTitle', 'testExecution', '테스트 실행 편집'),
('testExecution.form.saveAndStart', 'testExecution', '저장 후 시작'),
('testExecution.form.progress', 'testExecution', '진행률'),
('testExecution.form.startImmediatelyLabel', 'testExecution', '즉시 시작'),
('testExecution.form.startImmediatelyDescription', 'testExecution', '저장 후 바로 실행 시작'),
('testExecution.actions.restartExecution', 'testExecution', '재실행'),
('testExecution.prevResults.title', 'testExecution', '이전 실행 결과'),
('testExecution.prevResults.noResults', 'testExecution', '이전 실행 결과 없음'),

-- 공통 키들
('common.list', 'common', '목록'),
('common.cancel', 'common', '취소'),
('common.save', 'common', '저장'),
('common.button.save', 'common', '저장 버튼'),
('common.button.cancel', 'common', '취소 버튼'),
('common.button.close', 'common', '닫기 버튼'),
('common.button.refresh', 'common', '새로고침 버튼'),
('common.button.retry', 'common', '다시 시도 버튼'),
('common.empty', 'common', '빈 값'),

-- 테스트 결과 메인 페이지
('testResult.mainPage.title', 'testResult', '테스트 결과'),
('testResult.mainPage.description', 'testResult', '테스트 결과 페이지 설명'),

-- 테스트 결과 탭
('testResult.tab.statistics', 'testResult', '통계'),
('testResult.tab.statisticsFull', 'testResult', '통계 대시보드'),
('testResult.tab.statisticsDescription', 'testResult', '통계 탭 설명'),
('testResult.tab.trend', 'testResult', '추이'),
('testResult.tab.trendFull', 'testResult', '추이 분석'),
('testResult.tab.trendDescription', 'testResult', '추이 탭 설명'),
('testResult.tab.table', 'testResult', '테이블'),
('testResult.tab.tableFull', 'testResult', '상세 테이블'),
('testResult.tab.tableDescription', 'testResult', '테이블 탭 설명'),
('testResult.tab.report', 'testResult', '리포트'),
('testResult.tab.reportFull', 'testResult', '상세 리포트'),
('testResult.tab.reportDescription', 'testResult', '리포트 탭 설명'),

-- 테스트 결과 입력 폼
('testResult.form.title', 'testResult', '테스트 결과 입력'),
('testResult.form.testResult', 'testResult', '테스트 결과'),
('testResult.form.preCondition', 'testResult', '사전 조건'),
('testResult.form.testSteps', 'testResult', '테스트 단계'),
('testResult.form.expectedResult', 'testResult', '기대 결과'),
('testResult.form.notes', 'testResult', '노트'),
('testResult.form.notesPlaceholder', 'testResult', '노트 입력란'),
('testResult.form.notesHelp', 'testResult', '노트 도움말'),
('testResult.form.notesLimitWarning', 'testResult', '노트 글자수 경고'),
('testResult.form.notesLimitError', 'testResult', '노트 글자수 오류'),

-- 파일 첨부
('testResult.form.fileAttachment', 'testResult', '파일 첨부'),
('testResult.form.fileSelect', 'testResult', '파일 선택'),
('testResult.form.fileUploading', 'testResult', '업로드 중'),
('testResult.form.fileFormat', 'testResult', '파일 형식'),
('testResult.form.newAttachments', 'testResult', '새 첨부파일'),
('testResult.form.attachments', 'testResult', '첨부파일'),
('testResult.form.attachmentsNote', 'testResult', '첨부파일 안내'),

-- JIRA 연동
('testResult.form.jiraIntegration', 'testResult', 'JIRA 이슈 연동'),
('testResult.form.jiraIssueId', 'testResult', 'JIRA 이슈 ID'),
('testResult.form.jiraIssuePlaceholder', 'testResult', 'JIRA 이슈 입력란'),
('testResult.form.jiraComment', 'testResult', 'JIRA 코멘트'),
('testResult.form.jiraDetected', 'testResult', 'JIRA 이슈 감지'),
('testResult.form.jiraDetectedShort', 'testResult', 'JIRA 이슈 감지 짧은 메시지'),

-- 테스트 케이스 결과 페이지
('testCaseResult.page.title', 'testResult', '테스트 결과 입력'),

-- JIRA 관련 추가 키들
('testResult.jira.connectionCheckFailed', 'testResult', 'JIRA 연결 실패'),
('testResult.jira.placeholder', 'testResult', 'JIRA 입력란 도움말'),
('testResult.jira.detectedIssues', 'testResult', '감지된 이슈'),

-- 파일 에러 메시지
('testResult.file.sizeError', 'testResult', '파일 크기 오류'),
('testResult.file.typeError', 'testResult', '파일 형식 오류'),
('testResult.file.allowedFormats', 'testResult', '허용 파일 형식'),
('testResult.file.newAttachmentsCount', 'testResult', '새 첨부파일 개수'),
('testResult.file.attachedFilesCount', 'testResult', '첨부된 파일 개수'),
('testResult.file.saveToViewAttachments', 'testResult', '첨부파일 저장 안내'),

-- 에러 메시지
('testResult.error.saveFailed', 'testResult', '결과 저장 실패'),
('testResult.error.testCaseLoadFailed', 'testResult', '테스트케이스 로드 실패'),
('testResult.error.resultRequired', 'testResult', '결과 필수'),

-- 테스트 결과 상태
('testResult.status.pass', 'testResult', '성공'),
('testResult.status.fail', 'testResult', '실패'),
('testResult.status.blocked', 'testResult', '차단됨'),
('testResult.status.notRun', 'testResult', '미실행'),
('testResult.status.error', 'testResult', '에러'),

-- 테스트 결과 테이블
('testResult.table.title', 'testResult', '테스트 결과 상세 목록'),
('testResult.table.resultCount', 'testResult', '결과 개수'),
('testResult.table.filtered', 'testResult', '필터됨'),
('testResult.table.loadError', 'testResult', '테이블 로드 에러'),

-- 테스트 결과 차트
('testResult.chart.distribution', 'testResult', '테스트 결과 분포'),
('testResult.chart.loading', 'testResult', '차트 로딩'),
('testResult.chart.noData', 'testResult', '차트 데이터 없음'),
('testResult.chart.total', 'testResult', '차트 총계'),
('testResult.chart.compareTitle', 'testResult', '테스트 결과 비교'),
('testResult.chart.percentageView', 'testResult', '퍼센트 보기'),
('testResult.chart.tooltip', 'testResult', '차트 툴팁'),
('testResult.chart.yAxisCount', 'testResult', 'Y축 개수'),
('testResult.chart.yAxisPercent', 'testResult', 'Y축 비율'),
('testResult.chart.compareItems', 'testResult', '비교 항목'),
('testResult.chart.loadingData', 'testResult', '차트 데이터 로딩'),
('testResult.chart.noCompareData', 'testResult', '비교 데이터 없음'),

-- 테스트 결과 통계 카드
('testResult.statistics.title', 'testResult', '테스트 결과 통계'),
('testResult.statistics.loading', 'testResult', '로딩 중'),
('testResult.statistics.error', 'testResult', '통계 에러'),
('testResult.statistics.noData', 'testResult', '데이터 없음'),
('testResult.statistics.successRate', 'testResult', '성공률'),
('testResult.statistics.totalTests', 'testResult', '총 테스트'),
('testResult.statistics.totalCount', 'testResult', '총 개수'),

-- 테스트 결과 파이차트
('testResult.pieChart.title', 'testResult', '테스트 결과 분포'),
('testResult.pieChart.loading', 'testResult', '차트 데이터 로딩'),
('testResult.pieChart.noData', 'testResult', '차트 데이터 없음'),
('testResult.pieChart.count', 'testResult', '개수'),
('testResult.pieChart.percentage', 'testResult', '비율'),
('testResult.pieChart.totalTestCases', 'testResult', '총 테스트케이스'),

-- 통계 필터 패널
('testResult.filter.title', 'testResult', '통계 필터'),
('testResult.filter.applied', 'testResult', '적용된 필터'),
('testResult.filter.refresh', 'testResult', '새로고침'),
('testResult.filter.refreshTooltip', 'testResult', '새로고침 툴팁'),
('testResult.filter.clear', 'testResult', '초기화'),
('testResult.filter.clearTooltip', 'testResult', '초기화 툴팁'),
('testResult.filter.testPlan', 'testResult', '테스트 플랜'),
('testResult.filter.allPlans', 'testResult', '전체 플랜'),
('testResult.filter.testExecution', 'testResult', '테스트 실행'),
('testResult.filter.allExecutions', 'testResult', '전체 실행'),
('testResult.filter.period', 'testResult', '기간'),
('testResult.filter.allPeriod', 'testResult', '전체 기간'),
('testResult.filter.today', 'testResult', '오늘'),
('testResult.filter.week', 'testResult', '최근 1주'),
('testResult.filter.month', 'testResult', '최근 1개월'),
('testResult.filter.quarter', 'testResult', '최근 3개월'),
('testResult.filter.viewType', 'testResult', '보기 형태'),
('testResult.filter.overviewView', 'testResult', '전체 개요'),
('testResult.filter.planView', 'testResult', '플랜별 비교'),
('testResult.filter.executorView', 'testResult', '실행자별 비교'),
('testResult.filter.activeFilters', 'testResult', '적용 중인 필터'),
('testResult.filter.planPrefix', 'testResult', '플랜 접두사'),
('testResult.filter.executionPrefix', 'testResult', '실행 접두사'),
('testResult.filter.periodPrefix', 'testResult', '기간 접두사'),

-- JIRA 상태 요약 카드
('jira.summary.title', 'jira', 'JIRA 상태 요약'),
('jira.summary.loading', 'jira', 'JIRA 로딩'),
('jira.summary.error', 'jira', 'JIRA 에러'),
('jira.summary.noData', 'jira', 'JIRA 데이터 없음'),
('jira.summary.filterAll', 'jira', '전체 필터'),
('jira.summary.filterActive', 'jira', '진행중 필터'),
('jira.summary.filterFailed', 'jira', '실패 필터'),
('jira.summary.filterPassed', 'jira', '통과 필터'),
('jira.summary.refresh', 'jira', '새로고침'),
('jira.summary.testResult', 'jira', '테스트 결과'),
('jira.summary.latestTest', 'jira', '최근 테스트'),
('jira.summary.executionTime', 'jira', '실행 시간'),
('jira.summary.sync', 'jira', '동기화'),
('jira.summary.summaryStats', 'jira', '요약 통계'),
('jira.summary.totalIssues', 'jira', '전체 이슈'),
('jira.summary.activeIssues', 'jira', '활성 이슈'),
('jira.summary.allPassed', 'jira', '전체 통과'),
('jira.summary.hasFailed', 'jira', '실패 포함'),

-- ProjectHeader 번역 키들
('projectHeader.breadcrumb.projects', 'navigation', '프로젝트 브레드크럼'),
('projectHeader.tabs.dashboard', 'navigation', '대시보드 탭'),
('projectHeader.tabs.testCases', 'navigation', '테스트케이스 탭'),
('projectHeader.tabs.testExecution', 'navigation', '테스트실행 탭'),
('projectHeader.tabs.testResults', 'navigation', '테스트결과 탭'),
('projectHeader.tabs.automation', 'navigation', '자동화 테스트 탭'),

-- TestResultStatisticsDashboard 번역 키들
('testResultDashboard.chart.planComparison', 'testResult', '테스트 플랜별 결과 비교'),
('testResultDashboard.chart.executorComparison', 'testResult', '실행자별 결과 비교'),
('testResultDashboard.summary.title', 'testResult', '통계 요약'),
('testResultDashboard.summary.executionRate', 'testResult', '실행률'),
('testResultDashboard.summary.successRate', 'testResult', '성공률'),
('testResultDashboard.summary.jiraLinkRate', 'testResult', 'JIRA 연동률'),
('testResultDashboard.summary.lastUpdated', 'testResult', '최종 업데이트'),
('testResultDashboard.summary.unknown', 'testResult', '알 수 없음'),

-- TestResultTrendAnalysis 번역 키들
('testTrendAnalysis.error.comparisonLoadFailed', 'testResult', '비교 데이터 로드 실패'),
('testTrendAnalysis.error.trendLoadFailed', 'testResult', '추이 데이터 로드 실패'),
('testTrendAnalysis.loading.trendData', 'testResult', '추이 데이터 로딩'),
('testTrendAnalysis.noData.title', 'testResult', '추이 데이터 없음'),
('testTrendAnalysis.noData.description', 'testResult', '추이 데이터 없음 설명'),
('testTrendAnalysis.period.label', 'testResult', '기간'),
('testTrendAnalysis.period.last7days', 'testResult', '최근 7일'),
('testTrendAnalysis.period.last15days', 'testResult', '최근 15일'),
('testTrendAnalysis.period.last30days', 'testResult', '최근 30일'),
('testTrendAnalysis.period.last60days', 'testResult', '최근 60일'),
('testTrendAnalysis.period.last90days', 'testResult', '최근 90일'),
('testTrendAnalysis.chartType.line', 'testResult', '라인'),
('testTrendAnalysis.chartType.area', 'testResult', '영역'),
('testTrendAnalysis.summary.avgSuccessRate', 'testResult', '평균 성공률'),
('testTrendAnalysis.summary.avgCompletionRate', 'testResult', '평균 완료율'),
('testTrendAnalysis.summary.dataPoints', 'testResult', '데이터 포인트'),
('testTrendAnalysis.summary.successRateChange', 'testResult', '성공률 변화'),
('testTrendAnalysis.chart.overallTrend', 'testResult', '테스트 결과 변화 추이'),
('testTrendAnalysis.chart.testPlanComparison', 'testResult', '테스트 플랜별 결과 비교'),
('testTrendAnalysis.chart.assigneeComparison', 'testResult', '실행자별 결과 비교'),
('testTrendAnalysis.chart.successAndCompletionRate', 'testResult', '성공률 및 완료율 추이'),
('testTrendAnalysis.chart.successRate', 'testResult', '성공률'),
('testTrendAnalysis.chart.completionRate', 'testResult', '완료율'),
('testTrendAnalysis.tooltip.overallSuccessRate', 'testResult', '전체 성공률'),
('testTrendAnalysis.tooltip.plan', 'testResult', 'Plan'),
('testTrendAnalysis.tooltip.user', 'testResult', 'User'),
('testTrendAnalysis.tooltip.unit', 'testResult', '건'),
('testTrendAnalysis.legend.overallSuccessRate', 'testResult', '전체 성공률'),
('testTrendAnalysis.legend.plan', 'testResult', 'Plan'),
('testTrendAnalysis.legend.user', 'testResult', 'User'),
('testTrendAnalysis.prompt.selectTestPlan', 'testResult', '비교할 테스트 플랜을 선택해주세요'),
('testTrendAnalysis.prompt.selectAssignee', 'testResult', '비교할 실행자를 선택해주세요')

ON DUPLICATE KEY UPDATE
category = VALUES(category),
description = VALUES(description);

-- 한국어 번역 데이터
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
-- 공통 한국어
('ko', 'common.ok', '확인'),
('ko', 'common.cancel', '취소'),
('ko', 'common.save', '저장'),
('ko', 'common.delete', '삭제'),
('ko', 'common.edit', '편집'),
('ko', 'common.add', '추가'),
('ko', 'common.search', '검색'),
('ko', 'common.filter', '필터'),
('ko', 'common.refresh', '새로고침'),
('ko', 'common.loading', '로딩 중...'),
('ko', 'common.actions', '작업'),
('ko', 'common.status', '상태'),
('ko', 'common.date', '날짜'),
('ko', 'common.name', '이름'),
('ko', 'common.description', '설명'),

-- 네비게이션 한국어
('ko', 'nav.dashboard', '대시보드'),
('ko', 'nav.testcases', '테스트케이스'),
('ko', 'nav.testplans', '테스트플랜'),
('ko', 'nav.testexecution', '테스트실행'),
('ko', 'nav.testresults', '테스트결과'),
('ko', 'nav.automation', '자동화 테스트'),

-- 대시보드 한국어
('ko', 'dashboard.title', '프로젝트 대시보드'),
('ko', 'dashboard.totalProjects', '전체 프로젝트'),
('ko', 'dashboard.totalTestCases', '전체 테스트케이스'),
('ko', 'dashboard.totalTestPlans', '전체 테스트플랜'),
('ko', 'dashboard.totalTestExecutions', '전체 테스트실행'),
('ko', 'dashboard.recentActivity', '최근 활동'),
('ko', 'dashboard.projectProgress', '프로젝트 진행률'),
('ko', 'dashboard.testCasesByCategory', '카테고리별 테스트케이스'),
('ko', 'dashboard.testExecutionTrend', '테스트 실행 추세'),
('ko', 'dashboard.passFailRatio', '통과/실패 비율'),
('ko', 'dashboard.summary', '요약'),
('ko', 'dashboard.details', '세부사항'),
('ko', 'dashboard.statistics', '통계'),
('ko', 'dashboard.chart.passRate', '통과율'),
('ko', 'dashboard.chart.failRate', '실패율'),
('ko', 'dashboard.chart.pending', '대기중'),
('ko', 'dashboard.noData', '표시할 데이터가 없습니다'),
('ko', 'dashboard.loadingData', '데이터를 불러오는 중...'),

-- 프로젝트 한국어
('ko', 'project.list', '프로젝트 목록'),
('ko', 'project.create', '새 프로젝트'),
('ko', 'project.edit', '프로젝트 편집'),
('ko', 'project.delete', '프로젝트 삭제'),
('ko', 'project.open', '프로젝트 열기'),
('ko', 'project.settings', '프로젝트 설정'),

-- 테스트케이스 한국어
('ko', 'testcase.list', '테스트케이스 목록'),
('ko', 'testcase.create', '새 테스트케이스'),
('ko', 'testcase.edit', '테스트케이스 편집'),
('ko', 'testcase.delete', '테스트케이스 삭제'),
('ko', 'testcase.steps', '테스트 단계'),
('ko', 'testcase.expectedResult', '예상 결과'),
('ko', 'testcase.actualResult', '실제 결과'),
('ko', 'testcase.priority', '우선순위'),
('ko', 'testcase.category', '카테고리'),

-- 테스트플랜 한국어
('ko', 'testplan.list', '테스트플랜 목록'),
('ko', 'testplan.create', '새 테스트플랜'),
('ko', 'testplan.edit', '테스트플랜 편집'),
('ko', 'testplan.delete', '테스트플랜 삭제'),
('ko', 'testplan.execute', '테스트플랜 실행'),

-- 테스트실행 한국어
('ko', 'execution.start', '시작'),
('ko', 'execution.stop', '중지'),
('ko', 'execution.pause', '일시정지'),
('ko', 'execution.resume', '재개'),
('ko', 'execution.pass', '통과'),
('ko', 'execution.fail', '실패'),
('ko', 'execution.skip', '건너뛰기'),

-- 사용자 한국어
('ko', 'user.profile', '프로필'),
('ko', 'user.settings', '설정'),
('ko', 'user.logout', '로그아웃'),
('ko', 'user.login', '로그인'),
('ko', 'user.register', '회원가입'),

-- 메시지 한국어
('ko', 'message.saveSuccess', '성공적으로 저장되었습니다'),
('ko', 'message.saveError', '저장에 실패했습니다'),
('ko', 'message.deleteSuccess', '성공적으로 삭제되었습니다'),
('ko', 'message.deleteError', '삭제에 실패했습니다'),
('ko', 'message.confirmDelete', '정말 삭제하시겠습니까?'),

-- 검증 한국어
('ko', 'validation.required', '필수 입력 항목입니다'),
('ko', 'validation.invalid', '유효하지 않은 값입니다'),
('ko', 'validation.minLength', '최소 길이를 만족해야 합니다'),
('ko', 'validation.maxLength', '최대 길이를 초과했습니다');

-- 영어 번역 데이터
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
-- 공통 영어
('en', 'common.ok', 'OK'),
('en', 'common.cancel', 'Cancel'),
('en', 'common.save', 'Save'),
('en', 'common.delete', 'Delete'),
('en', 'common.edit', 'Edit'),
('en', 'common.add', 'Add'),
('en', 'common.search', 'Search'),
('en', 'common.filter', 'Filter'),
('en', 'common.refresh', 'Refresh'),
('en', 'common.loading', 'Loading...'),
('en', 'common.actions', 'Actions'),
('en', 'common.status', 'Status'),
('en', 'common.date', 'Date'),
('en', 'common.name', 'Name'),
('en', 'common.description', 'Description'),

-- 네비게이션 영어
('en', 'nav.dashboard', 'Dashboard'),
('en', 'nav.testcases', 'Test Cases'),
('en', 'nav.testplans', 'Test Plans'),
('en', 'nav.testexecution', 'Test Execution'),
('en', 'nav.testresults', 'Test Results'),
('en', 'nav.automation', 'Automation Tests'),

-- 대시보드 영어
('en', 'dashboard.title', 'Project Dashboard'),
('en', 'dashboard.totalProjects', 'Total Projects'),
('en', 'dashboard.totalTestCases', 'Total Test Cases'),
('en', 'dashboard.totalTestPlans', 'Total Test Plans'),
('en', 'dashboard.totalTestExecutions', 'Total Test Executions'),
('en', 'dashboard.recentActivity', 'Recent Activity'),
('en', 'dashboard.projectProgress', 'Project Progress'),
('en', 'dashboard.testCasesByCategory', 'Test Cases by Category'),
('en', 'dashboard.testExecutionTrend', 'Test Execution Trend'),
('en', 'dashboard.passFailRatio', 'Pass/Fail Ratio'),
('en', 'dashboard.summary', 'Summary'),
('en', 'dashboard.details', 'Details'),
('en', 'dashboard.statistics', 'Statistics'),
('en', 'dashboard.chart.passRate', 'Pass Rate'),
('en', 'dashboard.chart.failRate', 'Fail Rate'),
('en', 'dashboard.chart.pending', 'Pending'),
('en', 'dashboard.noData', 'No data to display'),
('en', 'dashboard.loadingData', 'Loading data...'),

-- 프로젝트 영어
('en', 'project.list', 'Project List'),
('en', 'project.create', 'New Project'),
('en', 'project.edit', 'Edit Project'),
('en', 'project.delete', 'Delete Project'),
('en', 'project.open', 'Open Project'),
('en', 'project.settings', 'Project Settings'),

-- 테스트케이스 영어
('en', 'testcase.list', 'Test Case List'),
('en', 'testcase.create', 'New Test Case'),
('en', 'testcase.edit', 'Edit Test Case'),
('en', 'testcase.delete', 'Delete Test Case'),
('en', 'testcase.steps', 'Test Steps'),
('en', 'testcase.expectedResult', 'Expected Result'),
('en', 'testcase.actualResult', 'Actual Result'),
('en', 'testcase.priority', 'Priority'),
('en', 'testcase.category', 'Category'),

-- 테스트플랜 영어
('en', 'testplan.list', 'Test Plan List'),
('en', 'testplan.create', 'New Test Plan'),
('en', 'testplan.edit', 'Edit Test Plan'),
('en', 'testplan.delete', 'Delete Test Plan'),
('en', 'testplan.execute', 'Execute Test Plan'),

-- 테스트실행 영어
('en', 'execution.start', 'Start'),
('en', 'execution.stop', 'Stop'),
('en', 'execution.pause', 'Pause'),
('en', 'execution.resume', 'Resume'),
('en', 'execution.pass', 'Pass'),
('en', 'execution.fail', 'Fail'),
('en', 'execution.skip', 'Skip'),

-- 사용자 영어
('en', 'user.profile', 'Profile'),
('en', 'user.settings', 'Settings'),
('en', 'user.logout', 'Logout'),
('en', 'user.login', 'Login'),
('en', 'user.register', 'Register'),

-- 메시지 영어
('en', 'message.saveSuccess', 'Successfully saved'),
('en', 'message.saveError', 'Failed to save'),
('en', 'message.deleteSuccess', 'Successfully deleted'),
('en', 'message.deleteError', 'Failed to delete'),
('en', 'message.confirmDelete', 'Are you sure you want to delete?'),

-- 검증 영어
('en', 'validation.required', 'This field is required'),
('en', 'validation.invalid', 'Invalid value'),
('en', 'validation.minLength', 'Minimum length requirement not met'),
('en', 'validation.maxLength', 'Maximum length exceeded');