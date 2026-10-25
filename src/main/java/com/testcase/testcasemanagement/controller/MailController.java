// src/main/java/com/testcase/testcasemanagement/controller/MailController.java
package com.testcase.testcasemanagement.controller;

/**
 * 범용 메일 발송 API 를 두던 자리다.
 *
 * <p>ICT-443: POST /api/mail/send 는 테스터 권한만으로 요청 본문의 발신자·수신자·본문을 그대로 써서 회사 SMTP 로 메일을 보냈다. 화면과 다른
 * 클라이언트 어디에서도 호출하지 않아 엔드포인트를 제거했다. 비밀번호 재설정·이메일 인증 메일은 {@code VerificationMailSender} 가 따로 보낸다.
 * 메일 설정 관리는 {@code /api/admin/mail-settings} 가 맡는다.
 *
 * <p>이 클래스는 이제 엔드포인트가 없다. 파일 삭제 후보다.
 */
public class MailController {}
