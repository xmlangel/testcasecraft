package com.testcase.testcasemanagement.mapper;

import com.testcase.testcasemanagement.dto.TestCaseDto;
import com.testcase.testcasemanagement.dto.TestStepDto;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestStep;

import java.util.*;
import java.util.stream.Collectors;

public class TestCaseMapper {

    public static TestCaseDto toDto(TestCase entity) {
        if (entity == null) return null;

        TestCaseDto dto = new TestCaseDto();
        dto.setId(entity.getId() != null ? entity.getId().toString() : null);
        dto.setName(entity.getName());
        dto.setType(entity.getType());
        dto.setDescription(entity.getDescription());
        dto.setParentId(entity.getParentId()); // null → ""로 자동 변환

        List<TestStep> steps = entity.getSteps();
        if (steps != null && !steps.isEmpty()) {
            dto.setSteps(steps.stream()
                    .filter(Objects::nonNull)
                    .map(TestCaseMapper::toStepDto)
                    .collect(Collectors.toList()));
        }

        dto.setExpectedResults(entity.getExpectedResults());
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        dto.setUpdatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null);
        return dto;
    }

    public static TestStepDto toStepDto(TestStep step) {
        if (step == null) return null;

        TestStepDto dto = new TestStepDto();
        dto.setStepNumber(step.getStepNumber());
        dto.setDescription(step.getDescription());
        dto.setExpectedResult(step.getExpectedResult());
        return dto;
    }

    public static TestCase toEntity(TestCaseDto dto) {
        if (dto == null) return null;

        TestCase entity = new TestCase();
        entity.setName(dto.getName());
        entity.setType(dto.getType());
        entity.setDescription(dto.getDescription());

        // parentId 정규화 (null/빈 문자열 → null 저장)
        String parentId = dto.getParentId();
        entity.setParentId((parentId == null || parentId.trim().isEmpty()) ? null : parentId);

        if (dto.getSteps() != null) {
            entity.setSteps(dto.getSteps().stream()
                    .filter(Objects::nonNull)
                    .map(TestCaseMapper::toStepEntity)
                    .collect(Collectors.toList()));
        }

        entity.setExpectedResults(dto.getExpectedResults());
        return entity;
    }

    public static TestStep toStepEntity(TestStepDto dto) {
        if (dto == null) return null;

        TestStep step = new TestStep();
        step.setStepNumber(dto.getStepNumber());
        step.setDescription(dto.getDescription());
        step.setExpectedResult(dto.getExpectedResult());
        return step;
    }

    // 트리 구조 변환 메서드 추가
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

    // 기타 유틸리티 메서드들 (toDtoList, updateEntityFromDto 등)
    public static List<TestCaseDto> toDtoList(List<TestCase> entities) {
        return entities.stream()
                .map(TestCaseMapper::toDto)
                .collect(Collectors.toList());
    }

    public static void updateEntityFromDto(TestCaseDto dto, TestCase entity) {
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getType() != null) entity.setType(dto.getType());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getParentId() != null) entity.setParentId(dto.getParentId());
        if (dto.getSteps() != null) entity.setSteps(toStepEntityList(dto.getSteps()));
        if (dto.getExpectedResults() != null) entity.setExpectedResults(dto.getExpectedResults());
    }

    private static List<TestStep> toStepEntityList(List<TestStepDto> dtos) {
        return dtos.stream()
                .map(TestCaseMapper::toStepEntity)
                .collect(Collectors.toList());
    }
}
