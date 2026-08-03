# TestcaseCraft Screen Specification

> Written 2026-08-04 · Baseline **v1.0.102**
> Audience: planning and design, new joiners, QA leads, external acceptance reviewers
> Korean edition: [`../README.md`](../README.md)

---

## 1. What this set is

The **real screens of TestcaseCraft, broken down one screen at a time**. Each screen gets
four documents that narrow from business flow → screen composition → element specification
→ requirement tracing.

Its role differs from the user manual (`../../manual/new/USER_MANUAL_EN.md`). The manual
explains *how to use* a screen to a user; this set describes *what is there and why* from a
planning and acceptance viewpoint. Both cover the same screens, but the manual covers
procedure while this set covers areas, elements, states, permissions, and rules.

### The basis for what is written

**The basis is the screen.** These documents describe the running screens, so they state
"this is how it is". They carry no source file names or line numbers. What planning needs is
"what the screen shows and how it reacts"; where that lives in code changes whenever the
code changes.

Points where looking at the screen alone leaves the verdict open are marked
`⚠ Needs verification`, together with what has to be checked. Example data uses the demo
projects the captures were taken from (ShopFlow · ShopFlow EN).

---

## 2. Screen list

Screen IDs run `S0`–`S11`. The folder number matches the ID number.

| ID | Screen | Primary route | Manual |
|---|---|---|---|
| **S0** | Login · Sign-up · Email verification · Manual viewing | `/login` · `/verify-email` · `/manual` | sections 1 · 15 |
| **S1** | Project list · create · edit · transfer organization · delete | `/projects` | sections 2 · 17-9 |
| **S2** | Header · breadcrumb · area navigation · project switch · profile · bookmarks | `/projects/{projectId}` shared layout | sections 3 · 13 · 14 · 4-7 |
| **S3** | Project dashboard · enterprise dashboard | `/projects/{projectId}` · `/dashboard` | sections 6 · 17-2 |
| **S4** | Tree · folder case list · single-case form · spreadsheet | `/projects/{projectId}/testcases` | sections 4 · 5 |
| **S5** | Plan list · create · case selection · two-pane plan workspace | `/projects/{projectId}/testplans` | section 7 |
| **S6** | Execution list · execution detail · result entry | `/projects/{projectId}/executions` | section 8 |
| **S7** | Result statistics · detail table · QA summary · export | `/projects/{projectId}/results` | section 9 |
| **S8** | JUnit result upload · list · detail | `/projects/{projectId}/automation` | section 10 |
| **S9** | Knowledge document upload · embedding · chat | `/projects/{projectId}/rag` | section 11 |
| **S10** | Charter · session · notes · report · approval | `/projects/{projectId}/exploratory` | section 12 |
| **S11** | Organizations · users · mail · LLM · scheduler · translations | `/organizations` and 5 more | section 17 |

The workflow that runs across every screen, and the canonical permission model, are in
[`EN-Overview.md`](EN-Overview.md).

---

## 3. The four documents per screen

| File | What it answers | Primary reader |
|---|---|---|
| `EN-S{n}-Workflow.md` | What business the screen handles, how it connects to the screens before and after, who can do what | planning · QA lead |
| `EN-S{n}-Screen.md` | The layout split into areas A–n, and per area the elements, display rules, states, and permission differences | planning · design · development |
| `EN-S{n}-Components.md` | Element specifications, display and interaction rules, state transitions, where settings are stored | design · development |
| `EN-S{n}-Requirements.md` | Requirement ↔ screen area tracing table, corrections needed, items needing verification | acceptance review · maintenance |
| `images/*.svg` | Layout diagrams | everyone |

The four documents of one screen point at each other. **Areas and elements in `Screen` must
have a row in `Requirements`, and anything that appears only in `Requirements` gets written
back into `Screen` and `Components`.**

---

## 4. Notation

### References

| Notation | Meaning |
|---|---|
| `/projects/{projectId}/testcases` | screen route |
| manual section 4-4 | section number in `../../manual/new/USER_MANUAL_EN.md` |
| `Screen` Area C | an area in the same screen's `Screen` document |
| `Workflow` section 5.2 | a section in the same screen's `Workflow` document. Section-sign notation is not used |
| S4 → S6 | navigation between screens |
| `⚠ Needs verification` | a point where the screen alone leaves the verdict open and a run is needed |

