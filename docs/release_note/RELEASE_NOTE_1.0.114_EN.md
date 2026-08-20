# Release Note - v1.0.114

## [1.0.114] - 2026-08-20

Startup is noticeably faster: seeding the multilingual data dropped from 233 seconds to 1 second. This release also separates what a read-only role can *see* from what it can *press* on the execution detail screen, and fixes three places where seeding broke when the database was wiped and rebuilt from scratch.

### Highlights

#### ⚡ i18n seeding at startup: 233s → 1s

Two separate causes, fixed separately.

* **The persistence context kept growing** (233s → 51s). Each seeding helper looks up the existing value per item, and JPA flushes pending changes and dirty-checks every managed entity before a query. Because the whole run is a single transaction, later stages became slower than earlier ones — Korean took 49s while English took 75s for the same volume. The 50 sub-initializers are now wrapped in a step that clears the context after each one. The transaction is unchanged, so a failure still rolls everything back.
* **Each item cost three queries** (51s → 1s). The key was looked up by name, the language by code, and the existing translation by both. With 7,351 translations that is more than 20,000 queries. Key names, language codes, and translation values are now read once into memory and every decision is made from there. Loading takes 32 ms.
* Existing behavior is preserved. Log messages are unchanged per file, and — importantly — the 16 initializers that overwrite existing values still overwrite, while the 4 i18n-gap initializers still leave existing values alone. Making those four overwrite would revert every value edited through the translation management screen on each boot.

#### 🌐 Four translation keys that had values but were never registered

Seeding creates the key first and then attaches per-language values. If a value is added without registering the key, the value is discarded with only a warning. Startup finishes normally and the screen falls back to the hardcoded default, so the missing translation is easy to overlook.

| Key | Previous state |
|---|---|
| `testcase.version.button.create` | Korean and English values present, key missing |
| `testcase.spreadsheet.export.excel.title` | Korean and English values present, key missing |
| `testcase.version.summary.restored_to` | English only, key missing |
| `testcase.version.summary.steps_updated` | English only, key missing |

The last two are change-summary strings shown in version history. Because the key was missing, the value was discarded and they did not appear even in English. All four are now registered and the two missing Korean values were added.

#### 👁️ Viewing and editing are separated on the execution detail screen

* **The edit and save buttons had no role check** and were visible to read-only roles. They now render only with edit permission.
* **The result-entry button was merely disabled** when permission was missing. "Disabled" means "not right now", so using it for "not for you" forces the user to click and get a 403 to find out. Role and execution-state conditions are now separate: without permission the button is not rendered at all, and it is disabled only when the user has permission but the execution is not in progress.
* **The read path stays open.** Without result-recording permission the button reads `View` instead of `Add`, and the test case name is clickable for every role. The result screen opens read-only with no save button. Copying the result-entry link is a write flow and stays hidden.
* The 1.0.113 exposure sweep missed this screen. That release note recorded zero write buttons visible to read-only roles, but one edit button and twelve result-entry buttons remained here.

#### 🌱 Three failures when rebuilding the database from scratch

All three only appear on a re-run, which is why day-to-day development never hit them.

* **Two initializers created the same project.** The base data initializer creates `MOBILE-TEST`, then the organization data initializer tries the same code and hits the unique constraint. The exception was caught and logged, but it had consequences: the side holding the organization is the one that failed, so **the project was left with no organization**, and the member assignment that follows was skipped entirely. Project creation now looks up by code first; if the project exists, only the organization is filled in and the name and description are left alone.
* **The sample-data seed reused a deleted project ID.** Its state files survive a database wipe. Reusing the ID without checking made every later step fail. The cached ID is now verified once and discarded in favor of a lookup by project code if it no longer exists.
* **Result verification counted only what the current run created.** It checks conditions such as at least 30 automated passes, but on an already-seeded database nothing new is created, so the check failed. The question is whether the sample set meets the conditions, not how many rows this run added, so existing results are now included in the counts.

#### 🧪 Three regression guards

Relying on a human to read the startup log does not work: one seeding run produces thousands of lines, and four translation keys had in fact been sitting in there.

* **Every key with a value must be registered**: key registrations and value registrations are extracted from source and the difference is reported.
* **Sub-initializers must be wrapped in a step**: forgetting this when adding an initializer lets the context grow again for that stage.
* **Seeding helpers must delegate to the index**: reverting to direct repository lookups fails the build.

Each guard was deliberately broken to confirm it actually fails, then restored.

### Upgrade notes

* No DB migration scripts. No schema changes.
* Four new i18n keys, seeded in both Korean and English. Existing values are not overwritten.
* Seeding against an existing database produces the same result as before; this was verified by comparing every row against a pre-change snapshot.
* **One action is now more restricted.** Editing execution basic information requires edit permission (CONTRIBUTOR or above). Previously the button was visible regardless of role and the server rejected the request.
* Read-only roles **can** open the result screen. The result-entry button became `View`; this is not an increase in permission.
* You no longer need to delete the seed state files when recreating local sample data. If they point at a project that no longer exists, they are discarded and re-resolved.
* If an old screen is cached in the browser, force-reload (⌘⇧R / Ctrl+F5).
* For 1.0.113 changes, see [RELEASE_NOTE_1.0.113_EN.md](RELEASE_NOTE_1.0.113_EN.md).

### Verification

| Target | Method | Result |
|---|---|---|
| Backend suite | 85 files, 539 tests | Pass |
| Frontend suite | 79 files, 624 tests | Pass |
| Frontend build | vite build | Pass |
| Seeding time | Per-stage timestamps in the startup log | 233s → 51s → 1s |
| Seeding equivalence | Re-seed existing DB, compare every row to the pre-change snapshot | 7,373 lines identical, 0 warnings |
| First seed on empty DB | Separate schema seeded from scratch, all rows compared | Identical, 2s |
| Deleted translation recreated | Removed one row, re-seeded | 7,350 → 7,351 |
| Corrupted value repaired | Changed a value, re-seeded | Restored to the original |
| Non-overwriting family | Changed an i18n-gap value, re-seeded | Change kept |
| Translation API used by the UI | Checked the four new keys in the ko and en responses | Both return all four |
| Execution detail exposure | Counted actual visibility for six roles | viewer 12 view / 0 add / 0 edit; tester 12 add / 0 edit; CONTRIBUTOR and above include edit |
| Read path | Clicked a case name as viewer | Content shown, 0 save buttons |
| Restart after DB wipe | Dropped the database and booted from empty | 62 tables created, seeding 1s, 0 errors |
| Seed mode re-run | Two consecutive initializations on an empty schema | 0 failure logs, project linked to the organization, 0 duplicate members |
| Sample seed recovery | Corrupted both locales' state files with a nonexistent ID and re-ran | Recovered on its own, exit code 0 |
| Role sweep | Logged in with five accounts and opened the execution detail | 0 page errors |
