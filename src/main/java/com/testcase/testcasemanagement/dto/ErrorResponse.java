// src/main/java/com/testcase/testcasemanagement/dto/ErrorResponse.java

package com.testcase.testcasemanagement.dto;

import java.time.LocalDateTime;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ErrorResponse {
  private String errorCode;
  private String message;
  private LocalDateTime timestamp;
  private Map<String, String> details;
}
