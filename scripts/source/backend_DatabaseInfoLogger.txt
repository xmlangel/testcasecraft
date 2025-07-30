package com.testcase.testcasemanagement.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

@Slf4j
@Component
public class DatabaseInfoLogger implements CommandLineRunner {

    @Autowired
    private DataSource dataSource;
    
    @Autowired
    private Environment env;

    @Override
    public void run(String... args) throws Exception {
        log.info("=== DATABASE CONNECTION INFO ===");
        log.info("Active Profile: {}", String.join(",", env.getActiveProfiles()));
        log.info("DataSource URL: {}", env.getProperty("spring.datasource.url"));
        log.info("DataSource Username: {}", env.getProperty("spring.datasource.username"));
        log.info("DDL Auto: {}", env.getProperty("spring.jpa.hibernate.ddl-auto"));
        
        try (Connection connection = dataSource.getConnection()) {
            DatabaseMetaData metaData = connection.getMetaData();
            log.info("Database Product: {} {}", metaData.getDatabaseProductName(), metaData.getDatabaseProductVersion());
            log.info("Database URL: {}", metaData.getURL());
            log.info("Database User: {}", metaData.getUserName());
            log.info("Driver: {} {}", metaData.getDriverName(), metaData.getDriverVersion());
            log.info("Connection Valid: {}", connection.isValid(5));
        } catch (Exception e) {
            log.error("Failed to get database info: {}", e.getMessage());
        }
        log.info("=== END DATABASE INFO ===");
    }
}