# Release Note - v1.0.116

## [1.0.116] - 2026-08-21

Two things that used to block administrators are fixed. When the encryption key is missing, the screen now explains what to do instead of stopping at an error, and folders are no longer counted as test cases.

### Highlights

#### 🔑 Guidance on screen when the encryption key is missing

Running a connection test in the LLM settings ended here:

```
Connection test failed: No encryption key is configured. Please contact your administrator.
```

The administrator is the person reading that screen, so being told to contact one left nothing to act on. Production does not use the key committed to the repository, so any deployment without `JIRA_ENCRYPTION_KEY` lands in this state.

The fix steps now appear below the error. Expanding them reveals the command that generates a key and the environment-variable line, both copyable, along with a warning that changing the key makes already-stored values unreadable.

| Step | Guidance |
|---|---|
| 1 | Generate the key (`openssl rand -base64 32`) |
| 2 | Set the environment variable. Under Docker Compose it must go in both `.env` and `docker-compose.yml` to reach the container |
| 3 | Restart the application and run the connection test again |

The screen identifies the cause from a code the server sends alongside the message, not from the message text, so rewording or translating it cannot break the decision.

Two related defects were fixed as well. **The update path had no key check**, so an error while replacing an API key surfaced as a 500 with no indication of the cause; create, update, and connection test now behave the same way. And **a failed save displayed nothing at all** on screen.

#### 📁 Folders excluded from the test case count

Asked about a project holding one folder and one test case, the AI assistant answered "there are 2 test cases in total."

Folders and test cases live side by side in the same table, and the statistics queries counted both without distinguishing them. Four aggregates (total, by status, by result, by priority) now separate them, and the folder count is reported as its own value.

| Project | Before | After |
|---|---|---|
| ShopFlow | 120 | 108 cases + 12 folders |
| ShopFlow EN | 120 | 108 cases + 12 folders |
| QA Mobile App Testing | 105 | 100 cases + 5 folders |

The not-run count was off for the same reason: 37 became 25 for ShopFlow, while passed, failed, and blocked counts stayed the same, since folders are never executed and had no results to begin with. After the fix the status breakdown adds up exactly to the total.

The AI assistant now reports cases and folders separately, and the dashboard shows a folder count next to the case count. Projects without folders do not show it.

**Sequence numbers cannot tell folders apart.** The first attempt reused a condition already used elsewhere in this repository, but measurement showed that 24 of 29 folders already carry a sequence number, leaving ShopFlow at 120. A regression test now pins this down.

### Upgrade notes

* No database migration scripts. No schema changes.
* **Dashboard numbers will look smaller.** Folders are excluded from the total; nothing was lost, and the folder count appears next to it.
* **English text appears after a restart.** Korean shows immediately.
* This version does not set `JIRA_ENCRYPTION_KEY` for you. Without a value the screen only shows guidance, so the key still has to be provided in the deployment environment.
* **Check before adding or rotating the key.** LLM API keys and JIRA tokens already stored are encrypted with the previous key and must be entered again if it changes.
* For 1.0.115 changes, see [RELEASE_NOTE_1.0.115_EN.md](RELEASE_NOTE_1.0.115_EN.md).

### Verification

| Target | Method | Result |
|---|---|---|
| Case and folder counts | Three production projects compared before and after | 120 → 108+12, 120 → 108+12, 105 → 100+5 |
| Not-run count | ShopFlow status breakdown | 37 → 25, sum matches the total of 108 |
| Folder detection | 4 new regression tests (folders with sequence numbers, system folders) | Pass |
| Error cause detection | 6 new tests | Pass |
| Existing statistics behavior | Dashboard, test result, and test case tests | All pass |
| Build | Backend compile, frontend build | Pass |
| Formatting and i18n | Two formatters, hardcoded-string scan | Changes pass |
