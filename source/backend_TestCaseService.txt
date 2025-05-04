package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestCaseDto;
import com.testcase.testcasemanagement.exception.ResourceNotValidException;
import com.testcase.testcasemanagement.mapper.TestCaseMapper;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TestCaseService {
    private final TestCaseRepository testCaseRepository;

    // 1. ProjectRepository 주입 추가
    @Autowired
    private ProjectRepository projectRepository;

    public TestCaseService(TestCaseRepository testCaseRepository) {
        this.testCaseRepository = testCaseRepository;
    }

    public List<TestCase> getAllTestCases() {
        return testCaseRepository.findAll();
    }

    public List<TestCase> getTestCasesByParentId(String parentId) {
        return testCaseRepository.findByParentId(parentId);
    }

    public TestCase saveTestCase(TestCaseDto testCaseDto) {
        Map<String, String> errors = new HashMap<>();
        TestCase entity = TestCaseMapper.toEntity(testCaseDto);

        if (testCaseDto.getName() == null || testCaseDto.getName().trim().isEmpty()) {
            errors.put("name", "테스트케이스 이름은 필수 항목입니다");
        }

        if (!errors.isEmpty()) {
            throw new ResourceNotValidException("테스트케이스 유효성 검사 실패", errors);
        }

        if (testCaseDto.getProjectId() == null || testCaseDto.getProjectId().isEmpty()) {
            errors.put("projectId", "projectId는 필수 입력값입니다.");
            throw new IllegalArgumentException("projectId는 필수 입력값입니다.");
        }

        Project project = projectRepository.findById(testCaseDto.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 projectId: " + testCaseDto.getProjectId()));

        entity.setProject(project);

        // 3. 생성/수정 시간 자동 설정
        if (entity.getId() == null) {
            entity.setCreatedAt(LocalDateTime.now());
        }
        entity.setUpdatedAt(LocalDateTime.now());

        return testCaseRepository.save(entity);
    }


    public TestCase findById(String id) {
        return testCaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("테스트케이스를 찾을 수 없습니다: " + id));
    }

    @Transactional // 트랜잭션 추가
    public void deleteTestCase(String id) {
        // 4. 재귀 삭제 전 자식 확인
        List<TestCase> children = testCaseRepository.findByParentId(id);
        if (!children.isEmpty()) {
            children.forEach(child -> deleteTestCase(child.getId()));
        }
        testCaseRepository.deleteById(id);
    }
}
