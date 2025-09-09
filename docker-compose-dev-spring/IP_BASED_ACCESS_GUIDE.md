# Docker Compose IP 기반 접속 및 배포 가이드

이 문서는 `docker-compose`로 구동되는 애플리케이션을 `localhost`가 아닌 IP 주소 기반으로 접속할 수 있도록 설정하는 방법을 안내합니다.

현재 `localhost`로만 접속되는 문제는 주로 다음 세 가지 원인 때문에 발생합니다.

1.  **Spring Boot 백엔드 서버가 `localhost`에만 바인딩되어 있는 경우:** 외부 IP의 연결을 허용하지 않습니다.
2.  **Docker Compose의 포트 설정이 `localhost`로 제한된 경우:** 호스트 머신의 외부 IP로 포트가 노출되지 않습니다.
3.  **React 프론트엔드가 API를 `localhost`로만 요청하는 경우:** 다른 기기에서 접속하면 API 서버를 찾을 수 없습니다.

---

## 해결 방안

### 1단계: Spring Boot 서버가 모든 IP에서 접속을 허용하도록 설정

Spring Boot 애플리케이션이 외부 IP 주소의 요청을 받을 수 있도록 `server.address`를 `0.0.0.0`으로 설정해야 합니다. 이 설정은 애플리케이션이 사용 가능한 모든 네트워크 인터페이스에 바인딩되도록 합니다.

-   **수정할 파일:** `src/main/resources/application-dev-postgresql.yml` (또는 사용하려는 프로파일에 맞는 설정 파일)
-   **추가할 내용:** 파일의 `server` 섹션에 `address: 0.0.0.0`를 추가합니다.

```yaml
server:
  port: 8080
  address: 0.0.0.0 # 이 부분을 추가합니다.
```

---

### 2단계: Docker Compose 포트 포워딩 설정 변경

`docker-compose.yml` 파일에서 서비스의 포트를 호스트 머신의 특정 IP(예: `127.0.0.1`)에만 바인딩하면 외부에서 접속할 수 없습니다. 모든 IP에서 접속 가능하도록 바인딩을 제거해야 합니다.

-   **수정할 파일:** `docker-compose-dev-spring/docker-compose.yml`
-   **수정할 내용:** `ports` 설정에서 `127.0.0.1:` 부분을 제거하여 호스트의 모든 IP에 포트를 노출합니다.

**예시 (변경 전):**
```yaml
services:
  testcraft-app:
    # ...
    ports:
      - "127.0.0.1:8080:8080" # localhost로만 제한됨
```

**예시 (변경 후):**
```yaml
services:
  testcraft-app:
    # ...
    ports:
      - "8080:8080" # 모든 IP에 노출됨
```
프론트엔드 서비스가 별도로 있다면 해당 서비스의 포트 설정도 동일하게 변경해야 합니다.

---

### 3단계: React 프론트엔드에서 API 요청 주소 변경

프론트엔드 애플리케이션이 백엔드 API를 호출할 때 `localhost` 대신 서버의 IP 주소를 사용하도록 설정해야 합니다. 이 설정은 보통 환경 변수를 통해 관리하는 것이 가장 좋습니다.

**1. 환경 변수 파일 생성:**
`src/main/frontend/` 디렉터리에 `.env` 파일을 생성하고, 백엔드 API 서버의 주소를 환경 변수로 정의합니다.

-   **생성할 파일:** `src/main/frontend/.env`
-   **파일 내용:**
    ```
    REACT_APP_API_URL=http://<서버의_IP_주소>:8080
    ```
    `<서버의_IP_주소>` 부분을 실제 Docker가 실행되는 머신의 IP 주소로 변경해야 합니다.

**2. API 호출 코드 수정:**
프론트엔드에서 `axios`나 `fetch`를 사용하여 API를 호출하는 부분을 찾아, 하드코딩된 `localhost` 주소 대신 위에서 설정한 환경 변수를 사용하도록 수정합니다.

-   **수정할 파일 (예시):** `src/main/frontend/src/context/AppContext.jsx` 또는 API 클라이언트 설정 파일

**예시 (변경 전):**
```javascript
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
});
```

