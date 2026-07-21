# Release Note - v1.0.96

## [1.0.96] - 2026-07-20

v1.0.96 is a hotfix for two regressions left by the v1.0.95 security hardening. In both cases the app would stop working unless a new production environment variable was set, so we made it run correctly without forcing that configuration — while keeping the hardening's intent (locking down insecure defaults).

### Highlights

#### 🐞 Regression fixes

* **Fixed blank screen (static asset 403)**: In v1.0.95 the CORS allowed origins moved from a wildcard (`*`) to an environment-variable list. On deployments that didn't set `APP_CORS_ALLOWED_ORIGINS`, even the service's own domain was missing from the allowlist, so JS/CSS loads were denied with 403 (the build output is loaded with `crossorigin`, so the browser sends a CORS request). Same-origin requests are now always allowed regardless of configuration, so the UI loads without any extra setup. Cross-origin is still restricted to `APP_CORS_ALLOWED_ORIGINS`, so the hardening remains in place.
* **Fixed container marked unhealthy when the encryption key is unset**: Without `JIRA_ENCRYPTION_KEY`, the health indicator pulled the whole status DOWN, marking the container unhealthy and affecting unrelated login/read paths. When the key is missing, it is now surfaced as a WARN instead of failing the entire app. In that case only Jira/LLM configuration saving is disabled; everything else works normally.

### Upgrade Notes

* No DB migration — applies by swapping the image.
* Works with no extra environment variables. To use Jira/LLM configuration saving set `JIRA_ENCRYPTION_KEY`; to allow cross-origin access set `APP_CORS_ALLOWED_ORIGINS`.
* For the 1.0.95 changes, see [RELEASE_NOTE_1.0.95_EN.md](RELEASE_NOTE_1.0.95_EN.md).
