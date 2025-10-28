# Repository Guidelines

## Project Structure & Module Organization
- Spring Boot backend lives in `src/main/java/com/testcase/testcasemanagement` with feature-first packages.
- React client sits in `src/main/frontend/src` (`components/`, `context/`, `models/`, `utils/`); static assets under `public/`.
- Shared resources live in `src/main/resources`; environment samples are in `.env*`.
- Auto/e2e assets: `src/test/java` for JVM suites, `e2e-tests/` for Playwright, `scripts/` for helper automation.
- Docs and ops collateral live in `docs/`, `dev-docker/`, and `docker-compose-*`.

## Build, Test, and Development Commands
- `./gradlew bootRun` serves the API with the latest bundled UI on `http://localhost:8080`.
- `./gradlew appNpmBuild` rebuilds the React bundle with local API defaults; runs before packaging.
- `cd src/main/frontend && npm start` launches the React dev server on `http://localhost:3000`.
- `./start-dev.sh` brings up the integrated stack; `./start-dev-postgresql.sh` attaches the Dockerized database.

## Coding Style & Naming Conventions
- Java 21: 4-space indentation, `PascalCase` types, `camelCase` members, and keep controllers/services under matching packages.
- React: `PascalCase.jsx` for components, hooks/utilities stay `camelCase` in their respective folders.
- Stick to 2-space indentation in JSX/TSX; rely on IDE formatters and the CRA eslint preset.
- Keep locale files and constants colocated in `src/main/frontend/src/constants` with uppercase snake keys.

## Testing Guidelines
- Run backend suites with `./gradlew test` (TestNG + Allure); results in `build/allure-results/` and reusable reports via `./gradlew allureReport`.
- Frontend unit tests: `cd src/main/frontend && npm test -- --watch=false`.
- UI smoke tests live in `e2e-tests/`; execute `npx playwright test` or `./run-e2e.sh` to produce `playwright-report/`.
- Name JVM tests `*Test` and mirror package paths; colocate React specs as `ComponentName.test.jsx` near the source.

## Commit & Pull Request Guidelines
- Follow the bilingual git template in `.gitmessage`: `[EN] Short summary / [KO] 한국어 요약`.
- Group related changes per commit, reference issues with `Fixes #id`, and keep subject lines present-tense.
- PRs must list scope, testing notes, Jira/issue links, and screenshots for UI updates.
- Verify `./gradlew test` and the frontend build succeed before requesting review.

## Environment & Security Tips
- Keep sensitive config in `.env`, `.env.dev`, `.env.prod`; never commit local overrides.
- Adjust `REACT_APP_API_BASE_URL` when targeting non-local APIs and confirm localStorage flows before shipping builds.
