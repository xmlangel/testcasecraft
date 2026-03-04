# testcasecraft Jira App 빌드 및 배포 가이드

본 문서는 `jiraApp` 디렉토리 내에 위치한 최신 Atlassian Forge 앱(UI Kit)의 환경 설정, 빌드 및 배포 과정을 설명합니다.

## 🛠 필수 구성 요소 (Prerequisites)

*   **Node.js**: v22.x 이상 권장 (최신 Forge 런타임 최적화)
*   **Forge CLI**: Atlassian Forge Command Line Interface
    *   시스템에 전역으로 설치되어 있어야 합니다. (최신 버전 유지 권장)
        ```bash
        npm install -g @forge/cli
        ```
*   **Atlassian API Token**: 앱 배포를 위해 인증된 Atlassian 계정 및 API 토큰이 필요합니다.
    *   처음 실행 시 다음 명령어를 통해 로그인합니다.
        ```bash
        forge login
        ```

---

## 🚀 1. 환경 준비 및 의존성 설치

`jiraApp` 디렉토리로 이동하여 필요한 npm 패키지들을 설치합니다. 

```bash
cd jiraApp
npm install
```
*(참고: 최신 모던 플로우에서는 `@forge/react`, `@forge/bundler` 등의 패키지가 내부적으로 사용됩니다.)*

---

## 📦 2. 앱 배포 (Deploy) - 빌드 포함

최신 Forge 아키텍처에서는 별도의 `npm run build` 스크립트를 수동으로 실행할 필요가 없습니다. **`forge deploy` 명령어 내부에서 자체 번들러(Forge Bundler)가 React 코드를 자동으로 빌드하고 패키징합니다.**

코드를 Atlassian 클라우드 환경으로 배포하려면 다음 명령어를 실행하세요. 배포 환경(Environment)은 기본적으로 `development`, `staging`, `production` 옵션이 제공됩니다.

### 개발 환경 배포 (기본)

```bash
forge deploy
```
이 명령어는 코드를 빌드하고 `development` 환경에 즉시 배포합니다.

### 상용/스테이징 환경 배포 (Staging / Production)

```bash
forge deploy -e staging
# 또는
forge deploy -e production
```

---

## 🔗 3. 앱 설치 (Install)

배포된 앱 코드를 실제 Jira 사이트에 설치하여 연동해야 동작을 확인할 수 있습니다.

```bash
forge install
```

명령어를 실행하면 나타나는 프롬프트 안내에 따릅니다:
1.  **설치할 제품 선택**: 방향키로 `Jira`를 선택하고 Enter 키를 누릅니다.
2.  **사이트 URL 입력**: 앱을 설치할 Jira 클라우드 사이트 주소를 입력합니다. (예: `your-domain.atlassian.net`)

설치가 완료되면 연동하신 Jira 사이트의 지정된 화면(예: 프로젝트 페이지, 이슈 뷰 등)에서 앱이 정상적으로 렌더링되는지 확인합니다.

---

## ⚡ 4. 실시간 로컬 개발 (Tunneling)

개발 중 코드를 수정할 때마다 매번 `deploy`를 하는 것은 매우 비효율적입니다. `forge tunnel` 명령어를 사용하면 로컬의 코드 변경 사항을 Jira 화면에 실시간으로 반영하여 테스트할 수 있습니다.

```bash
forge tunnel
```

**✅ 터널링 사용 팁**:
*   터널링을 시작하기 전에 **최소 1회 이상 `forge deploy` 및 `forge install`이 완료**되어 있어야 연결이 가능합니다.
*   터널이 실행 중인 터미널을 켜둔 상태로 로컬 코드(`src/frontend/index.jsx` 등)를 수정하고 저장하면, Jira 화면 새로고침 시 변경 사항이 즉시 적용됩니다.
*   디버깅이 필요한 경우 자동 로깅을 지원하므로 콘솔에서 `console.log()` 등 오류를 바로 추적할 수 있습니다.

---

## 📝 요약: 일반적인 개발 워크플로우

1.  **초기 세팅**: `npm install` -> `forge login` -> `forge deploy` -> `forge install`
2.  **일상적인 개발**: `forge tunnel` 실행 후 코드 수정 및 결과 즉시 확인
3.  **최종 적용**: `forge deploy` 로 개발 환경 코드 업데이트, 이후 필요시 `-e production` 환경 배포

---

## 🛑 5. 트러블슈팅 (Troubleshooting)

`forge install` 및 배포 과정에서 다음과 같은 에러가 발생할 수 있습니다.

### 1. "The URL you entered doesn't belong to an Atlassian site" 에러
**증상**:
```
Error: The URL you entered doesn't belong to an Atlassian site: https://<입력한-도메인>/
```
**원인**: 입력한 Jira 사이트 URL 도메인에 오타가 있거나 존재하지 않는 Atlassian 사이트일 때 발생합니다.
**해결법**: 사이트 주소를 정확히 확인하여 다시 `forge install` 명령어를 실행하세요. (예: `skaiworld.atlassian.net` 대신 `skaiworldwide.atlassian.net`이 맞는지 확인)

### 2. "App is already installed" 에러
**증상**:
```
Error: Installation error: App is already installed.
If you're trying to upgrade your app, use the forge install --upgrade command.
```
**원인**: 이미 해당 Jira 사이트에 동일한 환경(`development` 등)으로 앱이 설치되어 있는데 `forge install` 명령어를 다시 실행했을 때 발생합니다.
**해결법**: 
*   **코드만 변경된 경우**: 앱이 이미 설치된 상태라면 `forge deploy` 명령어만 실행해도 Jira 사이트에 즉시 업데이트된 코드가 반영됩니다. `install`을 다시 할 필요가 없습니다.
*   **권한(Scope)이나 manifest가 변경된 경우**: 터미널에 안내된 대로 아래 명령어를 사용하여 앱 버전을 명시적으로 업그레이드해야 합니다.
    ```bash
    forge install --upgrade
    ```
