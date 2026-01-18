package com.testcase.testcasemanagement.mapper;

import com.testcase.testcasemanagement.dto.TestCaseDto;
import com.testcase.testcasemanagement.dto.TestStepDto;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestStep;
import org.hibernate.Hibernate;

import java.util.*;
import java.util.stream.Collectors;

public class TestCaseMapper {

    public static TestCaseDto toDto(TestCase entity) {
        if (entity == null)
            return null;

        TestCaseDto dto = new TestCaseDto();

        dto.setId(entity.getId() != null ? entity.getId().toString() : null);
        dto.setSequentialId(entity.getSequentialId()); // ICT-339: 순차 ID 매핑
        dto.setDisplayId(entity.getDisplayId()); // ICT-341: Display ID 매핑
        dto.setParentId(entity.getParentId()); // 항상 parentId 포함
        dto.setName(entity.getName());
        dto.setType(entity.getType());
        dto.setDescription(entity.getDescription());
        dto.setPreCondition(entity.getPreCondition());
        dto.setPostCondition(entity.getPostCondition());
        dto.setIsAutomated(entity.getIsAutomated());
        dto.setExecutionType(entity.getExecutionType());
        dto.setTestTechnique(entity.getTestTechnique());
        // 프로젝트 ID 매핑 추가
        if (entity.getProject() != null) {
            dto.setProjectId(entity.getProject().getId());
        }

        if (Hibernate.isInitialized(entity.getSteps()) && entity.getSteps() != null) {
            dto.setSteps(
                    entity.getSteps().stream()
                            .filter(Objects::nonNull)
                            .map(TestCaseMapper::toStepDto)
                            .collect(Collectors.toList()));
        }

        dto.setExpectedResults(entity.getExpectedResults());
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        dto.setUpdatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null);

        // 작성자/수정자 정보 매핑
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setUpdatedBy(entity.getUpdatedBy());

        // displayOrder 필드 매핑 추가
        dto.setDisplayOrder(entity.getDisplayOrder());

        dto.setPriority(entity.getPriority());

        // 태그 목록 매핑
        if (entity.getTags() != null) {
            dto.setTags(new ArrayList<>(entity.getTags()));
        }

        // 연결된 RAG 문서 ID 목록 매핑
        if (entity.getLinkedDocumentIds() != null) {
            dto.setLinkedDocumentIds(new ArrayList<>(entity.getLinkedDocumentIds()));
        }

        dto.setVersion(entity.getVersion());

