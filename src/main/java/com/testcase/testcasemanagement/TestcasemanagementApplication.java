package com.testcase.testcasemanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TestcasemanagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(TestcasemanagementApplication.class, args);
	}

}