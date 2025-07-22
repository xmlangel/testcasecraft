# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Test Case Management System built with Spring Boot (backend) and React (frontend). The application provides comprehensive test case management functionality including test case creation, test plan management, test execution, and result reporting. The system uses local storage for frontend state management and PostgreSQL for backend persistence.

## Build Commands

### Backend (Spring Boot)
```bash
# From project root
./gradlew clean build              # Clean and build project
./gradlew bootRun                  # Run Spring Boot application
./gradlew test                     # Run backend tests
./gradlew allureServe              # Generate and serve Allure test reports
```

### Frontend (React)
```bash
# From src/main/frontend directory
npm install                        # Install dependencies
npm start                          # Start development server (localhost:3000)
npm run build                      # Build for production
npm test                           # Run frontend tests
npx cypress open                   # Open Cypress for E2E testing
```

### Full Application Build
```bash
# From project root - builds both backend and frontend
./gradlew appNpmBuild              # Build frontend only
./gradlew copyFrontend             # Copy frontend build to Spring Boot static resources
./gradlew build                    # Complete build (includes frontend)
```

## Architecture Overview

### Backend Architecture
- **Spring Boot 3.2.4** with Java 21
- **Spring Security** with JWT authentication
- **Spring Data JPA** with PostgreSQL
- **RESTful API** design with controllers, services, and repositories
- **Google Sheets integration** for test case import/export
- **Email notifications** via SMTP
- **Allure test reporting** with TestNG

### Frontend Architecture
- **React 18** with functional components and hooks
- **Material-UI (MUI)** for UI components
- **React Context API** for state management (AppContext)
- **Local Storage** for data persistence
- **React Router** for navigation
- **Tree view** implementation for hierarchical test case management

### Key Components Structure
```
src/main/frontend/src/
├── components/          # React components
│   ├── Dashboard.jsx    # Main dashboard
│   ├── TestCaseTree.jsx # Hierarchical test case view
│   ├── TestCaseForm.jsx # Test case creation/editing
│   ├── TestPlanForm.jsx # Test plan management
│   └── TestExecutionForm.jsx # Test execution interface
├── context/
│   └── AppContext.jsx   # Global state management
├── models/              # Data models and demo data
├── utils/               # Utility functions for tree operations
└── App.jsx             # Main application component
```

### Backend Package Structure
```
src/main/java/com/testcase/testcasemanagement/
├── controller/         # REST API endpoints
├── service/           # Business logic layer
├── repository/        # Data access layer
├── model/            # JPA entities
├── dto/              # Data transfer objects
├── config/           # Security and application configuration
└── util/             # Utility classes
```

## Key Data Models

### Frontend Models
- **TestCase**: Hierarchical structure supporting folders and test cases
- **TestPlan**: Groups test cases for execution
- **TestExecution**: Individual test run instances
- **TestResult**: Execution results and status tracking

### Backend Entities
- **Project**: Top-level organization unit
- **TestCase**: Core test case entity with steps
- **TestPlan**: Test planning and organization
- **TestExecution**: Test execution tracking
- **TestResult**: Result storage and reporting
- **User**: Authentication and authorization

## Development Guidelines

### Frontend Development
- Use functional components with React hooks
- Leverage AppContext for shared state
- Follow Material-UI theming and component patterns
- Implement proper error handling and loading states
- Use local storage for data persistence

### Backend Development
- Follow Spring Boot best practices
- Use DTOs for API responses
- Implement proper exception handling with GlobalExceptionHandler
- Follow RESTful API conventions
- Use proper validation annotations

### Testing
- Backend: TestNG with Allure reporting
- Frontend: Jest for unit tests, Cypress for E2E tests
- JSON Schema validation for API testing
- Database integration testing with H2

## Environment Configuration

### Backend Configuration
- `application.yml`: Main configuration
- `application-test.properties`: Test environment
- JWT secret and Google OAuth credentials required
- PostgreSQL database connection setup

### Frontend Configuration
- Environment variables for API base URL
- React build configuration in `build.gradle`
- Cypress configuration for E2E testing

## Common Development Tasks

### Adding New Test Case Features
1. Create/update DTOs in backend
2. Add service layer methods
3. Create/update REST endpoints
4. Update frontend models
5. Create/update React components
6. Add proper error handling

### Database Changes
1. Update JPA entities
2. Create test data in `init-test-data.sql`
3. Update DTOs and mappers
4. Test with integration tests

### API Testing
- Use JSON schema validation in tests
- Test both success and error scenarios
- Verify proper HTTP status codes
- Test authentication and authorization

## Security Considerations
- JWT-based authentication
- Password encoding with Spring Security
- CORS configuration for frontend integration
- Input validation and sanitization
- Secure cookie handling