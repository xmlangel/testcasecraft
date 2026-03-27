package com.testcase.testcasemanagement.api;

import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.UserRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.annotations.Test;

@SpringBootTest
@ActiveProfiles("test")
public class DiagnosticTest extends AbstractTestNGSpringContextTests {

  @Autowired private UserRepository userRepository;

  @Autowired private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

  @Test
  public void listUsers() {
    List<User> users = userRepository.findAll();
    System.out.println("=== DIAGNOSTIC: USERS IN TEST DATABASE ===");
    if (users.isEmpty()) {
      System.out.println("NO USERS FOUND!");
    } else {
      for (User user : users) {
        System.out.println(
            "Username: "
                + user.getUsername()
                + ", Role: "
                + user.getRole()
                + ", Active: "
                + user.getIsActive());
        System.out.println("Stored Hash: " + user.getPassword());
        System.out.println(
            "Matches 'admin123': " + passwordEncoder.matches("admin123", user.getPassword()));
        System.out.println(
            "Matches 'admin': " + passwordEncoder.matches("admin", user.getPassword()));
        System.out.println(
            "Matches 'password': " + passwordEncoder.matches("password", user.getPassword()));
        System.out.println(
            "Matches 'tester123': " + passwordEncoder.matches("tester123", user.getPassword()));
      }
    }
    System.out.println("=== DIAGNOSTIC: NEW HASHES ===");
    System.out.println("'admin123' -> " + passwordEncoder.encode("admin123"));
    System.out.println("'admin' -> " + passwordEncoder.encode("admin"));
    System.out.println("==========================================");
  }
}
