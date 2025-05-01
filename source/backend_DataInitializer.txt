// src/main/java/com/testcase/testcasemanagement/config/DataInitializer.java

package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestStep;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DataInitializer {

    @Value("${testcase.init.enabled:false}")
    private boolean initEnabled;

    @Bean
    public CommandLineRunner initSampleTestCases(TestCaseRepository testCaseRepository) {
        return args -> {
            if (!initEnabled) {
                return;
            }
            // 1. 기존 데이터 전체 삭제 (초기화)
            testCaseRepository.deleteAll();

            // 2. 폴더 생성 및 저장 (id 자동 할당)
            TestCase folder1 = createFolder("로그인 테스트");
            TestCase folder2 = createFolder("사용자 관리");
            TestCase folder3 = createFolder("권한 관리");
            TestCase folder4 = createFolder("로그아웃");
            testCaseRepository.saveAll(List.of(folder1, folder2, folder3, folder4));

            // 3. 테스트케이스 생성 (각 폴더의 id를 parentId로 사용)
            testCaseRepository.saveAll(List.of(
                    // 로그인 테스트
                    createTestCase("유효한 자격 증명으로 로그인", folder1, "유효한 아이디/비밀번호로 로그인 시 정상적으로 대시보드 진입",
                            List.of(
                                    step(1, "로그인 페이지 접속", "로그인 폼이 정상적으로 표시된다."),
                                    step(2, "유효한 아이디와 비밀번호 입력", "입력 필드에 값이 정상적으로 입력된다."),
                                    step(3, "로그인 버튼 클릭", "대시보드 페이지로 이동한다."),
                                    step(4, "사용자 이름이 화면에 표시되는지 확인", "로그인한 사용자 이름이 우측 상단에 표시된다.")
                            ),
                            "1. 로그인 폼 표시\n2. 입력 정상\n3. 대시보드 이동\n4. 사용자명 노출"
                    ),
                    createTestCase("유효하지 않은 자격 증명으로 로그인", folder1, "잘못된 아이디/비밀번호로 로그인 시 오류 메시지 확인",
                            List.of(
                                    step(1, "로그인 페이지 접속", "로그인 폼이 정상적으로 표시된다."),
                                    step(2, "유효하지 않은 아이디와/또는 비밀번호 입력", "입력 필드에 값이 정상적으로 입력된다."),
                                    step(3, "로그인 버튼 클릭", "오류 메시지(로그인 실패)가 표시된다."),
                                    step(4, "로그인 상태 확인", "로그인되지 않고, 로그인 페이지에 머문다.")
                            ),
                            "1. 로그인 폼 표시\n2. 입력 정상\n3. 오류 메시지 표시\n4. 로그인 불가"
                    ),
                    createTestCase("비밀번호 찾기 기능", folder1, "비밀번호 찾기 시 이메일 전송 확인",
                            List.of(
                                    step(1, "로그인 페이지에서 '비밀번호 찾기' 클릭", "비밀번호 찾기 폼이 표시된다."),
                                    step(2, "이메일 주소 입력", "입력한 이메일이 폼에 반영된다."),
                                    step(3, "비밀번호 재설정 요청", "비밀번호 재설정 안내 메일이 발송된다."),
                                    step(4, "이메일 수신 확인", "비밀번호 재설정 링크가 포함된 메일을 수신한다.")
                            ),
                            "1. 폼 표시\n2. 이메일 입력\n3. 메일 발송\n4. 메일 수신"
                    ),
                    // 사용자 관리
                    createTestCase("사용자 생성", folder2, "관리자가 신규 사용자 등록 시 정상 등록 여부 확인",
                            List.of(
                                    step(1, "사용자 관리 페이지 접속", "사용자 목록이 표시된다."),
                                    step(2, "“사용자 추가” 버튼 클릭", "사용자 등록 폼이 표시된다."),
                                    step(3, "필수 정보 입력(이름, 이메일 등)", "입력한 정보가 폼에 반영된다."),
                                    step(4, "“저장” 버튼 클릭", "새 사용자가 목록에 추가된다.")
                            ),
                            "1. 목록 표시\n2. 등록 폼 표시\n3. 정보 입력\n4. 목록 추가"
                    ),
                    createTestCase("사용자 삭제", folder2, "관리자가 사용자 삭제 시 정상 삭제 여부 확인",
                            List.of(
                                    step(1, "사용자 관리 페이지 접속", "사용자 목록이 표시된다."),
                                    step(2, "삭제할 사용자 선택", "선택한 사용자가 강조 표시된다."),
                                    step(3, "“삭제” 버튼 클릭", "삭제 확인 다이얼로그가 표시된다."),
                                    step(4, "삭제 확인", "선택한 사용자가 목록에서 사라진다.")
                            ),
                            "1. 목록 표시\n2. 사용자 선택\n3. 삭제 다이얼로그\n4. 목록에서 삭제"
                    ),
                    createTestCase("사용자 정보 수정", folder2, "사용자 정보(이름, 이메일 등) 수정 시 정상 반영 여부 확인",
                            List.of(
                                    step(1, "사용자 관리 페이지 접속", "사용자 목록이 표시된다."),
                                    step(2, "수정할 사용자 선택", "선택한 사용자가 강조 표시된다."),
                                    step(3, "“수정” 버튼 클릭", "수정 폼이 표시된다."),
                                    step(4, "정보 수정 후 저장", "수정된 정보가 목록에 반영된다.")
                            ),
                            "1. 목록 표시\n2. 사용자 선택\n3. 수정 폼 표시\n4. 정보 반영"
                    ),
                    // 권한 관리
                    createTestCase("권한 부여", folder3, "특정 사용자에게 관리자 권한 부여",
                            List.of(
                                    step(1, "권한 관리 페이지 접속", "사용자 및 권한 목록이 표시된다."),
                                    step(2, "사용자 선택", "선택한 사용자가 강조 표시된다."),
                                    step(3, "“권한 부여” 클릭", "권한 선택 다이얼로그가 표시된다."),
                                    step(4, "관리자 권한 선택 후 저장", "선택한 사용자에게 관리자 권한이 부여된다.")
                            ),
                            "1. 목록 표시\n2. 사용자 선택\n3. 권한 다이얼로그\n4. 권한 부여"
                    ),
                    createTestCase("권한 회수", folder3, "관리자 권한 회수 시 정상적으로 권한이 제거되는지 확인",
                            List.of(
                                    step(1, "권한 관리 페이지 접속", "사용자 및 권한 목록이 표시된다."),
                                    step(2, "관리자 권한이 있는 사용자 선택", "선택한 사용자가 강조 표시된다."),
                                    step(3, "“권한 회수” 클릭", "권한 회수 확인 다이얼로그가 표시된다."),
                                    step(4, "확인 클릭", "해당 사용자의 관리자 권한이 제거된다.")
                            ),
                            "1. 목록 표시\n2. 사용자 선택\n3. 권한 회수 다이얼로그\n4. 권한 제거"
                    ),
                    // 로그아웃
                    createTestCase("로그아웃 정상 동작", folder4, "로그아웃 버튼 클릭 시 세션 종료 및 로그인 페이지 이동",
                            List.of(
                                    step(1, "로그인 상태에서 로그아웃 버튼 클릭", "로그아웃 확인 다이얼로그가 표시된다."),
                                    step(2, "확인 클릭", "세션이 종료된다."),
                                    step(3, "로그인 페이지로 이동 확인", "로그인 페이지가 표시된다."),
                                    step(4, "재접속 시도", "로그인 전 상태로 유지된다.")
                            ),
                            "1. 다이얼로그 표시\n2. 세션 종료\n3. 로그인 페이지 이동\n4. 비로그인 유지"
                    ),
                    createTestCase("자동 로그아웃", folder4, "세션 만료 시 자동 로그아웃 및 로그인 페이지 이동 확인",
                            List.of(
                                    step(1, "로그인 후 일정 시간 대기", "세션 만료 시간이 경과한다."),
                                    step(2, "화면 새로고침", "자동으로 로그인 페이지로 이동한다."),
                                    step(3, "이전 페이지 접근 시도", "접근이 차단되고 로그인 페이지로 이동한다."),
                                    step(4, "로그인 재시도", "정상적으로 로그인할 수 있다.")
                            ),
                            "1. 세션 만료\n2. 로그인 페이지 이동\n3. 접근 차단\n4. 재로그인 가능"
                    )
            ));
        };
    }

    private TestCase createFolder(String name) {
        TestCase folder = new TestCase();
        folder.setName(name);
        folder.setType("folder");
        folder.setCreatedAt(LocalDateTime.now());
        folder.setUpdatedAt(LocalDateTime.now());
        return folder;
    }

    private TestCase createTestCase(String name, TestCase parent, String description, List<TestStep> steps, String expectedResults) {
        TestCase testCase = new TestCase();
        testCase.setName(name);
        testCase.setType("testcase");
        testCase.setParentId(parent.getId() != null ? parent.getId().toString() : null);
        testCase.setDescription(description);
        testCase.setSteps(steps);
        testCase.setExpectedResults(expectedResults);
        testCase.setCreatedAt(LocalDateTime.now());
        testCase.setUpdatedAt(LocalDateTime.now());
        return testCase;
    }

    private TestStep step(int number, String desc, String expected) {
        TestStep step = new TestStep();
        step.setStepNumber(number);
        step.setDescription(desc);
        step.setExpectedResult(expected);
        return step;
    }
}
