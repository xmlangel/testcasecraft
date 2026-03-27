# Release Notes - v1.0.1 to v1.0.10 (Initial Foundation)

## 🚀 Key Changes

### 🏗 Initial Project Architecture

- **Full-Stack Foundation**: Established the core framework for the test case management platform using Spring Boot 3.x and React 18.
- **Authentication System**: Implemented the first version of JWT-based login and authorization system.

### 📂 Core Test Management Features

- **Hierarchical Structures**: Introduced management for project, folder, and test case hierarchies.
- **Test Plan & Execution**: Built the essential workflows for planning tests and entering results (Pass/Fail/Skip/NA).

### 🐳 Docker & Build Environment

- **Docker Compose Support**: Completed initial Docker configurations for PostgreSQL and infrastructure services.
- **Integrated Gradle Build**: Standardized Gradle tasks for building and serving both backend and frontend as a single unit.

### 📌 v1.0.10 Detailed Changes

- **[fix] Security Patches**: Addressed partial security vulnerabilities across the system.
- **[fix] Orphaned Documentation Cleanup**: Fixed errors in the logic for cleaning up unlinked (orphaned) RAG documents.
- **[fix] RAG Document Polling Optimization**: Removed the 3-second polling for active RAG documents and changed it to refresh-only retrieval to save resources.
- **[fix] Token Refresh Logic**: Improved the stability of the authentication token refresh process.
- **[chore] Docker Build Script**: Corrected the build script that was restricted to AMD64 architecture.
- **[refact] RAG Document Page**: Refactored the RAG document management page for better maintainability.

### 📌 v1.0.9 Detailed Changes

- **[fix] Test Execution Layout**: Adjusted the layout of the test execution screen for better visibility.
- **[fix] Attachment Button Visibility**: Fixed an issue where the attachment button was incorrectly displayed when no files were attached to the test result.

### 📌 v1.0.8 Detailed Changes

- **[feat] Email Verification**: Introduced email verification to enhance user security. Users can verify their email during signup or in profile settings.

- **[feat] AppBar Appearance Settings**: Moved the Dark/Light mode toggle from the profile menu to the top AppBar for better accessibility.

- **[feat] AI Chat Link Fix**: Fixed an issue where links to referenced conversation context in RAG-based AI responses were missing.
- **[fix] Security Patches**: Addressed and patched security vulnerabilities across the system.

### ⚠️ Upgrade Notice (v1.0.8)

- **Database Migration**: Users upgrading from versions prior to v1.0.7 must manually run a SQL script to add the `email_verified` column to the `users` table.
  ```sql
  ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
  ```

### 📌 v1.0.7 Detailed Changes

- **[feat] System Dashboard**: Added a dashboard to monitor real-time system metrics such as CPU, memory, and disk usage.

- **[feat] Scheduler Management**: Enabled direct control of internal system schedulers via the UI. Supports Cron expression validation and runtime schedule changes.

- **[feat] Bulk Test Case Deletion**: Improved the deletion process to allow batch deletion of test cases by folder or selected items, replacing the single-item deletion limit.
- **[fix] Test Case Tree Optimization**: Improved the rendering performance and usability of the test case tree structure.

### 📌 v1.0.5 ~ v1.0.6 Detailed Changes

- **[feat] Bulk Test Result Input**: Added functionality to input execution results for multiple test cases at once, significantly improving testing efficiency.

- **[feat] Markdown Step Display**: Test steps in the execution screen are now rendered in Markdown for better readability.
- **[fix] Spreadsheet Stabilization**: Fixed flickering issues and errors when deleting parent folders while editing test cases in spreadsheet mode.

### 📌 v1.0.2 ~ v1.0.4 Detailed Changes

- **[feat] Test Plan Mapping**: Enhanced the flexibility of the mapping structure between test plans and test cases.
- **[fix] UI Bug Fixes**: Fixed an issue where the download button appeared even without attachments in the test execution screen, and resolved a logo image permission error.
- **[fix] Translation Management Hidden**: Temporarily disabled the translation management menu as it is undergoing stability improvements.

### 📌 v1.0.0 ~ v1.0.1 (Initial Release)

- **[v1.0.1] Initial Stabilization**: Fixed pgvector initialization issues on first install, updated the logo, and added an API for clipboard image management.
- **[v1.0.0] Project Launch**: Released the first official version of the Test Case Management System, featuring RAG (Retrieval-Augmented Generation) AI support.

