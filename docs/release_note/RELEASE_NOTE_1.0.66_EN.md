# Release Note - v1.0.66

## [1.0.66] - 2026-04-14

This release note covers major functional improvements and system optimizations since v1.0.65.

### Key Changes

#### 🚀 Infinity Scroll for Automation Test Results
- **Performance & UX Optimization**: Implemented infinite scrolling for the automation test results list, enabling smooth navigation through large datasets.
- **Memory Efficiency**: Reduced client-side memory load by fetching data on-demand during scrolling instead of loading all records at once.

#### 🛠️ Build System & Runtime Optimization
- **Advanced Gradle Tasks**: Improved `bootRun` tasks to explicitly depend on the `classes` task and refined runtime classpath settings for enhanced execution stability.
- **Development Productivity**: Optimized remote execution task configurations to improve the overall development workflow.

#### ✨ UI Detail Page Improvements
- **MUI Component Optimization**: Refined the use of Material-UI components (e.g., `FormControl`) in the `JunitResultDetail` page and improved the overall layout.

#### 🔒 Security Hardening & Dependency Updates
- **Security Patches**: Upgraded base image packages to the latest versions to address potential security vulnerabilities and strengthen system security.
- **Library Updates**: Synchronized project dependency versions to ensure long-term system stability and compatibility.

#### 🐜 Bug Fixes
- **Test Validation Logic**: Updated `TestResultReportServiceMockTest` to align with optimized service logic, ensuring higher test reliability.
