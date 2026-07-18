# 운영 배포 보안 환경변수

dev-review 보안 하드닝(PR #65·#80·#81·#82·#92)으로 도입된 운영 환경변수를 정리한다. 대부분 기본값이 개발용으로 잡혀 있어, **문서 없이 그대로 운영에 올리면 프론트 CORS 파손이나 rate limit 오탐, Jira 암호화 실패 같은 사고가 난다.** 배포 전 아래 표를 확인한다.

## 필수 (운영에서 반드시 주입)

| 환경변수 | 기본값 | 운영 설정 | 미설정 시 |
|---|---|---|---|
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173,http://localhost:8080` | 실제 프론트 도메인(쉼표 구분). 예: `https://tc.example.com` | 운영 도메인에서 온 요청이 CORS 차단 → **프론트가 API를 못 부른다** |
| `JIRA_ENCRYPTION_KEY` | (prod 프로파일은 기본값 없음) | AES-256 Base64 키. 생성: `EncryptionUtil.generateEncryptionKey()` | Jira 토큰 암호화가 **fail-closed(예외)** — Jira 설정 저장 불가. 커밋된 공개 기본 키는 운영에서 거부된다(PR #92) |

## 프록시·네트워크 (배포 형태에 맞춰 설정)

| 환경변수 | 기본값 | 언제 켜나 | 주의 |
|---|---|---|---|
| `APP_RATELIMIT_TRUST_FORWARDED_HEADERS` | `false` | 리버스 프록시(Nginx/LB) **뒤**에 두고, 프록시가 `X-Forwarded-For` 를 신뢰 가능하게 덮어쓸 때만 `true` | `false` 인데 프록시 뒤에 있으면 모든 요청이 프록시 IP 하나로 합산돼 rate limit 오탐. 반대로 프록시 없이 직접 노출(no-nginx)이면 반드시 `false` — `true` 로 켜면 헤더 위조로 rate limit 우회 |
| `APP_JIRA_ALLOW_PRIVATE_TARGETS` | `false` | 사설 IP 로 운영되는 신뢰된 on-prem Jira 를 연동해야 할 때만 `true` | `true` 는 SSRF 가드(루프백·사설·링크로컬 169.254.169.254 차단)를 해제한다. 클라우드에서는 켜지 말 것 |

## 부트스트랩

| 환경변수 | 기본값 | 설명 |
|---|---|---|
| `TESTCASE_ADMIN_PASSWORD` | (없음) | 최초 admin 계정 비밀번호. 미설정이면 부팅 시 암호학적 난수를 생성해 **로그에 1회만** 출력한다(하드코딩 기본값 없음, PR #65). 신규 빈 DB 배포에만 영향 |

## SSL (선택)

| 환경변수 | 기본값 | 설명 |
|---|---|---|
| `jira.security.https.skip-ssl-verification` | `false` | Jira 아웃바운드 SSL 검증 우회. 운영에서 `true` 로 켜면 동작은 하되 `JiraSecurityConfig` 가 강한 경고 로그를 남긴다(MITM 위험). 자체서명 인증서 배포 호환용, 정식 인증서 권장 |

## 배포 전 체크리스트

- [ ] `APP_CORS_ALLOWED_ORIGINS` 에 실제 프론트 도메인을 넣었는가
- [ ] `JIRA_ENCRYPTION_KEY` 를 고유 키로 주입했는가(커밋 기본 키 금지)
- [ ] 프록시 뒤 배포면 `APP_RATELIMIT_TRUST_FORWARDED_HEADERS=true`, 직접 노출이면 `false` 인가
- [ ] on-prem 사설 Jira 가 아니면 `APP_JIRA_ALLOW_PRIVATE_TARGETS=false` 인가
