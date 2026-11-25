package com.testcase.testcasemanagement.dto;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.config.JiraConfig;
import java.time.LocalDateTime;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * ICT-493: 최근 결과 executedAt 이 배열이 아니라 ISO 문자열로 나가는지 확인한다. 앱이 실제로 쓰는 ObjectMapper 빈(JiraConfig)으로
 * 직렬화한다. 이 빈은 application.yml 의 write-dates-as-timestamps 설정을 따르지 않는다.
 */
public class TestCaseLatestResultDtoJsonTest {

  private final ObjectMapper mapper = new JiraConfig().objectMapper();

  @Test
  public void executedAtIsSerializedAsIsoString() throws Exception {
    LocalDateTime at = LocalDateTime.of(2026, 8, 20, 22, 4, 30, 664_226_000);

    JsonNode node = mapper.valueToTree(new TestCaseLatestResultDto("PASS", at));

    Assert.assertTrue(node.get("executedAt").isTextual(), node.toString());
    Assert.assertEquals(node.get("executedAt").asText(), "2026-08-20T22:04:30");
    Assert.assertEquals(node.get("result").asText(), "PASS");
  }

  @Test
  public void nullExecutedAtStaysNull() throws Exception {
    JsonNode node = mapper.valueToTree(new TestCaseLatestResultDto("PASS", null));

    Assert.assertTrue(node.get("executedAt").isNull());
  }
}
