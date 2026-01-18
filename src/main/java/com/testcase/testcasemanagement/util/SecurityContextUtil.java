// src/main/java/com/testcase/testcasemanagement/util/SecurityContextUtil.java
package com.testcase.testcasemanagement.util;

import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class SecurityContextUtil {

    @Autowired
    private UserRepository userRepository;

    /**
     * 현재 인증된 사용자의 username을 반환
     */
    public String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getName().equals("anonymousUser")) {
            return authentication.getName();
        }
        return null;
    }

    /**
     * 현재 인증된 사용자의 User 객체를 반환
     */
    public Optional<User> getCurrentUser() {
        String username = getCurrentUsername();
        if (username != null) {
            return userRepository.findByUsername(username);
        }
        return Optional.empty();
    }

    /**
     * 현재 인증된 사용자의 ID를 반환
     */
    public String getCurrentUserId() {
        return getCurrentUser()
                .map(User::getId)
                .orElse("system"); // 인증되지 않은 경우 시스템 사용자로 처리
    }

    /**
     * 현재 인증된 사용자의 이름을 반환
     */
    public String getCurrentUserName() {
        return getCurrentUser()
                .map(User::getName)
                .orElse("System User"); // 인증되지 않은 경우 시스템 사용자로 처리
    }

    /**
     * ICT-349: 정적 메소드 버전 (TestCaseVersionService에서 사용)
     */
    public static String getCurrentUserIdStatic() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getName().equals("anonymousUser")) {
            return authentication.getName(); // username을 userId로 사용
        }
        return "system";
    }

    /**
     * ICT-349: 정적 메소드 버전 (TestCaseVersionService에서 사용)
     */
    public static String getCurrentUserNameStatic() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getName().equals("anonymousUser")) {
            return authentication.getName(); // 일단 username을 반환
        }
        return "System User";
    }

    /**
     * 현재 사용자가 인증되었는지 확인
     */
    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && 
               authentication.isAuthenticated() && 
               !authentication.getName().equals("anonymousUser");
    }

    /**
     * 현재 사용자가 특정 역할을 가지고 있는지 확인
     */
    public boolean hasRole(String role) {
        return getCurrentUser()
                .map(user -> role.equals(user.getRole()))
                .orElse(false);
    }

    /**
     * 현재 사용자가 시스템 관리자인지 확인
     */
    public boolean isSystemAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * 현재 사용자가 매니저인지 확인
     */
    public boolean isManager() {
        return hasRole("MANAGER");
    }

    /**
     * 현재 사용자가 테스터인지 확인
     */
    public boolean isTester() {
        return hasRole("TESTER");
    }

    /**
     * 현재 사용자가 특정 사용자와 같은지 확인
     */
    public boolean isCurrentUser(String userId) {
        String currentUserId = getCurrentUserId();
        return currentUserId != null && currentUserId.equals(userId);
    }

    /**
     * 현재 사용자가 특정 사용자명과 같은지 확인
     */
    public boolean isCurrentUsername(String username) {
        String currentUsername = getCurrentUsername();
        return currentUsername != null && currentUsername.equals(username);
    }
}