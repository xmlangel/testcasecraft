// src/main/java/com/testcase/testcasemanagement/util/ExportLabels.java
package com.testcase.testcasemanagement.util;

import com.testcase.testcasemanagement.util.LabelTable.Entry;
import java.util.List;

/**
 * ICT-473: 서버가 만드는 결과 내보내기 파일(엑셀·CSV·PDF)의 문구.
 *
 * <p>번역 키 등록과 한국어·영어 시드, {@code ExportService} 가 모두 이 표를 읽는다. 문구를 고치거나 더할 때 이 파일만 고치면 세 곳이 함께 바뀐다.
 * 번역 DB 를 쓸 수 없을 때는 여기 적힌 값을 그대로 쓴다.
 */
public final class ExportLabels {

  private ExportLabels() {}

  public static final String PREFIX = "testResult.serverExport.";

  public static final LabelTable TABLE =
      new LabelTable(
          PREFIX,
          List.of(
              // 열 머리글 (ExportService 의 필드 이름과 같다)
              new Entry("column.testPlanName", "내보내기 열: 테스트플랜명", "테스트플랜명", "Test Plan"),
              new Entry("column.testExecutionName", "내보내기 열: 테스트실행명", "테스트실행명", "Test Execution"),
              new Entry("column.folderPath", "내보내기 열: 폴더 경로", "폴더 경로", "Folder Path"),
              new Entry("column.testCaseName", "내보내기 열: 테스트케이스명", "테스트케이스명", "Test Case"),
              new Entry("column.result", "내보내기 열: 결과", "결과", "Result"),
              new Entry("column.executedAt", "내보내기 열: 실행일시", "실행일시", "Executed At"),
              new Entry("column.executorName", "내보내기 열: 실행자", "실행자", "Executor"),
              new Entry("column.notes", "내보내기 열: 비고", "비고", "Notes"),
              new Entry("column.jiraIssueKey", "내보내기 열: JIRA ID", "JIRA ID", "JIRA ID"),
              new Entry("column.jiraStatus", "내보내기 열: JIRA 상태", "JIRA 상태", "JIRA Status"),
              new Entry("column.jiraSyncStatus", "내보내기 열: JIRA 동기화", "JIRA 동기화", "JIRA Sync"),
              new Entry("column.priority", "내보내기 열: 우선순위", "우선순위", "Priority"),
              new Entry("column.category", "내보내기 열: 카테고리", "카테고리", "Category"),
              new Entry("column.preCondition", "내보내기 열: 사전설정", "사전설정", "Pre-condition"),
              new Entry("column.expectedResults", "내보내기 열: 전체 예상결과", "전체 예상결과", "Expected Results"),
              new Entry("column.steps", "내보내기 열: 스텝 정보", "스텝 정보", "Steps"),
              new Entry("column.stepResults", "내보내기 열: 스텝 결과", "스텝 결과", "Step Results"),
              new Entry("column.displayId", "내보내기 열: Display ID", "Display ID", "Display ID"),
              new Entry("column.description", "내보내기 열: 설명", "설명", "Description"),
              new Entry("column.postCondition", "내보내기 열: 사후 조건", "사후 조건", "Post-condition"),
              new Entry("column.isAutomated", "내보내기 열: 자동화 여부", "자동화 여부", "Automated"),
              new Entry("column.executionType", "내보내기 열: 실행 타입", "실행 타입", "Execution Type"),
              new Entry("column.testTechnique", "내보내기 열: 테스트 기법", "테스트 기법", "Test Technique"),
              new Entry("column.tags", "내보내기 열: 태그", "태그", "Tags"),
              new Entry(
                  "column.linkedDocuments", "내보내기 열: 연결된 RAG 문서", "연결된 RAG 문서", "Linked Documents"),
              new Entry("column.attachments", "내보내기 열: 첨부파일", "첨부파일", "Attachments"),
              // 결과 값
              new Entry("result.pass", "내보내기 결과: 성공", "성공", "Pass"),
              new Entry("result.fail", "내보내기 결과: 실패", "실패", "Fail"),
              new Entry("result.blocked", "내보내기 결과: 차단됨", "차단됨", "Blocked"),
              new Entry("result.notRun", "내보내기 결과: 미실행", "미실행", "Not Run"),
              // 시트 이름
              new Entry("sheet.report", "내보내기 시트: 결과 리포트", "테스트 결과 리포트", "Test Result Report"),
              new Entry("sheet.stepResults", "내보내기 시트: 스텝 결과", "스텝 결과", "Step Results"),
              new Entry("sheet.statistics", "내보내기 시트: 통계", "통계", "Statistics"),
              // 스텝 결과 시트 머리글 (테스트케이스명·결과는 column.* 을 쓴다)
              new Entry("stepSheet.stepNumber", "스텝 결과 시트: 스텝 번호", "스텝 번호", "Step No."),
              new Entry("stepSheet.step", "스텝 결과 시트: 스텝", "스텝", "Step"),
              new Entry("stepSheet.expectedResult", "스텝 결과 시트: 예상결과", "예상결과", "Expected Result"),
              new Entry("stepSheet.stepResult", "스텝 결과 시트: 스텝 결과", "스텝 결과", "Step Result"),
              new Entry("stepSheet.actualResult", "스텝 결과 시트: 실제 결과", "실제 결과", "Actual Result"),
              // PDF 머리말
              new Entry("pdf.title", "PDF 제목", "테스트 결과 리포트", "Test Result Report"),
              new Entry("pdf.generatedAt", "PDF 생성일시", "생성일시: {date}", "Generated: {date}"),
              new Entry("pdf.totalCount", "PDF 결과 건수", "총 {count}건의 결과", "{count} result(s)"),
              // 셀 값
              new Entry("value.automated", "자동화 여부 값: 자동", "자동화", "Automation"),
              new Entry("value.manual", "자동화 여부 값: 수동", "수동", "Manual"),
              new Entry("value.attachmentCount", "첨부 건수", "첨부 {count}건", "{count} attachment(s)"),
              new Entry("value.imageLabel", "본문 이미지 표기", "이미지", "Image"),
              new Entry("steps.description", "스텝 정보: 설명 머리말", "설명", "Description"),
              new Entry("steps.expectedResult", "스텝 정보: 예상결과 머리말", "예상결과", "Expected Result"),
              new Entry("steps.empty", "스텝 정보: 내용 없음", "(내용 없음)", "(empty)"),
              // 통계 시트
              new Entry("stats.item", "통계 시트: 항목", "항목", "Item"),
              new Entry("stats.count", "통계 시트: 수량", "수량", "Count"),
              new Entry("stats.ratio", "통계 시트: 비율", "비율 (%)", "Ratio (%)"),
              new Entry("stats.total", "통계 시트: 전체", "전체", "Total")));
}
