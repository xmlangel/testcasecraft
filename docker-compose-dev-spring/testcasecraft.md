# 🚧 UNDER ACTIVE DEVELOPMENT 🚧  

⚠️ This project is currently **under active development**.  
Features, configuration, and setup instructions may change frequently.  
Use at your own risk and do not use in production environments yet.  
----
TestcaseCraft is a powerful, modern, and intuitive web application for managing test cases, plans, and executions. Built with a robust backend and a responsive frontend, it provides a centralized platform for QA teams and developers to streamline their testing lifecycle.

[GitHub Repository](https://github.com/xmlangel/testcasecraft)

✨ Key Features

- 🗂️ Hierarchical Test Case Management: Organize test cases in a flexible tree structure with folders.
- 📋 Test Plan Creation: Group test cases into executable test plans for different releases or test cycles.
- 🚀 Test Execution & History: Run test plans, record results (Pass, Fail, Skip), and track execution history.
- 📊 Insightful Dashboard: Visualize testing progress and results with interactive charts.
- 🔐 Secure Authentication: JWT-based authentication system ensures your data is secure.
- 👥 Multi-Project Support: Manage test assets across multiple projects seamlessly.
- JIRA Integration: Connect with JIRA to link test cases with development tasks.

🛠️ Technology Stack

- Backend: Java 21, Spring Boot 3
- Frontend: React 18, Material-UI
- Database: PostgreSQL 15
- Web Server: Nginx (as Reverse Proxy)
- Authentication: JWT (JSON Web Tokens)
- Build Tool: Gradle

🚀 Getting Started with Docker

This application is designed to be run easily using Docker Compose by pulling a pre-built image.

**Prerequisites**

- Docker (https://docs.docker.com/get-docker/) (v20.10+)
- Docker Compose (https://docs.docker.com/compose/install/) (v2.0+)

**Step 1: Create Configuration Files**

First, create a directory for your configuration and download the necessary files.

```bash
mkdir testcasecraft && cd testcasecraft

# Download docker-compose.yml
# Note: The source file is docker-compose.yml, but we save it as docker-compose.yml
curl -o docker-compose.yml https://raw.githubusercontent.com/xmlangel/testcasecraft/refs/heads/master/docker-compose.yml

# Download Nginx configuration
mkdir -p nginx/conf.d
curl -o nginx/nginx.conf https://raw.githubusercontent.com/xmlangel/testcasecraft/refs/heads/master/nginx/nginx.conf
curl -o nginx/conf.d/default.conf https://raw.githubusercontent.com/xmlangel/testcasecraft/refs/heads/master/nginx/conf.d/default.conf
```
**Step 2: Create Environment File (.env)**

Create a file named `.env` in the `testcasecraft` directory. This file will store your secret keys and passwords.

Copy and paste the following template into `.env` and replace the placeholder values.
```
# .env
# === PostgreSQL Settings ===
# You can change the user and DB name, but the password is required.
POSTGRES_DB=testcase_management
POSTGRES_USER=testcase_user
POSTGRES_PASSWORD=your_strong_postgres_password

# === Application Secrets ===
# IMPORTANT: Replace these with strong, randomly generated strings.
# You can use 'openssl rand -base64 48' to generate them.
JWT_SECRET=your_super_strong_jwt_secret_key_with_at_least_512_bits_long
JIRA_ENCRYPTION_KEY=your_super_strong_jira_encryption_key_for_production

# === Optional Settings ===
# Port for PostgreSQL database if you want to expose it
# POSTGRES_PORT=5432
```
## .env Sample is below 
```
POSTGRES_DB=testcase_management
POSTGRES_USER=testcase_user
POSTGRES_PASSWORD=testcase_password
JWT_SECRET=ZGV2X2p3dF9zZWNyZXRfa2V5X2Zvcl9kZXZlbG9wbWVudF9vbmx5X3RoaXNfbXVzdF9iZV9hdF9sZWFzdF81MTJfYml0c19sb25nX3RvX3dvcmtfcHJvcGVybHlfd2l0aF9zcHJpbmdfc2VjdXJpdHlfYW5kX2p3dF90b2tlbl9nZW5lcmF0aW9uX3N5c3RlbQ==
JIRA_ENCRYPTION_KEY=5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y=
ENABLE_HTTPS=false
```

**Security Note**: It is crucial to use strong, unique values for `POSTGRES_PASSWORD`, `JWT_SECRET`, and `JIRA_ENCRYPTION_KEY`.

**Step 3: Run the Application**

Now, you can start the entire application stack with a single command. This command automatically downloads (pulls) the latest version of the application image from Docker Hub before starting.
```bash
docker-compose -f docker-compose.yml --env-file .env up -d
```
The application will be available at http://localhost after a few moments. The initial startup might take some time to download images and initialize the database.

**Step 4: Access the Application**

- URL: http://localhost
- Default Username: `admin`
- Default Password: `admin`

**How to Stop the Application**

To stop the application and its services, run:
```bash
docker-compose -f docker-compose.yml down
```
⚙️ Configuration

All configuration is managed through the `.env` file. See the `docker-compose.yml` file for more advanced configuration options.
