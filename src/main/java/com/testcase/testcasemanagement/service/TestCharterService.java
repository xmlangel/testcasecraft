package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestCharterRequestDto;
import com.testcase.testcasemanagement.dto.TestCharterResponseDto;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;
import com.testcase.testcasemanagement.exception.ResourceNotValidException;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCharter;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestCharterRepository;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TestCharterService {

  @Autowired private TestCharterRepository testCharterRepository;

  @Autowired private ProjectRepository projectRepository;

  @Autowired private SecurityContextUtil securityContextUtil;

  public TestCharterResponseDto createCharter(TestCharterRequestDto request) {
    Project project =
        projectRepository
            .findById(request.getProjectId())
            .orElseThrow(
                () -> new ResourceNotFoundException("Project not found: " + request.getProjectId()));

    TestCharter charter = new TestCharter();
    charter.setProject(project);
    charter.setTitle(request.getTitle());
    charter.setMission(request.getMission());
    charter.setAreas(request.getAreas());
    charter.setTags(request.getTags());
    // ICT-444: 작성자는 요청 본문이 아니라 인증 주체에서 가져온다. 본문 값을 쓰면 남의 이름으로 차터를 남길 수 있다.
    charter.setCreatedBy(securityContextUtil.getCurrentUsername());
    charter.setStatus(parseStatus(request.getStatus(), TestCharter.CharterStatus.ACTIVE));

    return toDto(testCharterRepository.save(charter));
  }

  @Transactional(readOnly = true)
  public List<TestCharterResponseDto> getProjectCharters(String projectId) {
    if (!projectRepository.existsById(projectId)) {
      throw new ResourceNotFoundException("Project not found: " + projectId);
    }

    return testCharterRepository.findByProjectIdOrderByCreatedAtDesc(projectId).stream()
        .map(this::toDto)
        .toList();
  }

  @Transactional(readOnly = true)
  public TestCharterResponseDto getCharter(String id) {
    return toDto(findCharter(id));
  }

  public TestCharterResponseDto updateCharter(String id, TestCharterRequestDto request) {
    TestCharter charter = findCharter(id);

    if (request.getTitle() != null && !request.getTitle().isBlank()) {
      charter.setTitle(request.getTitle());
    }
    if (request.getMission() != null && !request.getMission().isBlank()) {
      charter.setMission(request.getMission());
    }
    if (request.getAreas() != null) {
      charter.setAreas(request.getAreas());
    }
    if (request.getTags() != null) {
      charter.setTags(request.getTags());
    }
    if (request.getStatus() != null) {
      charter.setStatus(parseStatus(request.getStatus(), charter.getStatus()));
    }

    return toDto(testCharterRepository.save(charter));
  }

  @Transactional(readOnly = true)
  public TestCharter findActiveCharter(String id) {
    TestCharter charter = findCharter(id);
    if (charter.getStatus() != TestCharter.CharterStatus.ACTIVE) {
      throw new ResourceNotValidException(
          "An ARCHIVED charter cannot be used to create new sessions.",
          Map.of("charterId", id, "status", charter.getStatus().name()));
    }
    return charter;
  }

  @Transactional(readOnly = true)
  public TestCharter getCharterById(String id) {
    return findCharter(id);
  }

  private TestCharter findCharter(String id) {
    return testCharterRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Charter not found: " + id));
  }

  private TestCharter.CharterStatus parseStatus(
      String value, TestCharter.CharterStatus defaultStatus) {
    if (value == null || value.isBlank()) {
      return defaultStatus;
    }

    try {
      return TestCharter.CharterStatus.valueOf(value.toUpperCase(Locale.ROOT));
    } catch (IllegalArgumentException ex) {
      throw new ResourceNotValidException("Invalid charter status value.", Map.of("status", value));
    }
  }

  private TestCharterResponseDto toDto(TestCharter charter) {
    return new TestCharterResponseDto(
        charter.getId(),
        charter.getProject().getId(),
        charter.getTitle(),
        charter.getMission(),
        charter.getAreas(),
        charter.getTags(),
        charter.getCreatedBy(),
        charter.getStatus().name(),
        charter.getCreatedAt(),
        charter.getUpdatedAt());
  }
}
