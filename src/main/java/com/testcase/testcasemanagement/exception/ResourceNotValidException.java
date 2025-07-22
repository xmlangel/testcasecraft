// src/main/java/com/testcase/testcasemanagement/exception/ResourceNotValidException.java

package com.testcase.testcasemanagement.exception;

import java.util.Map;

public class ResourceNotValidException extends RuntimeException {
    private final Map<String, String> errors;

    public ResourceNotValidException(String message, Map<String, String> errors) {
        super(message);
        this.errors = errors;
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
