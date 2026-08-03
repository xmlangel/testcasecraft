# Test Cases(S4) Workflow

> Screen ID **S4** · Screen: **tree · folder case list · individual form · spreadsheet**
> Routes: `/projects/{projectId}/testcases` · `/projects/{projectId}/testcases/{testCaseId}`

---

## 1. Business Purpose

A project's test assets are organized as a test case (TC) tree. S4 is the workspace where users view this tree, create and edit cases, structure folders, attach files, and track execution history. Once a case is written, it is referenced by test plans across multiple projects, so modifications, deletions, and moves are subject to strict permission and impact checks.

| Purpose | Content |
|---|---|
| ① **Case search and retrieval** | View the folder tree or all cases list; search by case name (substring match) |
| ② **Case creation** | Create cases via new form mode or inline entry. Optional AI-assisted generation |
| ③ **Case editing** | Toggle field visibility, enter field values, create versions |
| ④ **Tree restructuring** | Move folders/cases via drag-and-drop, or transfer to another project |
| ⑤ **Case lifecycle** | Copy, move, delete, version, view, attach, manage, track execution history |

**Out of scope for this screen**

| Out of scope | Owned by |
|---|---|
| Test plan organization | S5 Test Plans |
| Case execution result entry | S6 Execution |
| Case analysis and statistics | S7 Analysis |
| Automated test script management | S8 Automated Tests |

---

## 2. Screen Location

| Item | Content |
|---|---|
| Previous | S1 project selection → S2 workspace |
| Next | S6 execution (`/projects/{projectId}/testresults`), S7 analysis (`/projects/{projectId}/analysis`) |
| Entry condition | Project edit permission (EDITOR or above). VIEWER can read only. Anonymous users cannot enter |
| Always accessible | `[Test Cases]` item in the area navigation |

**Dynamic entry:** Selecting a different project in the header's project dropdown reloads the same S4 screen with a different `projectId`.

---

## 3. Business Process Flow

### 3.1 Tree View and Folder Structure

A project starts with three system-created folders (`Uncategorized`, `Automated Test Case`, `Manual Test Case`), and users can add custom folders.

| # | Action | Operation | Result |
|---|---|---|---|
| 1 | Enter `/projects/{projectId}/testcases` | Load all TC tree for the project | — |
| 2 | **Toggle view mode** | Switch tree mode with `[Folders Only]` or `[All]` button | Selection is saved to browser storage |
| 3 | Folders-only mode | Display folder nodes only. Number on right indicates child case count (all included) | — |
| 4 | All mode | Display folders and all cases within them together | — |
| 5 | Selectable mode | Used only when selecting cases from test plans (S5). Always forced to all mode | — |

### 3.2 Test Case Creation

#### New Form Mode
| # | Action | Operation |
|---|---|---|
| 1 | Right-click folder in tree → `[Add Case]` or `[+]` button | New form dialog (all fields displayed) |
| 2 | Enter display ID (auto), name, description, tags, priority, type, steps (table format) | Fields autosave (no automatic version creation) |
| 3 | Click `[Save]` | Call `POST /api/testcases` endpoint |
| 4 | Success | Tree refreshed. New case marked with icon |

#### Inline Creation
| # | Action | Operation |
|---|---|---|
| 1 | Press `[Add Inline]` or Enter in empty folder of tree | Inline input field (name only) |
| 2 | Enter name and press Enter | Create case with minimal fields |
| 3 | Edit popup opens automatically | Fill remaining fields |

#### AI Assisted Generation (Optional)
| # | Action | Operation |
|---|---|---|
| 1 | Click `[Generate with AI]` button in new form | Auto-generate steps and expected results from summary or title |
| 2 | Generation result | Auto-inserted into form; user can edit |

### 3.3 Test Case Editing

