안녕하세요! docker-compose를 사용하여 IP 기반으로 애플리케이션을 구동하고 배포하는 방법에 대해 안내해 드리겠습니다. 현재 localhost로만 접속되는 문제는 주로 다음 세 가지 원인 때문에 발생합니다.

1. Spring Boot 백엔드 서버가 `localhost`에만 바인딩되어 있는 경우: 외부 IP의 연결을 허용하지 않습니다.
2. Docker Compose의 포트 설정이 `localhost`로 제한된 경우: 호스트 머신의 외부 IP로 포트가 노출되지 않습니다.
3. React 프론트엔드가 API를 `localhost`로만 요청하는 경우: 다른 기기에서 접속하면 API 서버를 찾을 수 없습니다.

이 문제들을 해결하기 위한 방법을 단계별로 설명해 드리겠습니다.

해결 방안

1단계: Spring Boot 서버가 모든 IP에서 접속을 허용하도록 설정

Spring Boot 애플리케이션이 외부 IP 주소의 요청을 받을 수 있도록 server.address를 0.0.0.0으로 설정해야 합니다. 이 설정은 애플리케이션이 사용 가능한 모든 네트워크 인터페이스에 바인딩되도록 합니다.

수정할 파일: src/main/resources/application-dev-postgresql.yml (또는 사용하려는 프로파일에 맞는 설정 파일)

추가할 내용:
파일의 server 섹션에 address: 0.0.0.0를 추가합니다.

1 server:
2   port: 8080
3   address: 0.0.0.0 # 이 부분을 추가합니다.

2단계: Docker Compose 포트 포워딩 설정 변경

docker-compose.yml 파일에서 서비스의 포트를 호스트 머신의 특정 IP(예: 127.0.0.1)에만 바인딩하면 외부에서 접속할 수 없습니다. 모든 IP에서 접속 가능하도록 바인딩을 제거해야 합니다.

수정할 파일: docker-compose-dev-spring/docker-compose.yml

수정할 내용:
ports 설정에서 127.0.0.1: 부분을 제거하여 호스트의 모든 IP에 포트를 노출합니다.

예시 (변경 전):

1 services:
2   testcraft-app:
3     # ...
4     ports:
5       - "127.0.0.1:8080:8080" # localhost로만 제한됨

예시 (변경 후):
1 services:
2   testcraft-app:
3     # ...
4     ports:
5       - "8080:8080" # 모든 IP에 노출됨
프론트엔드 서비스가 별도로 있다면 해당 서비스의 포트 설정도 동일하게 변경해야 합니다.

3단계: React 프론트엔드에서 API 요청 주소 변경

프론트엔드 애플리케이션이 백엔드 API를 호출할 때 localhost 대신 서버의 IP 주소를 사용하도록 설정해야 합니다. 이 설정은 보통 환경 변수를 통해 관리하는 것이 가장 좋습니다.

1. 환경 변수 파일 생성:
   src/main/frontend/ 디렉터리에 .env 파일을 생성하고, 백엔드 API 서버의 주소를 환경 변수로 정의합니다.

생성할 파일: src/main/frontend/.env

파일 내용:
1 REACT_APP_API_URL=http://<서버의_IP_주소>:8080
<서버의_IP_주소> 부분을 실제 Docker가 실행되는 머신의 IP 주소로 변경해야 합니다.

2. API 호출 코드 수정:
   프론트엔드에서 axios나 fetch를 사용하여 API를 호출하는 부분을 찾아, 하드코딩된 localhost 주소 대신 위에서 설정한 환경 변수를 사용하도록 수정합니다.

수정할 파일 (예시): src/main/frontend/src/context/AppContext.jsx 또는 API 클라이언트 설정 파일

예시 (변경 전):

1 const apiClient = axios.create({
2   baseURL: 'http://localhost:8080/api',
3 });

예시 (변경 후):
1 const apiClient = axios.create({
2   baseURL: `${process.env.REACT_APP_API_URL}/api`,
3 });

4단계: CORS (Cross-Origin Resource Sharing) 설정 확인

프론트엔드와 백엔드가 다른 IP 주소 또는 도메인에서 실행될 경우, 백엔드는 다른 출처(Origin)의 요청을 허용하도록 CORS 설정을 해야 합니다.

수정할 파일 (예시): src/main/java/com/testcase/testcasemanagement/config/WebConfig.java (해당 파일이 없다면 새로 생성)

예시 코드:

    1 import org.springframework.context.annotation.Configuration;
    2 import org.springframework.web.servlet.config.annotation.CorsRegistry;
    3 import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
    4 
    5 @Configuration
    6 public class WebConfig implements WebMvcConfigurer {
    7 
    8     @Override
    9     public void addCorsMappings(CorsRegistry registry) {
10         registry.addMapping("/api/**") // API 경로 패턴
11             .allowedOrigins("http://<서버의_IP_주소>:3000") // 프론트엔드가 서비스되는 주소
12             .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
13             .allowCredentials(true);
14     }
15 }
<서버의_IP_주소>:3000 부분은 프론트엔드에 접속하는 주소로 변경해야 합니다. 개발 중에는 편의를 위해 allowedOrigins("*")를 사용할 수도 있지만, 보안상 권장되지 않습니다.

요약

위의 4단계를 적용하면 localhost뿐만 아니라 지정된 IP 주소로도 애플리케이션에 접속하고 정상적으로 사용할 수 있게 됩니다. 각 단계는 독립적이지만 모두 연관되어 있으므로 순서대로 확인하고 적용하는 것을 권장합니다.
