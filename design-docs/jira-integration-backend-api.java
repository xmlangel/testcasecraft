/**
 * JIRA 통합 시스템 백엔드 API 설계
 * 개인별 JIRA API 키 관리 및 테스트 결과 연동 기능
 */

// ==================== CONTROLLERS ====================

// 1. JiraConfigController - JIRA 설정 관리
@RestController
@RequestMapping("/api/jira-config")
@PreAuthorize("hasRole('USER')")
@CrossOrigin(origins = "*")
public class JiraConfigController {

    private final JiraConfigService jiraConfigService;

    @GetMapping("/my-config")
    public ResponseEntity<UserJiraConfigDto> getMyJiraConfig(Authentication auth) {
        String userId = getUserId(auth);
        UserJiraConfigDto config = jiraConfigService.getUserJiraConfig(userId);
        return ResponseEntity.ok(config);
    }

    @PostMapping("/my-config")
    public ResponseEntity<UserJiraConfigDto> saveJiraConfig(
            @RequestBody @Valid UserJiraConfigDto configDto,
            Authentication auth) {
        String userId = getUserId(auth);
        configDto.setUserId(userId);
        UserJiraConfigDto saved = jiraConfigService.saveUserJiraConfig(configDto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/my-config/{configId}")
    public ResponseEntity<UserJiraConfigDto> updateJiraConfig(
            @PathVariable String configId,
            @RequestBody @Valid UserJiraConfigDto configDto,
            Authentication auth) {
        String userId = getUserId(auth);
        configDto.setUserId(userId);
        UserJiraConfigDto updated = jiraConfigService.updateUserJiraConfig(configId, configDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/my-config/{configId}")
    public ResponseEntity<Void> deleteJiraConfig(
            @PathVariable String configId,
            Authentication auth) {
        String userId = getUserId(auth);
        jiraConfigService.deleteUserJiraConfig(configId, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/test-connection")
    public ResponseEntity<JiraConnectionTestResult> testConnection(
            @RequestBody @Valid UserJiraConfigDto configDto,
            Authentication auth) {
        String userId = getUserId(auth);
        JiraConnectionTestResult result = jiraConfigService.testConnection(configDto, userId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/refresh-connection")
    public ResponseEntity<JiraConnectionTestResult> refreshConnection(Authentication auth) {
        String userId = getUserId(auth);
        JiraConnectionTestResult result = jiraConfigService.refreshUserConnection(userId);
        return ResponseEntity.ok(result);
    }

    private String getUserId(Authentication auth) {
        return auth.getName(); // JWT에서 추출
    }
}

// 2. JiraIntegrationController - JIRA 연동 기능
@RestController
@RequestMapping("/api/jira-integration")
@PreAuthorize("hasRole('USER')")
@CrossOrigin(origins = "*")
public class JiraIntegrationController {

    private final JiraIntegrationService jiraIntegrationService;

    @PostMapping("/comment")
    public ResponseEntity<Map<String, Object>> addCommentToIssue(
            @RequestBody @Valid JiraCommentRequest request,
            Authentication auth) {
        String userId = getUserId(auth);
        String commentId = jiraIntegrationService.addCommentToIssue(request, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("commentId", commentId);
        response.put("message", "JIRA 이슈에 코멘트가 성공적으로 추가되었습니다.");
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/issue/{issueKey}")
    public ResponseEntity<JiraIssueInfo> getIssueInfo(
            @PathVariable String issueKey,
            Authentication auth) {
        String userId = getUserId(auth);
        JiraIssueInfo issueInfo = jiraIntegrationService.getIssueInfo(issueKey, userId);
        return ResponseEntity.ok(issueInfo);
    }

    @PostMapping("/link-test-result")
    public ResponseEntity<Map<String, Object>> linkTestResultToIssue(
            @RequestParam String testResultId,
            @RequestParam String issueKey,
            Authentication auth) {
        String userId = getUserId(auth);
        jiraIntegrationService.linkTestResultToIssue(testResultId, issueKey, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "테스트 결과가 JIRA 이슈와 연동되었습니다.");
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auto-comment-on-failure")
    public ResponseEntity<Map<String, Object>> autoCommentOnFailure(
            @RequestParam String testResultId,
            Authentication auth) {
        String userId = getUserId(auth);
        String commentId = jiraIntegrationService.autoCommentOnTestFailure(testResultId, userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("commentId", commentId);
        response.put("message", "테스트 실패 정보가 JIRA 이슈에 자동으로 등록되었습니다.");
        
        return ResponseEntity.ok(response);
    }

    private String getUserId(Authentication auth) {
        return auth.getName();
    }
}

// ==================== SERVICES ====================

// 3. JiraConfigService - JIRA 설정 관리 서비스
@Service
@Transactional
public class JiraConfigService {

    private final UserJiraConfigRepository jiraConfigRepository;
    private final UserRepository userRepository;
    private final JiraApiClient jiraApiClient;
    private final EncryptionService encryptionService;

    @Autowired
    public JiraConfigService(
            UserJiraConfigRepository jiraConfigRepository,
            UserRepository userRepository,
            JiraApiClient jiraApiClient,
            EncryptionService encryptionService) {
        this.jiraConfigRepository = jiraConfigRepository;
        this.userRepository = userRepository;
        this.jiraApiClient = jiraApiClient;
        this.encryptionService = encryptionService;
    }

    public UserJiraConfigDto getUserJiraConfig(String userId) {
        Optional<UserJiraConfig> config = jiraConfigRepository.findByUserId(userId);
        if (config.isPresent()) {
            return convertToDto(config.get());
        }
        return new UserJiraConfigDto(); // 빈 설정 반환
    }

    public UserJiraConfigDto saveUserJiraConfig(UserJiraConfigDto configDto) {
        User user = userRepository.findById(configDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 기존 설정이 있으면 업데이트, 없으면 새로 생성
        Optional<UserJiraConfig> existingConfig = jiraConfigRepository.findByUserId(configDto.getUserId());
        
        UserJiraConfig config;
        if (existingConfig.isPresent()) {
            config = existingConfig.get();
        } else {
            config = new UserJiraConfig();
            config.setUser(user);
        }

        // 설정 정보 업데이트
        config.setJiraServerUrl(configDto.getJiraServerUrl());
        config.setJiraUsername(configDto.getJiraUsername());
        config.setEncryptedApiKey(encryptionService.encrypt(configDto.getApiKey()));
        config.setJiraProjectKey(configDto.getJiraProjectKey());
        config.setIsEnabled(configDto.getIsEnabled());

        // 연결 테스트
        JiraConnectionTestResult testResult = testJiraConnection(configDto);
        config.setConnectionStatus(testResult.getStatus());
        config.setLastVerifiedAt(testResult.getTestedAt());

        UserJiraConfig saved = jiraConfigRepository.save(config);
        return convertToDto(saved);
    }

    public JiraConnectionTestResult testConnection(UserJiraConfigDto configDto, String userId) {
        return testJiraConnection(configDto);
    }

    private JiraConnectionTestResult testJiraConnection(UserJiraConfigDto configDto) {
        try {
            JiraApiClient.JiraCredentials credentials = new JiraApiClient.JiraCredentials(
                    configDto.getJiraServerUrl(),
                    configDto.getJiraUsername(),
                    configDto.getApiKey()
            );

            boolean connected = jiraApiClient.testConnection(credentials);
            if (connected) {
                String serverVersion = jiraApiClient.getServerVersion(credentials);
                List<String> projects = jiraApiClient.getAvailableProjects(credentials);
                
                return new JiraConnectionTestResult(
                        true, 
                        "JIRA 서버에 성공적으로 연결되었습니다.",
                        JiraConnectionStatus.CONNECTED,
                        serverVersion,
                        projects,
                        LocalDateTime.now()
                );
            } else {
                return new JiraConnectionTestResult(
                        false,
                        "JIRA 서버 연결에 실패했습니다. 설정을 확인해주세요.",
                        JiraConnectionStatus.DISCONNECTED,
                        null,
                        null,
                        LocalDateTime.now()
                );
            }
        } catch (Exception e) {
            return new JiraConnectionTestResult(
                    false,
                    "JIRA 연결 오류: " + e.getMessage(),
                    JiraConnectionStatus.ERROR,
                    null,
                    null,
                    LocalDateTime.now()
            );
        }
    }

    private UserJiraConfigDto convertToDto(UserJiraConfig config) {
        UserJiraConfigDto dto = new UserJiraConfigDto();
        dto.setId(config.getId());
        dto.setUserId(config.getUser().getId());
        dto.setJiraServerUrl(config.getJiraServerUrl());
        dto.setJiraUsername(config.getJiraUsername());
        // API 키는 보안상 DTO에 포함하지 않음
        dto.setJiraProjectKey(config.getJiraProjectKey());
        dto.setIsEnabled(config.getIsEnabled());
        dto.setConnectionStatus(config.getConnectionStatus());
        dto.setLastVerifiedAt(config.getLastVerifiedAt());
        dto.setCreatedAt(config.getCreatedAt());
        dto.setUpdatedAt(config.getUpdatedAt());
        return dto;
    }
}

// 4. JiraIntegrationService - JIRA 연동 서비스
@Service
@Transactional
public class JiraIntegrationService {

    private final UserJiraConfigRepository jiraConfigRepository;
    private final TestResultRepository testResultRepository;
    private final TestCaseRepository testCaseRepository;
    private final JiraApiClient jiraApiClient;
    private final EncryptionService encryptionService;

    public String addCommentToIssue(JiraCommentRequest request, String userId) {
        UserJiraConfig jiraConfig = getUserJiraConfig(userId);
        
        String apiKey = encryptionService.decrypt(jiraConfig.getEncryptedApiKey());
        JiraApiClient.JiraCredentials credentials = new JiraApiClient.JiraCredentials(
                jiraConfig.getJiraServerUrl(),
                jiraConfig.getJiraUsername(),
                apiKey
        );

        // JIRA에 코멘트 추가
        String commentId = jiraApiClient.addComment(
                credentials,
                request.getIssueKey(),
                buildTestFailureComment(request)
        );

        // 테스트 결과 업데이트 (연동 정보 저장)
        if (request.getTestResultId() != null) {
            updateTestResultWithJiraInfo(request.getTestResultId(), request.getIssueKey(), commentId);
        }

        return commentId;
    }

    public String autoCommentOnTestFailure(String testResultId, String userId) {
        TestResult testResult = testResultRepository.findById(testResultId)
                .orElseThrow(() -> new IllegalArgumentException("테스트 결과를 찾을 수 없습니다."));

        if (!"FAIL".equals(testResult.getResult())) {
            throw new IllegalArgumentException("실패한 테스트에만 자동 코멘트를 추가할 수 있습니다.");
        }

        // JIRA 설정 확인
        UserJiraConfig jiraConfig = getUserJiraConfig(userId);
        
        // 연관된 이슈가 있는지 확인
        if (testResult.getJiraIssueKey() == null) {
            throw new IllegalArgumentException("연동된 JIRA 이슈가 없습니다. 먼저 이슈를 연결해주세요.");
        }

        // 자동 코멘트 생성 및 추가
        JiraCommentRequest request = buildAutoCommentRequest(testResult);
        return addCommentToIssue(request, userId);
    }

    private String buildTestFailureComment(JiraCommentRequest request) {
        StringBuilder comment = new StringBuilder();
        comment.append("🔴 테스트 실패 보고\n\n");
        comment.append("**테스트케이스**: ").append(request.getTestCaseName()).append("\n");
        comment.append("**실행 시간**: ").append(request.getExecutedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))).append("\n");
        
        if (request.getEnvironment() != null) {
            comment.append("**환경**: ").append(request.getEnvironment()).append("\n");
        }
        
        comment.append("**실패 사유**:\n");
        comment.append("```\n");
        comment.append(request.getFailureReason()).append("\n");
        comment.append("```\n\n");
        
        comment.append("**추가 코멘트**:\n");
        comment.append(request.getComment());
        
        return comment.toString();
    }

    private UserJiraConfig getUserJiraConfig(String userId) {
        return jiraConfigRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("JIRA 설정이 없습니다. 먼저 JIRA 설정을 완료해주세요."));
    }

    private void updateTestResultWithJiraInfo(String testResultId, String issueKey, String commentId) {
        TestResult testResult = testResultRepository.findById(testResultId)
                .orElseThrow(() -> new IllegalArgumentException("테스트 결과를 찾을 수 없습니다."));

        testResult.setJiraIssueKey(issueKey);
        testResult.setJiraCommentId(commentId);
        testResult.setJiraSyncedAt(LocalDateTime.now());
        testResult.setJiraSyncStatus(JiraSyncStatus.SYNCED);

        testResultRepository.save(testResult);
    }
}

// ==================== REPOSITORIES ====================

// 5. UserJiraConfigRepository
@Repository
public interface UserJiraConfigRepository extends JpaRepository<UserJiraConfig, String> {
    
    Optional<UserJiraConfig> findByUserId(String userId);
    
    List<UserJiraConfig> findByIsEnabledTrueAndConnectionStatus(JiraConnectionStatus status);
    
    @Query("SELECT c FROM UserJiraConfig c WHERE c.isEnabled = true AND c.lastVerifiedAt < :threshold")
    List<UserJiraConfig> findConfigsNeedingVerification(@Param("threshold") LocalDateTime threshold);
    
    void deleteByUserId(String userId);
}

// ==================== UTILITY SERVICES ====================

// 6. EncryptionService - API 키 암호화/복호화
@Service
public class EncryptionService {
    
    private final String secretKey;
    private final String algorithm = "AES/GCM/NoPadding";

    @Value("${app.encryption.secret-key}")
    public EncryptionService(String secretKey) {
        this.secretKey = secretKey;
    }

    public String encrypt(String plainText) {
        try {
            Cipher cipher = Cipher.getInstance(algorithm);
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(), "AES");
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            
            byte[] encryptedData = cipher.doFinal(plainText.getBytes());
            return Base64.getEncoder().encodeToString(encryptedData);
        } catch (Exception e) {
            throw new RuntimeException("암호화 중 오류가 발생했습니다.", e);
        }
    }

    public String decrypt(String encryptedText) {
        try {
            Cipher cipher = Cipher.getInstance(algorithm);
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(), "AES");
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            
            byte[] decodedData = Base64.getDecoder().decode(encryptedText);
            byte[] decryptedData = cipher.doFinal(decodedData);
            return new String(decryptedData);
        } catch (Exception e) {
            throw new RuntimeException("복호화 중 오류가 발생했습니다.", e);
        }
    }
}

// 7. JiraApiClient - JIRA API 클라이언트
@Component
public class JiraApiClient {
    
    private final RestTemplate restTemplate;

    @Data
    @AllArgsConstructor
    public static class JiraCredentials {
        private String serverUrl;
        private String username;
        private String apiKey;
    }

    public boolean testConnection(JiraCredentials credentials) {
        try {
            HttpHeaders headers = createAuthHeaders(credentials);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            String url = credentials.getServerUrl() + "/rest/api/3/myself";
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            return false;
        }
    }

    public String addComment(JiraCredentials credentials, String issueKey, String comment) {
        try {
            HttpHeaders headers = createAuthHeaders(credentials);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> commentBody = Map.of("body", comment);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(commentBody, headers);

            String url = credentials.getServerUrl() + "/rest/api/3/issue/" + issueKey + "/comment";
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.CREATED) {
                return (String) response.getBody().get("id");
            } else {
                throw new RuntimeException("JIRA 코멘트 추가 실패");
            }
        } catch (Exception e) {
            throw new RuntimeException("JIRA API 호출 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    private HttpHeaders createAuthHeaders(JiraCredentials credentials) {
        HttpHeaders headers = new HttpHeaders();
        String auth = credentials.getUsername() + ":" + credentials.getApiKey();
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        headers.set("Authorization", "Basic " + encodedAuth);
        return headers;
    }
}