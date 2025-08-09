/**
 * JIRA 통합 시스템을 위한 엔티티 클래스 설계
 * 설계 문서: JIRA 개인별 API 키 관리 및 테스트 결과 연동
 */

// 1. UserJiraConfig 엔티티 - 사용자별 JIRA 설정 관리
@Entity
@Table(name = "user_jira_configs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class UserJiraConfig {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "jira_server_url", nullable = false, length = 500)
    private String jiraServerUrl;

    @Column(name = "jira_username", nullable = false)
    private String jiraUsername;

    // AES-256 암호화된 API 키
    @Column(name = "encrypted_api_key", nullable = false, columnDefinition = "TEXT")
    private String encryptedApiKey;

    @Column(name = "jira_project_key", length = 50)
    private String jiraProjectKey;

    @Column(name = "is_enabled")
    private Boolean isEnabled = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "connection_status", length = 20)
    private JiraConnectionStatus connectionStatus = JiraConnectionStatus.UNKNOWN;

    @Column(name = "last_verified_at")
    private LocalDateTime lastVerifiedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

// 2. JiraConnectionStatus 열거형
public enum JiraConnectionStatus {
    CONNECTED("연결됨"),
    DISCONNECTED("연결 안됨"),
    ERROR("오류"),
    UNKNOWN("알 수 없음");

    private final String description;

    JiraConnectionStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

// 3. TestResult 엔티티 확장 (기존 클래스에 필드 추가)
// 기존 TestResult 클래스에 다음 필드들 추가:

@Column(name = "jira_issue_key", length = 50)
private String jiraIssueKey;

@Column(name = "jira_issue_url", length = 500)
private String jiraIssueUrl;

@Column(name = "jira_comment_id", length = 50)
private String jiraCommentId;

@Column(name = "jira_synced_at")
private LocalDateTime jiraSyncedAt;

// JIRA 연동 상태
@Enumerated(EnumType.STRING)
@Column(name = "jira_sync_status", length = 20)
private JiraSyncStatus jiraSyncStatus = JiraSyncStatus.NOT_SYNCED;

// 4. JiraSyncStatus 열거형
public enum JiraSyncStatus {
    NOT_SYNCED("미연동"),
    SYNCING("연동 중"),
    SYNCED("연동 완료"),
    SYNC_ERROR("연동 오류");

    private final String description;

    JiraSyncStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}

// 5. JiraIssueInfo DTO - JIRA 이슈 정보 전달용
@Data
@AllArgsConstructor
@NoArgsConstructor
public class JiraIssueInfo {
    private String issueKey;
    private String issueUrl;
    private String summary;
    private String status;
    private String assignee;
    private String priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// 6. JiraCommentRequest DTO - JIRA 코멘트 요청용
@Data
@AllArgsConstructor
@NoArgsConstructor
@Valid
public class JiraCommentRequest {
    @NotBlank(message = "이슈 키는 필수입니다")
    private String issueKey;

    @NotBlank(message = "코멘트 내용은 필수입니다")
    @Size(min = 10, max = 5000, message = "코멘트는 10-5000자 사이여야 합니다")
    private String comment;

    private String testResultId;
    private String testCaseId;
    private String testCaseName;
    private String failureReason;
    private String environment;
    private LocalDateTime executedAt;
}

// 7. UserJiraConfigDto - API 통신용 DTO
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserJiraConfigDto {
    private String id;
    private String userId;
    
    @NotBlank(message = "JIRA 서버 URL은 필수입니다")
    @URL(message = "올바른 URL 형식이 아닙니다")
    private String jiraServerUrl;

    @NotBlank(message = "JIRA 사용자명은 필수입니다")
    private String jiraUsername;

    // 보안: API 키는 응답에서 제외, 요청에서만 사용
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @NotBlank(message = "JIRA API 키는 필수입니다")
    private String apiKey;

    private String jiraProjectKey;
    private Boolean isEnabled;
    private JiraConnectionStatus connectionStatus;
    private LocalDateTime lastVerifiedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// 8. JiraConnectionTestResult DTO - 연결 테스트 결과
@Data
@AllArgsConstructor
@NoArgsConstructor
public class JiraConnectionTestResult {
    private boolean success;
    private String message;
    private JiraConnectionStatus status;
    private String serverVersion;
    private List<String> availableProjects;
    private LocalDateTime testedAt;
}