**예시 (변경 후):**
```javascript
const apiClient = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
});
```

---

### 4단계: CORS (Cross-Origin Resource Sharing) 설정 확인

프론트엔드와 백엔드가 다른 IP 주소 또는 도메인에서 실행될 경우, 백엔드는 다른 출처(Origin)의 요청을 허용하도록 CORS 설정을 해야 합니다.

-   **수정할 파일 (예시):** `src/main/java/com/testcase/testcasemanagement/config/WebConfig.java` (해당 파일이 없다면 새로 생성)

**예시 코드:**
```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // API 경로 패턴
            .allowedOrigins("http://<서버의_IP_주소>:3000") // 프론트엔드가 서비스되는 주소
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowCredentials(true);
    }
}
```
`<서버의_IP_주소>:3000` 부분은 프론트엔드에 접속하는 주소로 변경해야 합니다. 개발 중에는 편의를 위해 `allowedOrigins("*")`를 사용할 수도 있지만, 보안상 권장되지 않습니다.

----

이 경우 프론트엔드와 백엔드가 항상 동일한 호스트와 포트에서 제공되므로, 복잡한 CORS 설정이나 프론트엔드에서의 IP 주소 관리가 필요 없어집니다.

이전 안내 내용을 지금 말씀해주신 구조에 맞게 훨씬 간단하게 다시 정리해 드리겠습니다.

해결 방안 (React 통합 빌드 환경)

이 구조에서는 단 두 가지만 확인하면 됩니다.

## 1단계: Spring Boot 서버가 모든 IP에서 접속을 허용하도록 설정

Docker 컨테이너 안에서 실행되는 Spring Boot 애플리케이션이 호스트 머신의 IP를 통해 들어오는 외부 요청을 받을 수 있어야 합니다. 이를 위해 server.address를 0.0.0.0으로 설정합니다.

수정할 파일: src/main/resources/application-dev-postgresql.yml (또는 사용하려는 프로파일에 맞는 설정 파일)

추가할 내용:
파일의 server 섹션에 address: 0.0.0.0를 추가합니다.

1 server:
2   port: 8080
3   address: 0.0.0.0 # 이 부분을 추가합니다.

## 2단계: React API 호출을 상대 경로로 변경

프론트엔드가 백엔드와 같은 곳에서 제공되므로, API를 호출할 때 전체 URL(http://localhost:8080/api)을 사용할 필요 없이, 상대 경로(/api)만 사용하면 됩니다.

수정할 파일 (예시): src/main/frontend/src/context/AppContext.jsx 또는 API 클라이언트를 설정하는 모든 파일

수정할 내용:
axios 인스턴스를 생성할 때 baseURL에서 도메인과 포트 부분을 완전히 제거하고, /api와 같이 슬래시로 시작하는 절대 경로만 남겨둡니다.

예시 (변경 전):

1 const apiClient = axios.create({
2   baseURL: 'http://localhost:8080/api', // IP와 포트가 하드코딩되어 있음
3 });

예시 (변경 후):

1 const apiClient = axios.create({
2   baseURL: '/api', // 이렇게 상대 경로로 변경
3 });
이렇게 변경하면, 브라우저는 현재 페이지의 도메인(예: http://<서버_IP>:8080)을 기준으로 /api 경로를 자동으로 조합하여 요청하므로, IP가 변경되어도 코드를 수정할 필요가 없습니다.

  ---

더 이상 필요 없는 설정

* 프론트엔드 `.env` 파일: REACT_APP_API_URL 같은 환경 변수를 더 이상 관리할 필요가 없습니다.
* 백엔드 CORS 설정: 프론트엔드와 백엔드가 동일한 출처(Same-Origin)에서 서비스되므로, 복잡한 WebConfig.java 같은 CORS 설정이 필요 없습니다. 만약 추가했다면 제거해도 됩니다.

이 두 단계만 적용하고 프로젝트를 다시 빌드하여 Docker로 실행하면, 어떤 IP로 접속하든 문제없이 작동할 것입니다. 이 방법이 훨씬 깔끔하고 운영 환경에 적합한 방식입니다.
