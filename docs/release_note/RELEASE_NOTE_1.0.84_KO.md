# Release Note - v1.0.84

## [1.0.84] - 2026-06-06

안녕하세요! 1.0.84는 보안 중심 업데이트입니다. 도커 이미지에서 발견된 CRITICAL 4건·HIGH 17건의 보안 취약점을 전량 해소하고, JWT 시크릿 설정 오류를 배포 시점에 바로 잡아주는 검증·자동 생성 기능을 추가하였습니다.

### 주요 변경 사항

#### 🛡️ 보안 취약점 해소 (CRITICAL 4 · HIGH 17 → 0)

도커 이미지 보안 스캔(Docker Scout) 기준 CRITICAL/HIGH 취약점을 모두 해소하였습니다.

* **프레임워크 업그레이드**
  - Spring Boot 3.4.12 → **3.5.14** — spring-boot(CVE-2026-40973), spring-security(CVE-2026-22732, CRITICAL 9.1) 취약점이 각각 3.4/6.4 라인 전체에 영향을 주어 3.5/6.5 라인으로 상향하였습니다.
  - 내장 Tomcat 10.1.55 — CRITICAL 3건(CVE-2026-43512/41293/43515) 포함 6건 해소.
* **라이브러리 업그레이드**
  - Netty 4.1.135 (HTTP 요청 스머글링 등 HIGH 5건), PostgreSQL JDBC 42.7.11, BouncyCastle 1.84, Jackson 2.21.x, nimbus-jose-jwt 10.9.1.
* **도커 이미지 강화**
  - 베이스 이미지를 JDK에서 **JRE(eclipse-temurin:21-jre-alpine)** 로 전환 — 불필요한 도구(binutils 등)가 제거되고 이미지 크기도 510MB → **371MB**로 줄었습니다.
  - 컨테이너에 curl을 더 이상 포함하지 않습니다(미수정 HIGH 2건 회피). 헬스체크는 기본 내장 wget으로 동작합니다.

> 잔여 MEDIUM 4건·LOW 1건은 alpine 베이스 패키지로, 배포판 수정이 출시되는 대로 베이스 이미지 갱신 시 자동 해소됩니다.

#### 🔐 JWT_SECRET 시작 검증 + 자동 생성 (신규)

* **시작 시점 검증**: `JWT_SECRET`이 잘못된 경우(비 Base64 문자, 길이 부족) 기존에는 첫 로그인에서야 모호한 에러로 실패했으나, 이제 **앱 시작 시점에 한/영 병기 메시지로 원인과 생성 방법을 안내하며 즉시 실패**합니다.
* **미설정 시 자동 생성**: `JWT_SECRET`을 설정하지 않으면 컨테이너가 512비트 키를 자동 생성하여 `/app/data/jwt-secret`(권한 0600)에 저장하고 재시작 시 재사용합니다.
  - compose의 `./data/app:/app/data` 볼륨을 유지하면 컨테이너를 재생성해도 로그인 세션이 끊기지 않습니다.
  - 명시적으로 설정한 값이 잘못된 경우에는 자동 대체하지 않고 기동을 거부합니다(설정 오류 은폐 방지).
  - 다중 인스턴스 환경에서는 자동 생성 대신 모든 인스턴스에 동일한 `JWT_SECRET`을 명시 설정하세요.

### 업그레이드 안내

* 별도 마이그레이션 없이 이미지 교체만으로 적용됩니다.
* **docker-compose.yml 사용 시**: 앱 서비스의 헬스체크가 curl에서 wget으로 변경되었습니다. 저장소의 compose 파일을 그대로 사용하면 자동 반영되며, 커스텀 compose를 쓰는 경우 헬스체크 명령을 wget으로 교체하세요.
  ```yaml
  test: ["CMD-SHELL", "wget -q --no-check-certificate -O /dev/null ${PROTOCOL}://localhost:${SERVER_PORT}/actuator/health || exit 1"]
  ```
* JWT_SECRET 자동 생성을 사용하려면 `./data/app:/app/data` 볼륨 마운트를 추가하세요. 기존처럼 명시 설정해도 동일하게 동작합니다.
* 1.0.83의 변경 사항(중첩 폴더 케이스 목록, 매뉴얼 뷰어 수정)은 [RELEASE_NOTE_1.0.83_KO.md](RELEASE_NOTE_1.0.83_KO.md)를 참고하세요.
