# Release Note - v1.0.65

## [1.0.65] - 2026-04-14

This release note consolidates all major feature enhancements and system optimizations implemented since v1.0.61.

### Key Changes

#### 🚀 Advanced PDF Export
- **Enhanced Report Styling**: Professional report output is now supported with landscape/portrait orientation selection, custom headers/footers, and KPI summary sections.
- **Improved Branding & Visibility**: Custom branding has been applied to the footer, and sticky page headers containing test plan and execution details have been introduced.
- **Usability Improvements**: The test result table toolbar has been refactored and column menu usability enhanced for easier report configuration.

#### 🛠️ Backend Architecture & Performance Optimization
- **DTO Refactoring (Lombok)**: Lombok has been applied to all DTO classes to remove boilerplate code, and Bean Validation constraints have been added for improved data accuracy.
- **Data Retrieval Optimization**: Performance has been improved for large-scale data processing through database-level deduplication and server-side pagination for test results.
- **Build & Service Stability**: Gradle build configurations have been improved and service initialization logic optimized to ensure application startup and operational stability.

#### 🔍 Enhanced Test Result Filtering & Management
- **Show Latest Results Filter**: A feature to filter for only the most recent results for each test case has been implemented in both the server-side API and client-side UI.
- **Improved Date Parsing Compatibility**: Date parsing logic has been refined for better browser compatibility, ensuring accurate time information across platforms.

#### ✨ System UI & Security Enhancements
- **Header Information Display**: The application header now displays the current version and server time, allowing users to verify environment information instantly.
- **Security & Accessibility Optimization**: RAG status endpoint security settings have been updated, and a `skipAuth` option for authentication-exempt endpoints has been introduced for flexible access control.

#### 📊 Exploratory Testing UI Overhaul
- **Card Layout Introduction**: The session list has been redesigned with an intuitive card-based layout for better readability and accessibility.
- **Session Tracking & Automation**: Added session approval and interruption tracking with a visual progress bar to monitor progress effectively.
- **State Persistence**: Exploratory session tab information is now persisted via URL-based state management, maintaining task context across browser refreshes or navigation.

#### 🎨 Data Model & Layout Standardization
- **TestCaseTree Alignment**: Standardized the TestCaseTree layout with fixed-width columns to ensure visual consistency and readability across large tree structures.
- **Improved DB Stability**: Refined database schema initialization logic and introduced global exception handling for database constraint violations to ensure reliable data management.
