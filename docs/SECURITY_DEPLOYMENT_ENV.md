# 운영 배포 보안 환경변수

최종 갱신: 2026-08-23 22:20 KST · 기준 버전 1.0.120

dev-review 보안 하드닝(PR #65·#80·#81·#82·#92)으로 도입된 운영 환경변수를 정리한다. 대부분 기본값이 개발용으로 잡혀 있어, **문서 없이 그대로 운영에 올리면 프론트 CORS 파손이나 rate limit 오탐, Jira 암호화 실패 같은 사고가 난다.** 배포 전 아래 표를 확인한다.

## 필수 (운영에서 반드시 주입)

| 환경변수 | 기본값 | 운영 설정 | 미설정 시 |
|---|---|---|---|
| `APP_CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173,http://localhost:8080` | 실제 프론트 도메인(쉼표 구분). 예: `https://tc.example.com` | 운영 도메인에서 온 요청이 CORS 차단 → **프론트가 API를 못 부른다** |
| `JIRA_ENCRYPTION_KEY` | (prod 프로파일은 기본값 없음) | AES-256 Base64 키. 생성: `EncryptionUtil.generateEncryptionKey()` | Jira 토큰 암호화가 **fail-closed(예외)** 로 막혀 Jira 설정을 저장할 수 없다. 커밋된 공개 기본 키는 운영에서 거부된다(PR #92) |

## 프록시·네트워크 (배포 형태에 맞춰 설정)

| 환경변수 | 기본값 | 언제 켜나 | 주의 |
|---|---|---|---|
| `APP_RATELIMIT_TRUST_FORWARDED_HEADERS` | `false` | 리버스 프록시(Nginx/LB) **뒤**에 두고, 프록시가 `X-Forwarded-For` 를 신뢰 가능하게 덮어쓸 때만 `true` | `false` 인데 프록시 뒤에 있으면 모든 요청이 프록시 IP 하나로 합산돼 rate limit 오탐. 반대로 프록시 없이 직접 노출(no-nginx)이면 반드시 `false`. `true` 로 켜면 헤더 위조로 rate limit 우회 |
| `APP_JIRA_ALLOW_PRIVATE_TARGETS` | `false` | 사설 IP 로 운영되는 신뢰된 on-prem Jira 를 연동해야 할 때만 `true` | `true` 는 SSRF 가드(루프백·사설·링크로컬 169.254.169.254 차단)를 해제한다. 클라우드에서는 켜지 말 것 |

## 부트스트랩

| 환경변수 | 기본값 | 설명 |
|---|---|---|
| `TESTCASE_ADMIN_PASSWORD` | (없음) | 최초 admin 계정 비밀번호. 미설정이면 부팅 시 암호학적 난수를 생성해 **로그에 1회만** 출력한다(하드코딩 기본값 없음, PR #65). 신규 빈 DB 배포에만 영향 |

## SSL (선택)

| 환경변수 | 기본값 | 설명 |
|---|---|---|
| `jira.security.https.skip-ssl-verification` | `false` | Jira 아웃바운드 SSL 검증 우회. 운영에서 `true` 로 켜면 동작은 하되 `JiraSecurityConfig` 가 강한 경고 로그를 남긴다(MITM 위험). 자체서명 인증서 배포 호환용, 정식 인증서 권장 |

## Docker/Compose 하드닝 (docker-compose-build)

컨테이너 배포 쪽 보안 설정. 정본은 `docker-compose-build/docker-compose.yml`.

| 항목 | 설정 | 이유 |
|---|---|---|
| 빌드 컨텍스트 | `docker-compose-build/.dockerignore` · `rag-service/.dockerignore` (allow-list) | 배포 디렉터리에 `.env`(DB·JWT·MinIO 시크릿)·`ssl/`(TLS 개인키)·`data/`(라이브 DB 265MB)·`backups/` 가 함께 있어 그대로 빌더로 전송되고 있었다. 이미지에 실제 COPY 되는 파일만 허용한다 |
| 포트 바인딩 | postgres `127.0.0.1:5434` · minio `127.0.0.1:9000/9001` · rag `127.0.0.1:8001` | 도커는 호스트 방화벽(ufw 등)을 우회해 iptables 를 직접 조작한다. 내부 전용 서비스를 `0.0.0.0` 으로 퍼블리시하면 방화벽이 닫혀 있어도 외부에서 닿는다. 원격 접속은 SSH 터널 |
| MinIO 자격증명 | `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` 를 `.env` 에서 주입 (`:?` 로 미설정 시 기동 거부) | access key 가 `minioadmin` 으로 compose 에 하드코딩돼 있었다. 앱·RAG 가 root 자격증명을 그대로 쓰므로, 가능하면 버킷 범위 서비스 계정을 따로 발급할 것 |
| MinIO 이미지 | `minio/minio:RELEASE.2025-09-07T16-13-09Z` (`MINIO_IMAGE_TAG` 로 override) | `:latest` 는 재기동마다 다른 바이너리가 내려와 스캔 결과를 특정 다이제스트에 귀속시킬 수 없다 |
| RAG 런타임 | `--reload` command 오버라이드 제거, `APP_ENV=production`, `LOG_LEVEL=INFO` | 운영 compose 가 개발용 오토리로더로 떠 있었고, DEBUG 로그는 DB 커넥션 문자열(비밀번호 포함)까지 남긴다 |
| RAG 이미지 | 런타임 스테이지에서 `curl` 제거 + `apt-get upgrade`, 헬스체크는 `urllib` | 앱 이미지와 같은 기준(1.0.84+ 에서 curl 제거)을 RAG 에도 적용 |
| 권한 | 전 서비스 `no-new-privileges:true` + `cap_drop: ALL` (postgres 만 엔트리포인트용 5개 재부여) | setuid 바이너리를 통한 컨테이너 내 권한 상승을 차단 |

### 이미지 CVE 대응 (Docker Scout, `testcasecraft:1.0.99` / amd64 `sha256:06170ccd…`)

스캔 31건 중 25건이 fat JAR 안의 Maven 의존성이었다. Dockerfile 이 아니라 `build.gradle` 로 잡는다.

| 대상 | 변경 | 해소되는 CVE |
|---|---|---|
| netty (BOM) | `4.1.135.Final` → `4.1.136.Final` | codec-http 56745·55831·55833·59899·59921·59898·56746, codec-compression 59901, codec-http2 59900, codec-dns GHSA-mfg7-5gfp-c4w3 |
| jackson (`jackson-bom.version`) | `2.21.2` → **`2.21.5`** | databind 54512·54513(PTV 우회 RCE)·54514~54518·59888·59889·GHSA-mhm7-754m-9p8w, core GHSA-r7wm-3cxj-wff9. 2.21.4 로는 54515·59889·GHSA-mhm7-754m-9p8w 가 남아 2.21.5 로 올렸다 |
| postgresql JDBC | `42.7.11` → `42.7.13` | 54291 (channelBinding=require 미강제 → SCRAM 다운그레이드) |
| spring-security (`spring-security.version`) | `6.5.10` → `6.5.11` | 47838 (X.509 CN 파싱 오류로 사용자 사칭) |
| logback (`logback.version`) | `1.5.32` → `1.5.34` | 9828(1.5.33)·10532(1.5.34) 역직렬화 허용목록 우회 |
| Spring Boot | `3.5.14` → `3.5.15` | 위 BOM 버전 정렬 + 기타 패치 |

버전은 명시 override 라서 Boot BOM 이 되돌리지 않는다. 반영 확인:

```
./gradlew dependencyInsight --configuration runtimeClasspath --dependency io.netty:netty-codec-http
```

**alpine 패키지 6건은 업스트림에 fix 가 없다.** `apk upgrade` 로도 안 사라져서, 런타임에 안 쓰는 것만 이미지에서 제거했다.

4건은 뿌리가 하나다. 베이스([adoptium/containers `21/jre/alpine/3.23`](https://github.com/adoptium/containers/blob/main/21/jre/alpine/3.23/Dockerfile))가 `gnupg` 를 넣는 이유는 *"gnupg required to verify the signature"* 이다. JDK 다운로드 서명을 **이미지 빌드 시점에** 확인하기 위해서다. 런타임엔 안 쓴다. sqlite-libs(gnupg TOFU 신뢰DB)와 libgcrypt 도 gnupg 가 딸고 들어온 것이라 `apk del --purge gnupg` 하나로 고아 정리까지 함께 된다.

| 패키지 | CVE | 처리 |
|---|---|---|
| sqlite-libs 3.51.2-r0 | 11824·11822 (H 8.5) | gnupg 제거 시 고아로 함께 정리. 앱은 PostgreSQL 만 쓴다 |
| libgcrypt 1.11.2-r0 | 41989 (M 6.7) | 〃 |
| gnupg 2.4.9-r0 | 2025-30258 (L) | `apk del --purge gnupg` |
| busybox 1.37.0-r30 | 2025-60876 (M 6.5) | **잔존.** alpine 의 셸 본체라 제거 불가 |
| coreutils 9.8-r1 | 2016-2781 (M 4.6) | **잔존.** 베이스가 CA 인증서 동기화의 `csplit` 용으로 넣은 것이라 지우면 인증서 처리가 깨진다. CVE 는 `chroot --userspec` 관련으로 실사용 경로 없음(disputed) |

삭제가 런타임을 깨면 `java -version` 가드에서 빌드가 실패하도록 해놨다. 그래도 재빌드 후 한 번 확인할 것:

```
docker scout cves xmlangel/testcasecraft:<새버전> --only-severity critical,high
```

### 시크릿 로테이션

`scripts/.env.prod` 가 실제 값이 든 채로 커밋돼 있었다(1.0.42 부터). `.env.prod.example` 템플릿으로 교체하고 `.gitignore` 에 등록했지만, **git 히스토리에는 값이 그대로 남아 있다.** 이 저장소를 클론한 적이 있는 환경 기준으로 아래를 로테이션한다.

- [ ] `JWT_SECRET`: 교체 시 전체 세션 무효화(재로그인 필요). `openssl rand -base64 64`
- [ ] `JIRA_ENCRYPTION_KEY`: 저장된 Jira 토큰이 복호화 불가가 되므로 재입력 필요. `openssl rand -base64 32`
- [ ] `POSTGRES_PASSWORD`: `ALTER ROLE testcase_user PASSWORD ...` 후 `.env` 동기화
- [ ] `docker-compose-build/.env` 의 `MINIO_SECRET_KEY`(현재 `minioadmin_dev_password_789`)·`POSTGRES_RAG_PASSWORD`(`rag_dev_password_123`): dev 기본값이 운영 도메인에 붙어 있다

## 배포 전 체크리스트

- [ ] `APP_CORS_ALLOWED_ORIGINS` 에 실제 프론트 도메인을 넣었는가
- [ ] `JIRA_ENCRYPTION_KEY` 를 고유 키로 주입했는가(커밋 기본 키 금지)
- [ ] 프록시 뒤 배포면 `APP_RATELIMIT_TRUST_FORWARDED_HEADERS=true`, 직접 노출이면 `false` 인가
- [ ] on-prem 사설 Jira 가 아니면 `APP_JIRA_ALLOW_PRIVATE_TARGETS=false` 인가
- [ ] `.env` 에 `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` 가 있는가(없으면 compose 가 기동을 거부한다)
- [ ] 실제 값이 든 env 파일이 커밋되지 않았는가. `git ls-files | grep '\.env'` 결과가 `*.example` 과 프런트 빌드 플래그뿐인가
- [ ] `TESTCASE_ADMIN_PASSWORD` 를 정했는가. 미설정이면 무작위 비밀번호가 기동 로그에 1회만 출력된다
- [ ] `TESTCASE_INIT_ENABLED=false` 인가. `true` 는 시딩 전에 기존 데이터를 전부 삭제한다
- [ ] `INTERNAL_BIND_ADDR` 를 `127.0.0.1` 로 두었는가. `0.0.0.0` 은 호스트 방화벽을 우회한다