        return dto;
    }

    public static TestStepDto toStepDto(TestStep step) {
        if (step == null)
            return null;

        TestStepDto dto = new TestStepDto();
        dto.setStepNumber(step.getStepNumber());
        dto.setDescription(step.getDescription());
        dto.setExpectedResult(step.getExpectedResult());
        return dto;
    }

    public static TestCase toEntity(TestCaseDto dto) {
        if (dto == null)
            return null;

        TestCase entity = new TestCase();
        entity.setSequentialId(dto.getSequentialId()); // ICT-339: 순차 ID 매핑
        entity.setDisplayId(dto.getDisplayId()); // ICT-341: Display ID 매핑
        entity.setName(dto.getName());
        entity.setType(dto.getType());
        entity.setDescription(dto.getDescription());
        entity.setPreCondition(dto.getPreCondition());
        entity.setPostCondition(dto.getPostCondition());
        entity.setIsAutomated(dto.getIsAutomated());
        entity.setExecutionType(dto.getExecutionType());
        entity.setTestTechnique(dto.getTestTechnique());

        // parentId 정규화 (null/빈 문자열 → null 저장)
        String parentId = dto.getParentId();
        entity.setParentId(
                (dto.getParentId() == null || dto.getParentId().trim().isEmpty()) ? null : dto.getParentId().trim());

        if (dto.getSteps() != null) {
            entity.setSteps(dto.getSteps().stream()
                    .filter(Objects::nonNull)
                    .map(TestCaseMapper::toStepEntity)
                    .collect(Collectors.toList()));
        }

        entity.setExpectedResults(dto.getExpectedResults());

        // displayOrder 필드 매핑 추가
        entity.setDisplayOrder(dto.getDisplayOrder());

        entity.setPriority(dto.getPriority());

        // 태그 목록 매핑
        if (dto.getTags() != null) {
            entity.setTags(new ArrayList<>(dto.getTags()));
        }

        // 연결된 RAG 문서 ID 목록 매핑
        if (dto.getLinkedDocumentIds() != null) {
            entity.setLinkedDocumentIds(new ArrayList<>(dto.getLinkedDocumentIds()));
        }

        // 프로젝트 ID는 서비스 레이어에서 처리 (여기서는 매핑하지 않음)
        return entity;
    }

    public static TestStep toStepEntity(TestStepDto dto) {
        if (dto == null)
            return null;

        TestStep step = new TestStep();
        step.setStepNumber(dto.getStepNumber());
        step.setDescription(dto.getDescription());
        step.setExpectedResult(dto.getExpectedResult());
        return step;
    }

    public static List<TestCaseDto> toTreeDtoList(List<TestCase> entities) {
        List<TestCaseDto> dtos = entities.stream()
                .map(TestCaseMapper::toDto)
                .collect(Collectors.toList());

        Map<String, TestCaseDto> dtoMap = new HashMap<>();
        dtos.forEach(dto -> dtoMap.put(dto.getId(), dto));

        List<TestCaseDto> tree = new ArrayList<>();
        dtos.forEach(dto -> {
            String parentId = dto.getParentId();
            if (parentId == null || parentId.isEmpty()) {
                tree.add(dto);
            } else {
                TestCaseDto parent = dtoMap.get(parentId);
                if (parent != null) {
                    parent.getChildren().add(dto);
                }
            }
        });

        return tree;
    }

    // 기타 유틸리티 메서드들
    public static List<TestCaseDto> toDtoList(List<TestCase> entities) {
        return entities.stream()
                .map(TestCaseMapper::toDto)
                .collect(Collectors.toList());
    }

    public static void updateEntityFromDto(TestCaseDto dto, TestCase entity) {
        // ICT-339: 순차 ID는 기존 테스트케이스 수정 시에는 변경하지 않음
        // ICT-341: Display ID는 기존 테스트케이스 수정 시에는 변경하지 않음 (생성 시에만 할당)
        if (dto.getName() != null)
            entity.setName(dto.getName());
        if (dto.getType() != null)
            entity.setType(dto.getType());
        if (dto.getDescription() != null)
            entity.setDescription(dto.getDescription());
        if (dto.getPreCondition() != null)
            entity.setPreCondition(dto.getPreCondition());
        if (dto.getPostCondition() != null)
            entity.setPostCondition(dto.getPostCondition());
        if (dto.getIsAutomated() != null)
            entity.setIsAutomated(dto.getIsAutomated());
        if (dto.getExecutionType() != null)
            entity.setExecutionType(dto.getExecutionType());
        if (dto.getTestTechnique() != null)
            entity.setTestTechnique(dto.getTestTechnique());

        // parentId 업데이트 (null 포함) - 빈 문자열도 null로 변환
        // 프론트엔드에서 상위폴더 삭제 시 parentId=null로 전송하므로 항상 업데이트 필요
        String parentId = dto.getParentId();
        if (parentId != null && !parentId.trim().isEmpty()) {
            entity.setParentId(parentId.trim());
        } else {
            entity.setParentId(null); // null 또는 빈 문자열이면 null로 설정
        }

        if (dto.getSteps() != null)
            entity.setSteps(toStepEntityList(dto.getSteps()));
        if (dto.getExpectedResults() != null)
            entity.setExpectedResults(dto.getExpectedResults());

        // displayOrder 필드 업데이트 추가
        if (dto.getDisplayOrder() != null)
            entity.setDisplayOrder(dto.getDisplayOrder());

        if (dto.getPriority() != null)
            entity.setPriority(dto.getPriority());

        // 태그 목록 업데이트
        if (dto.getTags() != null) {
            entity.setTags(new ArrayList<>(dto.getTags()));
        }

        // 연결된 RAG 문서 ID 목록 업데이트
        if (dto.getLinkedDocumentIds() != null) {
            entity.setLinkedDocumentIds(new ArrayList<>(dto.getLinkedDocumentIds()));
        }
    }

    private static List<TestStep> toStepEntityList(List<TestStepDto> dtos) {
        return dtos.stream()
                .map(TestCaseMapper::toStepEntity)
                .collect(Collectors.toList());
    }
}
