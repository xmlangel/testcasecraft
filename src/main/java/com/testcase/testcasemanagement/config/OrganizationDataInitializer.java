package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.model.*;
import com.testcase.testcasemanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 조직 관리 시스템 테스트 데이터 초기화
 * 
 * @ConditionalOnProperty - 테스트 환경에서는 실행되지 않도록 설정
 *                        testcase.init.enabled=false 설정 시 비활성화됨
 */
@Component
@Order(2) // DataInitializer(Order=1) 다음에 실행
@ConditionalOnProperty(name = "testcase.init.enabled", havingValue = "true", matchIfMissing = false)
public class OrganizationDataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private OrganizationUserRepository organizationUserRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectUserRepository projectUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // DataInitializer가 먼저 실행되도록 잠시 대기
        Thread.sleep(2000);
        initializeOrganizationData();

        // 다른 모든 초기화가 완료된 후 admin 멤버십 최종 확인
        Thread.sleep(3000);
        ensureAdminMembership();

        // 최종 검증
        System.out.println("=== 최종 admin 멤버십 검증 ===");
        User finalAdminUser = userRepository.findByUsername("admin").orElse(null);
        if (finalAdminUser != null) {
            System.out.println("최종 admin 사용자 ID: " + finalAdminUser.getId());
            List<Organization> allOrgs = (List<Organization>) organizationRepository.findAll();
            allOrgs.forEach(org -> {
                boolean isMember = organizationUserRepository.existsByOrganizationIdAndUserId(org.getId(),
                        finalAdminUser.getId());
                System.out.println(org.getName() + " 멤버십: " + isMember);
            });
        }
    }

    private void initializeOrganizationData() {
        System.out.println("조직 관리 시스템 테스트 데이터 초기화 시작...");

        // 1. 기존 사용자 확인 및 설정 (DataInitializer와 호환성 확보)
        User adminUser = userRepository.findByUsername("admin").orElse(null);
        if (adminUser == null) {
            adminUser = createAdminUser("admin", "admin@company.com", "관리자", "admin123");
        } else {
            // 기존 admin 사용자가 있으면 역할과 비밀번호만 확인/업데이트
            // 기존 admin 사용자가 있으면 역할과 비밀번호만 확인/업데이트
            ensureAdminUserSetup(adminUser);
            // 최신 상태의 adminUser 다시 로드 (버전 불일치 방지)
            adminUser = userRepository.findByUsername("admin").orElse(adminUser);
        }

        User testerUser = userRepository.findByUsername("tester").orElse(null);
        if (testerUser == null) {
            testerUser = createUserIfNotExists("tester", "tester@company.com", "김테스터", "tester");
        }

        // 기존 조직이 있고 조직별 프로젝트도 존재하면 멤버십만 확인하고 종료
        if (organizationRepository.count() > 0 && projectRepository.countByOrganizationIsNotNull() > 0) {
            System.out.println("기존 조직 " + organizationRepository.count() + "개, 조직별 프로젝트 "
                    + projectRepository.countByOrganizationIsNotNull() + "개 존재. 멤버십만 업데이트.");
            ensureAdminMembership();
            return;
        }

        User managerUser = createUserIfNotExists("manager", "manager@company.com", "이매니저", "manager123");
        User developerUser = createUserIfNotExists("developer", "developer@company.com", "박개발", "developer123");

        // 2. 조직 생성 (기존 조직이 있으면 재사용) - QA팀만 생성
        Organization qaOrg = createOrganizationIfNotExists("QA팀", "품질 보증 및 모바일 앱 테스트 전담 조직");

        // 3. 조직-사용자 관계 설정 - QA팀만 설정
        createOrganizationMember(qaOrg, testerUser, OrganizationUser.OrganizationRole.OWNER);
        createOrganizationMember(qaOrg, managerUser, OrganizationUser.OrganizationRole.ADMIN);
        createOrganizationMember(qaOrg, developerUser, OrganizationUser.OrganizationRole.MEMBER);
        createOrganizationMember(qaOrg, adminUser, OrganizationUser.OrganizationRole.ADMIN); // 시스템 관리자

        // 4. 프로젝트 생성 (조직별) - QA팀 모바일 앱 테스트 프로젝트만 생성
        Project qaProject1 = null;

        try {
            qaProject1 = createProject("모바일 앱 테스트 프로젝트", "MOBILE-TEST", "iOS/Android 앱 테스트케이스 관리", qaOrg);
            System.out.println("✅ QA 모바일 앱 테스트 프로젝트 생성 완료: " + qaProject1.getName());
        } catch (Exception e) {
            System.out.println("❌ QA 모바일 앱 테스트 프로젝트 생성 실패: " + e.getMessage());
        }

        // 5. 프로젝트-사용자 관계 설정 - QA팀 모바일 앱 테스트 프로젝트만 배정
        if (qaProject1 != null) {
            createProjectMember(qaProject1, testerUser, ProjectUser.ProjectRole.PROJECT_MANAGER);
            createProjectMember(qaProject1, managerUser, ProjectUser.ProjectRole.TESTER);
            createProjectMember(qaProject1, developerUser, ProjectUser.ProjectRole.CONTRIBUTOR);
            System.out.println("✅ " + qaProject1.getName() + " 멤버 배정 완료 (3명)");
        }

        System.out.println("조직 관리 시스템 테스트 데이터 초기화 완료!");
        System.out.println("생성된 조직: " + organizationRepository.count() + "개 (QA팀)");
        System.out.println("생성된 프로젝트: " + projectRepository.count() + "개 (모바일 앱 테스트)");
        System.out.println("조직 멤버십: " + organizationUserRepository.count() + "개");

        // 초기화 후에도 admin 멤버십 확인
        ensureAdminMembership();
    }

    private void ensureAdminUserSetup(User adminUser) {
        System.out.println("기존 admin 사용자 설정 확인 및 업데이트...");
        System.out.println("현재 admin 사용자 ID: " + adminUser.getId());

        boolean needsUpdate = false;

        // admin 사용자의 역할이 ADMIN이 아니면 업데이트
        if (!"ADMIN".equals(adminUser.getRole())) {
            System.out.println("admin 사용자 역할을 " + adminUser.getRole() + " -> ADMIN으로 업데이트");
            adminUser.setRole("ADMIN");
            needsUpdate = true;
        } else {
            System.out.println("admin 사용자는 이미 ADMIN 역할을 가지고 있습니다.");
        }

        // admin 사용자의 비밀번호 확인 및 재설정 (개발 환경용)
        if (!passwordEncoder.matches("admin123", adminUser.getPassword())) {
            System.out.println("admin 사용자 비밀번호 재설정");
            adminUser.setPassword(passwordEncoder.encode("admin123"));
            needsUpdate = true;
        } else {
            System.out.println("admin 사용자 비밀번호 정상 확인");
        }

        if (needsUpdate) {
            try {
                adminUser.setUpdatedAt(LocalDateTime.now());
                userRepository.save(adminUser);
                System.out.println("admin 사용자 정보 업데이트 완료");
            } catch (Exception e) {
                System.out.println("⚠️ admin 사용자 정보 업데이트 실패: " + e.getMessage());
            }
        }

        // 기존 admin 멤버십 모두 제거하고 다시 생성
        System.out.println("기존 admin 멤버십 정리...");
        List<OrganizationUser> existingMemberships = organizationUserRepository.findByUserId(adminUser.getId());
        System.out.println("기존 멤버십 수: " + existingMemberships.size());
        if (!existingMemberships.isEmpty()) {
            organizationUserRepository.deleteAll(existingMemberships);
            System.out.println("기존 admin 멤버십 " + existingMemberships.size() + "개 제거 완료");
        }
    }

    private void ensureAdminMembership() {
        System.out.println("admin 사용자 조직 멤버십 확인...");

        User adminUser = userRepository.findByUsername("admin").orElse(null);
        if (adminUser != null) {
            System.out.println("admin 사용자 발견: ID = " + adminUser.getId());

            List<Organization> allOrgs = (List<Organization>) organizationRepository.findAll();
            System.out.println("총 조직 수: " + allOrgs.size());

            for (Organization org : allOrgs) {
                System.out.println("조직 처리: " + org.getName() + " (ID: " + org.getId() + ")");

                boolean isMember = organizationUserRepository.existsByOrganizationIdAndUserId(org.getId(),
                        adminUser.getId());
                System.out.println("  멤버십 존재 여부: " + isMember);

                if (!isMember) {
                    System.out.println("  admin을 " + org.getName() + " 조직에 ADMIN으로 추가");
                    try {
                        createOrganizationMember(org, adminUser, OrganizationUser.OrganizationRole.ADMIN);
                        System.out.println("  ✅ admin 멤버십 추가 성공");

                        // 추가 후 다시 확인
                        boolean recheck = organizationUserRepository.existsByOrganizationIdAndUserId(org.getId(),
                                adminUser.getId());
                        System.out.println("  재확인 결과: " + recheck);
                    } catch (Exception e) {
                        System.out.println("  ❌ admin 멤버십 추가 실패: " + e.getMessage());
                        e.printStackTrace();
                    }
                } else {
                    System.out.println("  admin은 이미 " + org.getName() + " 조직의 멤버입니다.");
                }
            }

            // 최종 멤버십 상태 확인
            System.out.println("=== 최종 admin 멤버십 상태 ===");
            long totalMemberships = organizationUserRepository.countByUserId(adminUser.getId());
            System.out.println("admin의 총 멤버십 수: " + totalMemberships);

            List<OrganizationUser> adminMemberships = organizationUserRepository.findByUserId(adminUser.getId());
            for (OrganizationUser membership : adminMemberships) {
                System.out.println("  - 조직: " + membership.getOrganization().getName() +
                        ", 역할: " + membership.getRoleInOrganization());
            }
        } else {
            System.out.println("❌ admin 사용자를 찾을 수 없습니다!");
        }
    }

    private User createUserIfNotExists(String username, String email, String name, String password) {
        return userRepository.findByUsername(username)
                .orElseGet(() -> {
                    User user = new User();
                    // user.setId(UUID.randomUUID().toString()); // @GeneratedValue 사용
                    user.setUsername(username);
                    user.setEmail(email);
                    user.setName(name);
                    user.setPassword(passwordEncoder.encode(password));
                    user.setRole("USER");
                    user.setCreatedAt(LocalDateTime.now());
                    user.setUpdatedAt(LocalDateTime.now());
                    try {
                        return userRepository.save(user);
                    } catch (org.springframework.dao.DataIntegrityViolationException e) {
                        System.out.println("⚠️ 사용자 생성 건너뜀 (이미 존재): " + username);
                        return userRepository.findByUsername(username).orElseThrow();
                    }
                });
    }

    private User createAdminUser(String username, String email, String name, String password) {
        return userRepository.findByUsername(username)
                .orElseGet(() -> {
                    User user = new User();
                    // user.setId(UUID.randomUUID().toString());
                    user.setUsername(username);
                    user.setEmail(email);
                    user.setName(name);
                    user.setPassword(passwordEncoder.encode(password));
                    user.setRole("ADMIN"); // 시스템 관리자 역할
                    user.setCreatedAt(LocalDateTime.now());
                    user.setUpdatedAt(LocalDateTime.now());
                    System.out.println("시스템 관리자 계정 생성: " + username + " (role: ADMIN)");
                    System.out.println("시스템 관리자 계정 생성: " + username + " (role: ADMIN)");
                    try {
                        return userRepository.save(user);
                    } catch (org.springframework.dao.DataIntegrityViolationException e) {
                        System.out.println("⚠️ 시스템 관리자 계정 생성 건너뜀 (이미 존재): " + username);
                        return userRepository.findByUsername(username).orElseThrow();
                    }
                });
    }

    private Organization createOrganization(String name, String description) {
        Organization org = new Organization();
        // org.setId(UUID.randomUUID().toString()); // @GeneratedValue 사용
        org.setName(name);
        org.setDescription(description);
        org.setCreatedAt(LocalDateTime.now());
        org.setUpdatedAt(LocalDateTime.now());
        return organizationRepository.save(org);
    }

    private Organization createOrganizationIfNotExists(String name, String description) {
        return organizationRepository.findByName(name)
                .orElseGet(() -> {
                    System.out.println("새 조직 생성: " + name);
                    return createOrganization(name, description);
                });
    }

    private void createOrganizationMember(Organization org, User user, OrganizationUser.OrganizationRole role) {
        // 중복 체크: 이미 존재하는 멤버십이면 생성하지 않음
        boolean exists = organizationUserRepository.existsByOrganizationIdAndUserId(org.getId(), user.getId());
        if (exists) {
            System.out.println("이미 존재하는 멤버십: " + org.getName() + " - " + user.getUsername());
            return;
        }

        OrganizationUser orgUser = new OrganizationUser();
        // orgUser.setId(UUID.randomUUID().toString()); // @GeneratedValue 사용
        orgUser.setOrganization(org);
        orgUser.setUser(user);
        orgUser.setRoleInOrganization(role);
        orgUser.setCreatedAt(LocalDateTime.now());
        orgUser.setUpdatedAt(LocalDateTime.now());
        organizationUserRepository.save(orgUser);
        System.out.println("새 멤버십 생성: " + org.getName() + " - " + user.getUsername() + " (역할: " + role + ")");
    }

    private Project createProject(String name, String code, String description, Organization organization) {
        Project project = new Project();
        // project.setId(UUID.randomUUID().toString()); // @GeneratedValue 사용
        project.setName(name);
        project.setCode(code);
        project.setDescription(description);
        project.setOrganization(organization);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        project.setDisplayOrder(1);
        return projectRepository.save(project);
    }

    private void createProjectMember(Project project, User user, ProjectUser.ProjectRole role) {
        ProjectUser projectUser = new ProjectUser();
        // projectUser.setId(UUID.randomUUID().toString()); // @GeneratedValue 사용
        projectUser.setProject(project);
        projectUser.setUser(user);
        projectUser.setRoleInProject(role);
        projectUser.setCreatedAt(LocalDateTime.now());
        projectUser.setUpdatedAt(LocalDateTime.now());
        projectUserRepository.save(projectUser);
    }
}