### Permissions

Six project roles are used together with system roles. The rules for deciding them are in
[`EN-Overview.md`](EN-Overview.md) section 5.

`RW` read + edit · `R` read only · `W(results)` record results only · `—` no access

### Status

| Notation | Meaning |
|---|---|
| Working | the requirement is implemented and works on the screen |
| **Partial** | works only under some conditions. The conditions are stated alongside |
| **Hidden** | the capability exists but the screen has no entry point. Reason and unlock condition are stated |
| **Environment-dependent** | exposure depends on environment settings or an external service |

---

## 5. Layout diagrams

Every screen carries an SVG layout diagram under `images/`. The English edition has its own
set with English labels; the Korean edition keeps the Korean set. The file names are the same
in both, so a document reference such as `images/S4_layout.svg` resolves within its own edition.

Diagrams are generated, not hand-drawn. The Korean set comes from
`../svg/build_ko.py`, the English set from `../svg/build_en.py`, and
`../svg/audit.py` checks both for overlapping or out-of-bounds elements.

---

## 6. Finding the document from the screen

The app shows a **small screen ID in the lower right**. It tells you which document covers the
screen in front of you. Hovering shows the screen name, and the name follows the user's
language setting.

| Badge | Documents |
|---|---|
| `S4` | `EN-S4-Workflow` · `EN-S4-Screen` · `EN-S4-Components` · `EN-S4-Requirements` |
| `S6` | `EN-S6-Workflow` · `EN-S6-Screen` · `EN-S6-Components` · `EN-S6-Requirements` |

The rule that maps an address to a screen ID lives in one place. **When a screen is added or
an address changes, that rule and the screen list here are changed together.** Changing only
one side makes the badge point at the wrong document.

No badge is drawn for an address the rule does not cover. Showing nothing beats showing a
wrong ID.

---

## 7. Update rules

1. **When a screen changes, its four documents change together.** A new area adds a row in
   three places — `Screen`, `Components`, `Requirements`.
2. **When a route changes, the route table in [`EN-Overview.md`](EN-Overview.md) section 6 is
   canonical.** Per-screen documents only reference it.
3. **When a permission verdict changes, change [`EN-Overview.md`](EN-Overview.md) section 5
   first**, then align each screen's permission table. Permission tables scattered across four
   places is where drift starts.
4. **Layout diagrams stay as SVG.** No new ASCII diagrams. When a layout changes, regenerate
   through the builder rather than editing the SVG by hand.
5. **Captures are not created in this set.** Reference the manual's `images/` · `images_en/`,
   and when something is missing, add it to the manual first and point at it from here.
6. Update the baseline version in the front matter.
7. **This English edition is a translation of the Korean set.** The Korean documents are
   canonical: change them first, then bring the English across. `../en/_TRANSLATION_CONTRACT.md`
   fixes the terminology so the fifty documents stay one set.

---

## 8. Related documents

| Document | Relationship |
|---|---|
| `../../manual/new/USER_MANUAL_EN.md` | usage procedure for the same screens. The source of the captures |
| `../../manual/*.md` | per-feature detail manuals (cases · plans · executions · results · statistics · user management) |
| `../../ARCHITECTURE.md` | system structure · module boundaries |
| `../../plan/LEFT_NAV_RESTRUCTURE.md` | design background for S2 area navigation (tab layout ↔ sidebar layout) |
| `../../plan/BOOKMARK_FAVORITES_SRS.md` | S2 bookmark requirement specification |
| `../../plan/TREE_DND_REORGANIZE_PLAN.md` | S4 tree drag-and-drop design |
| `../../plan/RAG_SERVICE_STRUCTURE.md` · `../../plan/RAG_EMBEDDING_PROCESS.md` | S9 RAG pipeline |
| `../../deployment/DOCKER_SETUP.md` | environment settings (including RAG and exploratory session exposure conditions) |
| `../../release_note/` | change history by version |