## 📸 Full Screenshot Gallery

<img src="../images/v1.0.8_Profile_Email_Verify_complete.png" width="200" style="margin:5px"> <img src="../images/v1.0.8_Profile_Email_Verify.png" width="200" style="margin:5px"> <img src="../images/v1.0.8_Profile_Email_Verify_mail.png" width="200" style="margin:5px"> <img src="../images/v1.0.8_AppBar_Apperance.png" width="200" style="margin:5px"> <img src="../images/v1.0.8_Mail_Setting.png" width="200" style="margin:5px"> <img src="../images/v1.0.8_Mail_Setting_detail.png" width="200" style="margin:5px"> <img src="../images/v1.0.8_User_Management_Email.png" width="200" style="margin:5px"> <img src="../images/v1.0.7_01_system_dashboard_system_performanct_metrics.png" width="200" style="margin:5px"> <img src="../images/v1.0.7_02_version_info.png" width="200" style="margin:5px"> <img src="../images/v1.0.7_03_Scheduler_Management.png" width="200" style="margin:5px"> <img src="../images/v1.0.7_04_Scheduler_Management_Edit_Scheduler_Configuration.png" width="200" style="margin:5px"> <img src="../images/01_Light_Login.png" width="200" style="margin:5px"> <img src="../images/02_Light_SignUp.png" width="200" style="margin:5px"> <img src="../images/03_Light_Project_List.png" width="200" style="margin:5px"> <img src="../images/04_Light_Project_Dashboard.png" width="200" style="margin:5px"> <img src="../images/05_Light_Test_CASE_Form_INPUT.png" width="200" style="margin:5px"> <img src="../images/06_Light_Test_CASE_Sprdadsheet_01.png" width="200" style="margin:5px"> <img src="../images/07_Light_Test_CASE_Sprdadsheet_02.png" width="200" style="margin:5px"> <img src="../images/08_Light_Test_Plan_List.png" width="200" style="margin:5px"> <img src="../images/09_00_Light_Test_Execution_List.png" width="200" style="margin:5px"> <img src="../images/09_01_Light_Test_execution_1.png" width="200" style="margin:5px"> <img src="../images/09_02_Light_Test_execution_Input_result.png" width="200" style="margin:5px"> <img src="../images/09_03_Light_Test_execution_Previos_Execution_result.png" width="200" style="margin:5px"> <img src="../images/10_Light_Test_Result_01.png" width="200" style="margin:5px"> <img src="../images/11_Light_Test_Result_02.png" width="200" style="margin:5px"> <img src="../images/12_Light_Automation_Dashboard.png" width="200" style="margin:5px"> <img src="../images/13_Light_Automation_Recent_Result.png" width="200" style="margin:5px"> <img src="../images/14_Light_Automation_Result_Detail_Tests.png" width="200" style="margin:5px"> <img src="../images/15_Light_Automation_Result_Detail_Fail_Tests.png" width="200" style="margin:5px"> <img src="../images/16_Light_Automation_Result_Detail_Slow_Tests.png" width="200" style="margin:5px"> <img src="../images/17_Light_RAG_DOC.png" width="200" style="margin:5px"> <img src="../images/18_Light_RAG_DOC_Chat_01.png" width="200" style="margin:5px"> <img src="../images/19_Light_RAG_DOC_Chat_Referenct_RAC.png" width="200" style="margin:5px"> <img src="../images/20_00_Light_RAG_DOC_Chat_Creation.png" width="200" style="margin:5px"> <img src="../images/20_01_Light_RAG_PDF.png" width="200" style="margin:5px"> <img src="../images/20_02_Light_RAG_View_Document_chunks.png" width="200" style="margin:5px"> <img src="../images/21_Light_User_Profile_Basic_info.png" width="200" style="margin:5px"> <img src="../images/22_Light_User_Profile_Password.png" width="200" style="margin:5px"> <img src="../images/23_Light_User_Profile_Language.png" width="200" style="margin:5px"> <img src="../images/24_Light_User_Profile_Appearance.png" width="200" style="margin:5px"> <img src="../images/25_Light_User_Profile_Jira_Settings.png" width="200" style="margin:5px"> <img src="../images/26_Light_User_Profile_Add_Jira_Settings.png" width="200" style="margin:5px"> <img src="../images/27_light_test_execution_bulk_input.png" width="200" style="margin:5px">
