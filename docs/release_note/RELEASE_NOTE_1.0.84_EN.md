# Release Note - v1.0.84

## [1.0.84] - 2026-06-06

Hello! 1.0.84 is a security-focused update. It resolves all 4 CRITICAL and 17 HIGH vulnerabilities found in the Docker image, and adds JWT secret validation and auto-generation that catches configuration mistakes right at deployment time.

### Key Changes

#### 🛡️ Security Vulnerabilities Resolved (4 CRITICAL · 17 HIGH → 0)

All CRITICAL/HIGH vulnerabilities reported by Docker image scanning (Docker Scout) have been resolved.

* **Framework upgrades**
  - Spring Boot 3.4.12 → **3.5.14** — the spring-boot (CVE-2026-40973) and spring-security (CVE-2026-22732, CRITICAL 9.1) vulnerabilities affected the entire 3.4/6.4 lines, so we moved up to the 3.5/6.5 lines.
  - Embedded Tomcat 10.1.55 — resolves 6 CVEs including 3 CRITICAL (CVE-2026-43512/41293/43515).
* **Library upgrades**
  - Netty 4.1.135 (5 HIGH incl. HTTP request smuggling), PostgreSQL JDBC 42.7.11, BouncyCastle 1.84, Jackson 2.21.x, nimbus-jose-jwt 10.9.1.
* **Docker image hardening**
  - Switched the base image from JDK to **JRE (eclipse-temurin:21-jre-alpine)** — unnecessary tooling (binutils, etc.) is gone and the image shrank from 510MB to **371MB**.
  - The container no longer ships curl (avoiding 2 unfixed HIGH CVEs). Health checks now use the built-in wget.

> The remaining 4 MEDIUM / 1 LOW findings are alpine base packages; they will clear automatically with base image updates once distro fixes are released.

#### 🔐 JWT_SECRET Startup Validation + Auto-Generation (New)

* **Startup validation**: a malformed `JWT_SECRET` (non-Base64 characters, insufficient length) used to fail only at first login with a cryptic error. The app now **fails fast at startup with a bilingual (KO/EN) message** explaining the cause and how to generate a proper key.
* **Auto-generation when unset**: if `JWT_SECRET` is not set, the container generates a 512-bit key, stores it at `/app/data/jwt-secret` (mode 0600), and reuses it across restarts.
  - Keep the `./data/app:/app/data` volume in compose and login sessions survive container re-creation.
  - An explicitly set but invalid value is never silently replaced — the app refuses to start (no hidden misconfiguration).
  - For multi-instance deployments, set the same `JWT_SECRET` explicitly on every instance instead of relying on auto-generation.

### Upgrade Notes

* No migration required — just replace the image.
* **If you use docker-compose.yml**: the app service health check switched from curl to wget. The repository compose file already reflects this; if you maintain a custom compose file, update the health check command:
  ```yaml
  test: ["CMD-SHELL", "wget -q --no-check-certificate -O /dev/null ${PROTOCOL}://localhost:${SERVER_PORT}/actuator/health || exit 1"]
  ```
* To use JWT_SECRET auto-generation, add the `./data/app:/app/data` volume mount. Setting it explicitly works the same as before.
* For the 1.0.83 changes (nested folder case list, manual viewer fix), see [RELEASE_NOTE_1.0.83_EN.md](RELEASE_NOTE_1.0.83_EN.md).