| # | Action | Operation |
|---|---|---|
| 1 | Double-click case in tree or right-click → `[Edit]` | Edit form dialog opens |
| 2 | Toggle field visibility | Select which fields to show from ~50 fields. Selection saved per user |
| 3 | Enter field values | Edit name, description, steps table, expected result, tags, etc. Autosave |
| 4 | `[Save]` or autosave | `PUT /api/testcases/{id}` |
| 5 | Create version (optional) | Explicitly record meaningful changes with version number (#1, #2, ...) |

**Spreadsheet mode:** Multiple cases can be edited in bulk via table format, but the default mode for this screen is form mode (see S4 detailed documentation).

### 3.4 Tree Restructuring (DnD)

Within same project:
| # | Action | Operation | Reaction |
|---|---|---|---|
| 1 | Drag case/folder | Start drag via mouse or touch | DragOverlay displayed |
| 2 | Drop on target folder | Target folder is highlighted (hover) | — |
| 3 | Execute drop | Call `POST /api/testcases/{id}/move`. Update parentId and displayOrder | Tree immediately refreshed |
| 4 | Validation fail | System folder returns 400 Bad Request. No permission returns 403 Forbidden | Dialog shows error |
| 5 | Batch move | Check multiple cases, then `[Move selected to folder]` | `POST /api/testcases/move-batch` |

To different project:
| # | Action | Operation |
|---|---|---|
| 1 | Right-click case in tree → `[Move to different project]` | Target project selection dialog |
| 2 | Select target project | Current project excluded |
| 3 | Execute `[Move]` | Call `POST /api/testcases/cross-project/move`. Move test results together as mirror execution |
| 4 | Permission check | Source read (VIEWER or above) + target edit (EDITOR or above) required |
| 5 | Copy (results not included) | Call `POST /api/testcases/cross-project/copy` |

**DnD block rules:** System folders (`Uncategorized`, `Automated Test Case`, `Manual Test Case`) cannot be moved or deleted. Cases under them can be moved, but folders are preserved (see manual section 4-4).

### 3.5 Version, Attachment, Execution History Management

| # | Item | Operation |
|---|---|---|
| 1 | **Version tab** | Click `[v1.0]`, `[v1.1]`,... links to view snapshot of that version |
| 2 | Create version | Click `[Save Version]` button to explicitly record current state. Format `{major}.{minor}` |
| 3 | **Attachment tab** | Upload screenshots, documents, code, files |
| 4 | View attachment | `GET /api/testcases/{id}/attachments/{attachmentId}/download` |
| 5 | **Execution history tab** | View all test execution results for this case (5 most recent) |

---

## 4. Case Model Rules

| # | Rule | Content | Reference |
|---|---|---|---|
| M1 | **Display ID immutable (auto)** | Project code + sequence number (e.g., `SMP-001`). Cannot be changed after creation | Manual section 5-1 |
| M2 | **System folders protected (3)** | `Uncategorized`, `Automated Test Case`, `Manual Test Case` folders cannot be moved or deleted | `TestCaseTreeMoveService` validation |
| M3 | **Folder and case levels separated** | Folder under folder, case under folder. Order changeable within same parent | Tree model |
| M4 | **Version explicit snapshot** | Autosave is draft; only `[Save Version]` enters history | (v1.6.1 policy) |
| M5 | **Tags inheritable** | Child folders can automatically inherit parent folder tags | `TestCaseFormUtils.getCommonInheritedTags` |
| M6 | **Cascade delete** | Deleting a folder deletes all cases, versions, attachments underneath | `TestCaseService.deleteTestCase` |
| M7 | **Cross-project reference explicit** | Test plans (S5) can reference cases from other projects; reference is cleared on deletion | Manual section 6-2 |

---

## 5. Users and Permissions

Functionality varies by project role (`ProjectRole`). System role (`SystemRole`) is not considered.

| Feature | VIEWER | EDITOR | PROJECT_MANAGER |
|---|---|---|---|
| View case | ✅ | ✅ | ✅ |
| Create case | ❌ | ✅ | ✅ |
| Edit case (name, fields) | ❌ | ✅ | ✅ |
| Delete case | ❌ | ❌ | ✅ |
| Create case version | ❌ | ✅ | ✅ |
| Copy case | ❌ | ✅ | ✅ |
| Move case (same-project DnD) | ❌ | ✅ | ✅ |
| Move case (cross-project) | ❌ | ❌ | ✅ |
| Copy case (cross-project) | ❌ | ✅ | ✅ |
| Upload attachment | ❌ | ✅ | ✅ |
| Delete attachment | ❌ | ❌ | ✅ |
| Create folder | ❌ | ✅ | ✅ |
| Edit folder (name, description) | ❌ | ✅ | ✅ |
| Delete folder (user-created) | ❌ | ❌ | ✅ |
| Move folder (DnD) | ❌ | ✅ | ✅ |
| Toggle field visibility (personal setting) | ✅ | ✅ | ✅ |
| View execution history | ✅ | ✅ | ✅ |

**Permission check:** Front-end retrieves current role via `useProjectRole(projectId, user)`; backend re-validates via `ProjectSecurityService.canAccessTestCase` etc.

---

## 6. Feature Rules

| # | Rule | Content | Reference |
|---|---|---|---|
| F1 | **Tree filter is substring match** | When text entered in search field, display cases whose name contains the text and their ancestors (parents) | (filterText) |
| F2 | **Selection limited to filter scope** | When search narrows results, check/selection targets are restricted to filtered items only (ICT-431) | |
| F3 | **Folder count includes all descendants** | Number on folder right is sum of all cases below it (including cases in subfolders) | `buildFolderCaseCountMap` utility |
| F4 | **Virtual node (folders-only mode)** | "Unfiled" node in folders-only mode collects cases not belonging to any folder | `VIRTUAL_UNFILED_ID` constant |
| F5 | **DnD order: before or after next case** | Specify either beforeId or afterId to set order. If both null, append to end of children | `TestCaseMoveRequest` DTO |
| F6 | **Batch move to same parent** | `/move-batch` endpoint moves all selected cases to the same parent folder; order follows selection order | `TestCaseMoveBatchRequest` |
| F7 | **System folder entry forbidden** | Selecting system folder (`Uncategorized` etc) as parentId returns 400 Bad Request | `SystemFolderProtectedException` |
| F8 | **Version change detection** | When fields change, autosave activates and `[Save Version]` button enables | Autosave hook |
| F9 | **Attachment size limit** | Max 100MB per file (HTTP multipart config; see API documentation) | Server config |
| F10 | **Previous version restore blocked** | Can only view previous versions; cannot revert to them. Must edit and save as new version | VersionHistory component (read-only) |

---

## 7. Integration with Other Screens

| Target | Integration | Reference |
|---|---|---|
| **S5 Test Plans** | Plans reference cases. Connection is released when plan iteration deleted | Manual section 6 |
| **S6 Execution** | Case `[Execution History]` tab displays all results for this case | TestCaseExecutionHistory |
| **S7 Analysis** | Per-case and per-folder pass/fail/block statistics aggregated | S7 documentation |
| **S11 Administrator** | Organization-wide or all-project case statistics and example generation | Manual section 17 |

---

## 8. Prerequisites and Constraints

| Item | Content | Reference |
|---|---|---|
| **Project exists** | This screen requires project ID in path. Otherwise redirects to S1 | |
| **Folder write permission** | Creating new folder requires EDITOR or above permission | Permission rules |
| **API response time** | Tree load takes 0.5~2 seconds depending on case count per project. Search filtering <100ms (front-end memory-based) | `testCaseService.getProjectTestCases` |
| **Concurrency** | When two users edit same case simultaneously, last save wins (no conflict prevention logic) | — |
| **Migration** | Cases from earlier versions (pre-v1.0) default to `Uncategorized` folder | Manual section 20 |

---

## 9. Requirement Mapping

How screen feature rules map to overall requirement documentation (`04_Requirement_Detail.md`).

| Screen Feature | Requirement Ref | Requirement Title |
|---|---|---|
| Tree view, search | REQ-TC-101 | Test case list retrieval and filtering |
| Create new case | REQ-TC-201 | Test case creation |
| Edit case | REQ-TC-202 | Test case modification |
| Delete case | REQ-TC-203 | Test case deletion |
| Folder structure | REQ-TC-301 | Folder hierarchy |
| DnD move | REQ-TC-302 | Drag-and-drop restructuring |
| Cross-project move/copy | REQ-TC-303 | Cross-project transfer |
| Version management | REQ-TC-401 | Test case version management |
| Attachment management | REQ-TC-402 | Attachment file management |
| Execution history | REQ-TC-403 | Execution result linked query |
| Permission control | REQ-SEC-102 | Project role-based access control |
