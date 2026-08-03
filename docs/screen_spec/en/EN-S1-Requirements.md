# Projects(S1) Requirement Coverage

> Screen ID **S1** · Base documents: [`EN-S1-Workflow.md`](EN-S1-Workflow.md) · [`EN-S1-Screen.md`](EN-S1-Screen.md) · [`EN-S1-Components.md`](EN-S1-Components.md)
> Baseline **v1.0.102**
> Status notation and reference rules are [`../README.md`](../README.md) section 4.

---

## 1. Functional requirements

| # | Requirement | Where implemented | Status |
|---|---|---|---|
| **S1-01** | List participating projects as cards, display case count, member count, automation result count | 02 **Area D** 1~8 | Working |
| **S1-02** | Create tabs by belonging (organization, independent, all) **only when content exists** | 02 **Area C** | Working |
| **S1-03** | Create project with name, code, organization, description. Code becomes display ID prefix | 02 **Area A·G** | Working |
| **S1-04** | Authenticated user can create independent project regardless of system role | 01 section 3.2, 02 section 5 | Working |
| **S1-05** | Creator automatically becomes `PROJECT_MANAGER` | 01 section 4 P4 | ⚠ Needs verification V-S1-1 |
| **S1-06** | Edit project | 02 **Area F·G** | Working |
| **S1-07** | Transfer organization — select target and move belonging | 02 **Area F·H** | Working |
| **S1-08** | Delete and force delete in **two modes with different warning levels** | 02 **Area F·I** | Working |
| **S1-09** | Expand organization project members on card (5 + `+N more`) | 02 **Area D** 7, 9 | Working |
| **S1-10** | Use different member query API based on belonging | 03 section 3.2 | Working |
| **S1-11** | Query member API once per organization even with multiple projects | 03 section 3.1 | Working |
| **S1-12** | With 0 participating projects, show invitation guidance and create button together | 02 **Area E** | Working |
| **S1-13** | Enter workspace via `[Open Project]` | 02 **Area D** 10 | Working |
| **S1-14** | Show full screen loading indicator while querying | 02 section 3 | Working |
| **S1-15** | Draw project list even if organization API fails | 03 section 3.3 | Working |
| **S1-16** | Invite project members, assign roles | — | **Hidden** — no form on screen |
| **S1-17** | Remove project members | — | **Hidden** — no form on screen |

---

## 2. Non-functional and quality requirements

| # | Requirement | Where implemented | Status |
|---|---|---|---|
| **S1-N1** | Destructive actions show target name in bold and request confirmation | 02 **Area I** | Working |
| **S1-N2** | Lock confirm and cancel buttons together while saving/deleting | 02 section 3 | Working |
| **S1-N3** | Screen text in `t("key","Korean")` form | 02 section 6 | **Correction needed C-2** |
| **S1-N5** | Hide buttons without permission (screen-wide rule G4) | 02 section 5 F row | **Correction needed C-1** |
| **S1-N6** | Member query failure does not block list | 03 section 3.3 | Working |
| **S1-N7** | Clear menu state after close animation | 03 section 2.2 | Working |
| **S1-N8** | Do not leave empty row when description absent | 02 **Area D** 5 | Working |

---

## 3. Correction targets

These work but contradict conventions. Fix together when working on screen.

| # | Item | What contradicts | Action |
|---|---|---|---|
| **C-1** | `⋮` menu items show regardless of permission | Screen-wide rule G4: hide actions without permission. Now VIEWER sees delete item and server rejects | Attach management permission condition to items. If roles are needed per project in list response, verify V-S1-2 first |
| **C-2** | Delete confirmation text is hardcoded Korean | `'{name}' really delete project?` outside `t()` leaks Korean in English mode | Wrap in `t("project.dialog.deleteConfirm", …)`. Add seed. Procedure: `testcasecraft-i18n-audit` |

---

## 4. Needs verification

| # | Item | Why different | Verification method |
|---|---|---|---|
| **V-S1-1** | Creator becomes PM point | Manual section 17-9 states so; demo init code has explicit assignment. Need to verify same happens in normal create path | Check `POST /api/projects` handling then `ProjectUser` row's `roleInProject` |
| **V-S1-2** | Does list response include my role | C-1 fix needs to know my role per card. Check if list DTO has that field | Verify `GET /api/projects` response fields |
| **V-S1-3** | Server delete vs force delete difference | Screen appears to use same endpoint with flag. Need to check how referential integrity handling differs | Verify controller parameter split and service branching |

---

## 5. Backend functions not on screen

| Function | Why absent |
|---|---|
| Project member add, role change, remove | Requirements S1-16, S1-17. Organization project management handled at organization level in S11 |
| Organization-only project create path | Screen uses single create path with organization select |

---

## 6. Maintenance handoff

1. **When adding tabs, update three places** (03 section 8-1): condition to draw, display order calculation, tab-specific body.
2. **Permission tables in two places**: 01 section 5.1 (functional axis) and 02 section 5 (area axis). Change judgment in `00_전체_업무프로세스.md` section 5 first, then align both tables.
3. **Keep member cache key per-organization** (03 section 8-3). Reverting to per-project multiplies requests by card count.
4. **Do not revert system role allowlist in `hasProjectCreationAccess`** (03 section 8-7). Regression exists where non-existent `"USER"` value blocks normal users.
5. **Handle 5 corrections together** (C-1~C-2) when working on screen. All are non-behavioral fixes.
6. **Fix manual section 17-9 member invitation description after V-S1-2 verification.** If no form on screen, manual is ahead of implementation.
