// src/test/java/com/testcase/testcasemanagement/mapper/TestCaseMapperLinkTest.java
package com.testcase.testcasemanagement.mapper;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertNull;

import com.testcase.testcasemanagement.dto.TestCaseDto;
import com.testcase.testcasemanagement.model.TestCase;
import java.util.ArrayList;
import java.util.List;
import org.testng.annotations.Test;

/**
 * 링크 필드(linkedTestCaseIds / linkedJunitTestCaseIds)의 매퍼 null-가드 회귀 테스트 (dev-code-review P0-2).
 *
 * <p>계약: DTO 링크 필드가 <b>null 이면 미변경(기존 유지)</b>, <b>빈 리스트면 명시적 clear</b>. 이 구분이 없으면 필드를 생략한
 * PUT(MCP/bulk/sheet-import 등)이 기존 링크를 조용히 전삭제한다. 순수 static 매퍼라 DB 없이 검증한다.
 */
public class TestCaseMapperLinkTest {

  @Test
  public void toEntity_nullLinks_leavesEntityLinksUnset() {
    TestCaseDto dto = new TestCaseDto();
    dto.setName("tc");
    // 기본값이 null 이어야 한다 (생략된 필드 = 미변경)
    assertNull(dto.getLinkedTestCaseIds(), "DTO linkedTestCaseIds 기본값은 null 이어야 함");
    assertNull(dto.getLinkedJunitTestCaseIds(), "DTO linkedJunitTestCaseIds 기본값은 null 이어야 함");

    TestCase entity = TestCaseMapper.toEntity(dto);
    assertNull(entity.getLinkedTestCaseIds(), "null DTO 링크는 엔티티에 설정되지 않아야 함");
    assertNull(entity.getLinkedJunitTestCaseIds(), "null DTO junit 링크는 엔티티에 설정되지 않아야 함");
  }

  @Test
  public void toEntity_withLinks_setsThem() {
    TestCaseDto dto = new TestCaseDto();
    dto.setName("tc");
    dto.setLinkedTestCaseIds(new ArrayList<>(List.of("a", "b")));
    dto.setLinkedJunitTestCaseIds(new ArrayList<>(List.of("j1")));

    TestCase entity = TestCaseMapper.toEntity(dto);
    assertEquals(entity.getLinkedTestCaseIds(), List.of("a", "b"));
    assertEquals(entity.getLinkedJunitTestCaseIds(), List.of("j1"));
  }

  @Test
  public void updateEntityFromDto_nullLinks_preservesExisting() {
    TestCase entity = new TestCase();
    entity.setName("tc");
    entity.setLinkedTestCaseIds(new ArrayList<>(List.of("x")));
    entity.setLinkedJunitTestCaseIds(new ArrayList<>(List.of("jx")));

    TestCaseDto dto = new TestCaseDto();
    dto.setName("tc");
    // 링크 필드 미지정(null) → 기존 유지되어야 함
    TestCaseMapper.updateEntityFromDto(dto, entity);

    assertEquals(entity.getLinkedTestCaseIds(), List.of("x"), "null 링크는 기존 값을 유지해야 함");
    assertEquals(entity.getLinkedJunitTestCaseIds(), List.of("jx"), "null junit 링크는 기존 값을 유지해야 함");
  }

  @Test
  public void updateEntityFromDto_emptyList_clears() {
    TestCase entity = new TestCase();
    entity.setName("tc");
    entity.setLinkedTestCaseIds(new ArrayList<>(List.of("x")));
    entity.setLinkedJunitTestCaseIds(new ArrayList<>(List.of("jx")));

    TestCaseDto dto = new TestCaseDto();
    dto.setName("tc");
    dto.setLinkedTestCaseIds(new ArrayList<>()); // 명시적 clear
    dto.setLinkedJunitTestCaseIds(new ArrayList<>());
    TestCaseMapper.updateEntityFromDto(dto, entity);

    assertEquals(entity.getLinkedTestCaseIds().size(), 0, "빈 리스트는 명시적 clear 여야 함");
    assertEquals(entity.getLinkedJunitTestCaseIds().size(), 0, "빈 리스트는 명시적 clear 여야 함");
  }

  @Test
  public void updateEntityFromDto_newList_replaces() {
    TestCase entity = new TestCase();
    entity.setName("tc");
    entity.setLinkedTestCaseIds(new ArrayList<>(List.of("x")));

    TestCaseDto dto = new TestCaseDto();
    dto.setName("tc");
    dto.setLinkedTestCaseIds(new ArrayList<>(List.of("y", "z")));
    TestCaseMapper.updateEntityFromDto(dto, entity);

    assertEquals(entity.getLinkedTestCaseIds(), List.of("y", "z"));
  }
}
