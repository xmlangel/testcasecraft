# Test Case Manager

This is a full-stack web application for managing test cases. The frontend is built with React and the backend is built with Spring Boot.

## Project Structure

```
.
├── build.gradle
├── gradlew
├── gradlew.bat
├── settings.gradle
├── src
│   ├── main
│   │   ├── frontend
│   │   │   ├── public
│   │   │   │   └── index.html
│   │   │   ├── src
│   │   │   │   ├── components
│   │   │   │   ├── context
│   │   │   │   ├── models
│   │   │   │   └── utils
│   │   │   ├── package.json
│   │   │   └── ...
│   │   ├── java
│   │   │   └── com/testcase/testcasemanagement
│   │   │       ├── controller
│   │   │       ├── model
│   │   │       ├── repository
│   │   │       └── service
│   │   └── resources
│   │       ├── application.properties
│   │       └── static
│   └── test
│       ├── java
│       └── resources
└── ...
```

### Frontend (`src/main/frontend`)

*   **Framework:** React
*   **UI Library:** Material-UI
*   **State Management:** Context API
*   **Data Storage:** localStorage
*   **Routing:** React Router
*   **Key Directories:**
    *   `src/components`: Contains reusable React components.
    *   `src/context`: Holds the application's global state using Context API.
    *   `src/models`: Defines data structures used in the application.
    *   `src/utils`: Provides utility functions.

### Backend (`src/main/java`)

*   **Framework:** Spring Boot
*   **Database:** PostgreSQL (with JPA)
*   **Authentication:** JWT
*   **Build Tool:** Gradle
*   **Key Packages:**
    *   `controller`: Handles incoming HTTP requests.
    *   `model`: Defines data entities.
    *   `repository`: Manages data access using Spring Data JPA.
    *   `service`: Implements business logic.

## Getting Started

### Prerequisites

*   Java 21 or later
*   Node.js 20.11.1 or later
*   PostgreSQL

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/test-case-manager.git
    cd test-case-manager
    ```

2.  **Install frontend dependencies:**
    ```bash
    cd src/main/frontend
    npm install
    ```

3.  **Run the application:**
    *   **Frontend:**
        ```bash
        npm start
        ```
    *   **Backend:**
        Open a new terminal and run:
        ```bash
        ./gradlew bootRun
        ```

The application will be available at `http://localhost:3000`.

## Available Scripts

### Frontend (`package.json`)

*   `npm start`: Runs the app in development mode.
*   `npm test`: Launches the test runner in interactive watch mode.
*   `npm run build`: Builds the app for production to the `build` folder.

### Backend (`build.gradle`)

*   `./gradlew bootRun`: Runs the Spring Boot application.
*   `./gradlew build`: Builds the project.
*   `./gradlew test`: Runs the tests.

---

# 테스트 케이스 관리자

이것은 테스트 케이스 관리를 위한 풀스택 웹 애플리케이션입니다. 프론트엔드는 React로, 백엔드는 Spring Boot로 구축되었습니다.

## 프로젝트 구조

```
.
├── build.gradle
├── gradlew
├── gradlew.bat
├── settings.gradle
├── src
│   ├── main
│   │   ├── frontend
│   │   │   ├── public
│   │   │   │   └── index.html
│   │   │   ├── src
│   │   │   │   ├── components
│   │   │   │   ├── context
│   │   │   │   ├── models
│   │   │   │   └── utils
│   │   │   ├── package.json
│   │   │   └── ...
│   │   ├── java
│   │   │   └── com/testcase/testcasemanagement
│   │   │       ├── controller
│   │   │       ├── model
│   │   │       ├── repository
│   │   │       └── service
│   │   └── resources
│   │       ├── application.properties
│   │       └── static
│   └── test
│       ├── java
│       └── resources
└── ...
```

### 프론트엔드 (`src/main/frontend`)

*   **프레임워크:** React
*   **UI 라이브러리:** Material-UI
*   **상태 관리:** Context API
*   **데이터 저장소:** localStorage
*   **라우팅:** React Router
*   **주요 디렉토리:**
    *   `src/components`: 재사용 가능한 React 컴포넌트를 포함합니다.
    *   `src/context`: Context API를 사용하여 애플리케이션의 전역 상태를 관리합니다.
    *   `src/models`: 애플리케이션에서 사용되는 데이터 구조를 정의합니다.
    *   `src/utils`: 유틸리티 함수를 제공합니다.

### 백엔드 (`src/main/java`)

*   **프레임워크:** Spring Boot
*   **데이터베이스:** PostgreSQL (JPA 사용)
*   **인증:** JWT
*   **빌드 도구:** Gradle
*   **주요 패키지:**
    *   `controller`: 들어오는 HTTP 요청을 처리합니다.
    *   `model`: 데이터 엔티티를 정의합니다.
    *   `repository`: Spring Data JPA를 사용하여 데이터 액세스를 관리합니다.
    *   `service`: 비즈니스 로직을 구현합니다.

## 시작하기

### 요구 사항

*   Java 21 이상
*   Node.js 20.11.1 이상
*   PostgreSQL

### 설치 및 실행

1.  **저장소 복제:**
    ```bash
    git clone https://github.com/your-username/test-case-manager.git
    cd test-case-manager
    ```

2.  **프론트엔드 종속성 설치:**
    ```bash
    cd src/main/frontend
    npm install
    ```

3.  **애플리케이션 실행:**
    *   **프론트엔드:**
        ```bash
        npm start
        ```
    *   **백엔드:**
        새 터미널을 열고 다음을 실행합니다:
        ```bash
        ./gradlew bootRun
        ```

애플리케이션은 `http://localhost:3000`에서 사용할 수 있습니다.

## 사용 가능한 스크립트

### 프론트엔드 (`package.json`)

*   `npm start`: 개발 모드에서 앱을 실행합니다.
*   `npm test`: 대화형 감시 모드에서 테스트 러너를 시작합니다.
*   `npm run build`: `build` 폴더에 프로덕션용 앱을 빌드합니다.

### 백엔드 (`build.gradle`)

*   `./gradlew bootRun`: Spring Boot 애플리케이션을 실행합니다.
*   `./gradlew build`: 프로젝트를 빌드합니다.
*   `./gradlew test`: 테스트를 실행합니다.