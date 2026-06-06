# Release Note - v1.0.81

## [1.0.81] - 2026-06-06

Hello! Release 1.0.81 is all about **completing the bilingual (Korean/English) experience**. We audited the entire frontend for Korean text leaking into English mode and **backfilled 1,196 missing translations** in one sweep, then built a brand-new **English user manual** on top of it. The Korean manual was also fully verified and updated against v1.0.80.

### Highlights

#### 🌐 Full Korean/English Switching Overhaul (Core)

* A full audit of the frontend eliminated Korean text that previously appeared in English mode.
  - 482 translation keys that existed without an English value → English translations seeded
  - ~800 Korean strings hardcoded outside the translation system (t()) across 99 screen files → converted to translation keys, with 713 new ko/en entries
* Filters, the test execution list, "Total N" counters, tag input hints, JIRA integration labels, tooltips, and chart formats now all switch to English correctly.
* New seed classes (`I18nGapKeysInitializer`, `I18nHardcodedKeysInitializer`, and 4 companions) ship the translations to fresh installations — idempotent seeding at application startup.
* Added `scripts/i18n_scan.py`, a scanner that detects Korean strings outside t() calls (CI-friendly exit codes) so regressions are caught early.

#### 📘 New English User Manual

* `docs/manual/new/USER_MANUAL_EN.md` — a complete translation with 18 sections and 49 subsections mapped 1:1 to the Korean manual, written in ISO/IEC/IEEE 26514 technical-writing style.
* All 68 screenshots were freshly captured with the **English UI and English sample data (ShopFlow EN)** under `docs/manual/new/images_en/`. Dialog screens (sign-up, project creation, the 7 profile tabs) were captured via automated UI interactions.
* The Korean and English manuals cross-link each other in their headers.

#### 📖 Korean User Manual — Full Audit & Update (against v1.0.80)

* Performed an exhaustive code-vs-manual comparison (20 routes, 11 numeric claims, release-note coverage, 98 images) and corrected every mismatch.
  - New §8-1 Result Entry Screen (P/F/B/N) and §8-2 Auto-Save behavior (v1.0.80 redesign)
  - Corrected result report export formats (actual: Excel / PDF / CSV)
  - Corrected the six project roles in §17-9 and §18-4 (PROJECT_MANAGER / LEAD_DEVELOPER / DEVELOPER / TESTER / CONTRIBUTOR / VIEWER)
  - Reflected the full-width single-column form layout (v1.0.80) and auto-height editors (v1.0.79)
* Added a **"How to Read This Manual"** preface (audience-based entry points + notation rules) per the IEC/IEEE 82079-1 information-for-use standard.
* Added 4 new screenshots: tree context menu, folder structure, field visibility, and form metadata.

#### 🎨 Transparent Logo

* The header logo was replaced with a **single transparent PNG** (previously two theme-specific JPGs), so it renders cleanly on any theme.

---

### 💡 What You Should Do

#### Switching to the English UI
1. Click your **avatar → Profile → Language** tab in the header and select English.
2. The entire UI switches immediately. Strings that previously remained in Korean are now fully translated.
3. The English manual is available at `docs/manual/new/USER_MANUAL_EN.md`.

#### Items that may still appear in Korean
* User-entered data (project and test case names) is not translated.
* A few system data items (scheduler job names) and the AM/PM date notation will be improved in a future update.

---

### 🛡️ Verification & QA Results

* **Backend compile:** `./gradlew compileJava` — passed (0 warnings)
* **Frontend build:** `vite build` — passed (15,012 modules, 0 errors)
* **Translation integrity:** all 3,418 translation keys used in code now have English values (0 remaining)
* **Bilingual E2E (Playwright):** swept 14 major screens in both English and Korean modes
  - English mode: **0** Korean UI labels remaining
  - Korean mode: all labels render in Korean (0 English regressions)
* **Manual verification:** exhaustive route/number cross-check plus a technical-writer review; the English edition matches 49/49 subsections with 0 broken image references
