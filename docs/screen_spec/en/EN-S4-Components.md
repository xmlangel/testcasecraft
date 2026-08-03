# Test Cases(S4) Components

> Screen ID **S4** · Parent: [`EN-S4-Screen.md`](EN-S4-Screen.md)

---

## 1. Component List

### 1.1 Left Tree Area (A, B, C)

| Element | Type | Role |
|-----|------|------|
| Toolbar | Button group | `[Folders Only]`, `[All]`, `[Search]` toggle |
| Filter input | Text field | Search case/folder name (substring match) |
| Tree body | Recursive tree | Folder · case nodes (collapse/expand) |
| Virtual nodes | System folders | "All Cases", "Uncategorized" |
| Context menu | Popup menu | Right-click for delete/move/copy |
| Dialogs | Modals | New case, new folder, move, copy |

### 1.2 Right Details Area (E, F, H)

| Element | Type | Role |
|-----|------|------|
| Breadcrumb | Text | Project > Folder > Case |
| Toolbar | Button group | `[+ Case]`, `[Edit]`, `[Delete]`, `[Copy]`, `[Move]`, `[Export]`, `[⋮]` |
| Tabs | Tab group | Details, Attachments, Execution history, Version history |
| Details tab | Form | Metadata · basic info · steps · description · field toggle (gear icon right) |
| Attachments tab | File manager | File upload · download · delete |
| Execution history tab | Timeline table | Execution results |
| Version history tab | Version manager | Change history and restore |

### 1.3 Input Mode (I)

| Mode | Display | Purpose |
|-----|------|------|
| Form mode | Vertical form layout | Precise editing |
| Spreadsheet mode | Horizontal table layout | Quick multi-editing |

---

## 2. Display Specification

### 2.1 Tree Node Appearance

| Element | Default state | Selected state | Hover state |
|-----|---------|---------|---------|
| Folder | Closed icon | Highlighted background | Light highlight background |
| Case | Display ID + name | Highlighted background | Light highlight background |
| DnD handle | Hidden | Shown (draggable) | Shown |

### 2.2 Field Visibility Toggle

- Location: Click gear icon in right header
- Selectable fields: Description, pre-condition, post-condition, automated, execution type, test technique, priority, tags, RAG document link
- Default: All shown
- State save: Browser storage (per-project)

### 2.3 Validation Error Display

- Per-field error: Red text below input field
- Cannot save: Save button disabled (while errors exist)

---

## 3. Interaction Specification

### 3.1 Tree Operations

| Operation | Effect | Timing |
|-----|------|--------|
| Fold/unfold folder | Show/hide child items | Immediate |
| Double-click case | Load in right details area | Immediate |
| Right-click | Display context menu | Immediate |
| Drag (DnD) | Move item (reorder within folder) | Immediate on drop |
| Toggle `[Search]` | Show/hide filter input field | Immediate |
| Filter input | Show matching items only | Real-time while typing |

### 3.2 Field Editing (Form mode)

| Field | Input type | Constraint | Autosave |
|-----|---------|------|---------|
| Name | Text | 1~255 chars, required | 1.5s debounce |
| Description | Markdown editor | Optional | 1.5s debounce |
| Steps | Table | Add/delete possible | 1.5s debounce |
| Pre-condition | Markdown | Optional | 1.5s debounce |
| Post-condition | Markdown | Optional | 1.5s debounce |

### 3.3 Version Management

| Action | Trigger | Effect |
|-----|--------|------|
| `[Create Version]` click | Dialog shown | Save label input |
| Version restore | Select in history tab | Show that version content |

### 3.4 Attachment File Management

| Action | Timing | Note |
|-----|--------|------|
| File upload | Immediate after file select (or manual upload) | Check size limit |
| File download | Click filename | Goes to browser download folder |
| File delete | Click delete icon → confirm | Immediate effect |

---

## 4. State Transitions

| Situation | Screen state |
|-----|---------|
| No case selected | Right area shows empty state |
| Folder selected | Right area shows no display (tabs hidden) |
| Case loading | Loading indicator shown |
| Case load complete | All tabs shown |
| Saving | Save button shows loading |
| Save complete | Save button restored + success notification |
| Save error | Alert with error message |
| Delete confirm | Dialog shown |

### Conditional Rendering

- **Tab hide**: Attachments/Execution history/Version history tabs hidden when folder selected
- **Field toggle**: Fields with visibility false are hidden
- **Menu items**: Menu filtered by permission

---

## 5. Settings Save Location

| Setting | Save location | Scope | Duration |
|-----|---------|------|---------|
| Field toggle state | Browser storage | Per-project | Until explicit delete |
| Input mode choice | Session (memory) | This session only | Cleared on refresh |
| AI autogeneration | Server (user preference) | All devices shared | Server save |
| Tree collapse state | Session + browser storage | Per-project | Restored on refresh |

---

## 6. Server-Client Information Exchange

### 6.1 Case List Retrieval

**Path**: `GET /api/testcases/project/{projectId}`

**When**: Auto-retrieved on project select

**Response**: All test cases for project (including folder structure)

### 6.2 Case Details Retrieval

**Path**: `GET /api/testcases/{testCaseId}`

**When**: Double-click case in tree

**Response**: Full case content (metadata, steps, attachment list)

### 6.3 Case Create/Update/Delete

| Action | Path | Timing |
|-----|------|------|
| Create | `POST /api/testcases` | Save new case |
| Update | `PUT /api/testcases/{id}` | Save button click or autosave |
| Delete | `DELETE /api/testcases/{id}` | Delete confirmation |
| Move | `POST /api/testcases/batch/move` | Context menu, dialog |
| Copy | `POST /api/testcases/batch/copy` | Context menu, dialog |

### 6.4 Version and AI

| Feature | Path | Timing |
|-----|------|------|
| Create version | `POST /api/testcase-versions` | Save in version dialog |
| AI meta generation | `POST /api/testcases/ai/generate-meta` | When AI autogeneration enabled |
| Tag list | `GET /api/testcases/projects/{id}/tags` | When tag field focused |

### 6.5 Attachments

| Action | Path | Timing |
|-----|------|------|
| Upload | `POST /api/testcases/{id}/attachments` | After file select or manual upload |
| Download | `GET /api/attachments/{attId}/download` | Click filename |
| Delete | `DELETE /api/attachments/{attId}` | Click delete icon |

---

## 7. Responsive Specification

- **Width ≥ 768px**: Left tree + right details (2-column)
- **Width < 768px**: Stack or tab switching
- **Minimum width**: 320px (mobile)

---

## 8. Maintenance Notes

| Item | Note |
|-----|--------|
| **Tree state key** | `testcase-tree-view-mode` browser storage key is currently shared across all projects → needs per-project separation |
| **Autosave debounce** | 1.5s fixed. Can be changed for user preference adjustment |
| **Field toggle list** | 9 fields default display. When adding new field, specify default value |
| **Permission validation** | Disable or hide buttons when no permission |
| **Folder move constraint** | System folders (Uncategorized, Automated) cannot be moved/deleted |
| **Memory efficiency** | 1000+ cases require virtualization implementation |
