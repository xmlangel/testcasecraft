# Test Cases(S4) Requirement Coverage

> Screen ID **S4** · Reference documents: [`EN-S4-Workflow.md`](EN-S4-Workflow.md) · [`EN-S4-Screen.md`](EN-S4-Screen.md) · [`EN-S4-Components.md`](EN-S4-Components.md)
> Baseline **v1.0.102**
> Status notation and reference rules are in [`../README.md`](../README.md) section 4.

---

## 1. Functional Requirements

| ID | Requirement | Description | Screen section / Ref | Status |
|----|----|------|-------------|------|
| S4-F01 | Case retrieval | Retrieve all cases per project (tree, table view) | Workflow 3.1 / Screen 2.2·2.3 / Components 3.2 | ✅ Working |
| S4-F02 | Tree view mode 2-type | Folders-only mode / All cases mixed mode toggle | Workflow 3.1 / Screen 2.2.B / Components 3.2 | ✅ Working |
| S4-F03 | Tree search/filter | Search by name, display ID, tags (comma compound, substring match) | Workflow 3.1 / Screen 2.2.C / Components 3.4 | ✅ Working |
| S4-F04 | Virtual nodes (2) | "All test cases" / "Cases not in folder" | Workflow section 4 / Screen 2.2.D / Components 3.2 | ✅ Working |
| S4-F05 | Case new creation (form) | Form input, field toggle, AI autogeneration | Workflow 3.2 / Screen 2.2.H / Components 3.2 | ✅ Working |
| S4-F06 | Case new creation (spreadsheet) | Add row, edit cell, bulk save | Workflow 3.2 / Screen 2.2.I / Components 3.5 | ✅ Working |
| S4-F07 | Case edit | Edit metadata, steps, attachments, version | Workflow 3.3 / Screen 2.2.H / Components 3.3·3.5 | ✅ Working |
| S4-F08 | Field visibility toggle | Show/hide 9 fields | Workflow 3.3 / Screen 2.2.H / Components 3.3 | ✅ Working |
| S4-F09 | AI autogeneration | Auto-generate name, description from steps (2s debounce) | Workflow 3.2 / Screen 2.2.H / Components 3.3 | ✅ Working |
| S4-F10 | Drag-and-drop (single) | Move case between folders, reorder | Workflow 3.4 / Screen 2.2.D / Components 3.2 | ✅ Working |
| S4-F11 | Drag-and-drop (batch) | Multi-select then bulk move | Workflow 3.4 / Screen 2.2.D / Components 3.2 | ✅ Working |
| S4-F12 | DnD block rules | Block self, descendant, case-internal, system folder | Workflow section 4 / Screen 2.2.D / Components 3.6 | ✅ Working |
| S4-F13 | Cross-project move | Move case + execution results, versions together | Workflow 3.4 / Screen 2.3 / Components 3.5 | ✅ Working |
| S4-F14 | Cross-project copy | Copy case only, execution results not included | Workflow 3.4 / Screen 2.3 / Components 3.5 | ✅ Working |
| S4-F15 | Case delete | Delete single, multiple; record audit log | Workflow 3.4 / Screen 2.2 / Components 3.5 | ✅ Working |
| S4-F16 | Folder info edit | Change folder name, description, color | Workflow 3.1 / Screen 2.2 / Components 3.2 | ✅ Working |
| S4-F17 | Folder delete | Block cascade delete, force move child cases | Workflow section 4 / Screen 2.2 / Components 3.2 | ✅ Working |
| S4-F18 | Version management | Auto-record all changes, view previous versions | Workflow 3.5 / Screen 2.2.H / Components 3.5 | ✅ Working |
| S4-F19 | Attachment file management | Upload, download, delete files (saved cases only) | Workflow 3.5 / Screen 2.2.H / Components 3.5 | ✅ Working |
| S4-F20 | Execution history | View execution count, date, result, executor (S6 integration) | Workflow 3.5 / Screen 2.2.H / Components 3.5 | ✅ Working |
| S4-F21 | Permission-based display | VIEWER/EDITOR/ADMIN button, field visibility | Workflow section 5 / Screen section 4 / Components 3.2 | ✅ Working |
| S4-F22 | Context menu (right-click) | Add, edit, delete, move, copy, sort (6 options) | Workflow 3.4 / Screen 2.2.E / Components 3.2 | ✅ Working |
| S4-F23 | Audit log | Auto-record all DnD, create, delete, edit (user, time, target) | Workflow 3.4 / Screen 2.2 / Components 3.5 | ✅ Working |

---

## 2. Non-functional Requirements

| ID | Requirement | Description | Status |
|---|---|---|---|
| S4-N01 | Response time | API response <500ms (with caching) | ✅ Working |
| S4-N02 | Concurrency | Multi-user editing avoids conflict (version conflict detection) | ✅ Working |
| S4-N03 | Large-scale handling | 3,000+ cases with no tree performance degradation | ⚠ Partial |
| S4-N04 | Accessibility | WCAG 2.1 AA compliance (keyboard navigation, screen reader) | ✅ Working |
| S4-N05 | Browser compatibility | Chrome, Firefox, Safari, Edge latest 2 versions | ✅ Working |
| S4-N06 | Multi-language support | Korean, English dynamic switch | ✅ Working |
| S4-N07 | Mobile responsive | Layout collapses/hides left nav below 768px width | ⚠ Needs verification |
| S4-N08 | SEO | Page loads without wait | ℹ Information |

---

## 3. Correction Targets

| Item | Current behavior | Correction needed | Priority |
|------|------|---------|---------|
| S4-N03 | Large-scale handling | Tree virtualization not implemented → 3,000+ item performance degradation | Medium |
| Multi-language coverage | Some warning/error messages hardcoded | All UI text to i18n keys | Medium |

---

## 4. Verification Items

| ID | Item | Verification method | Owner |
|----|------|---------|--------|
| V-S4-01 | Mobile responsive | Test layout on iPad, iPhone SE | Frontend |
| V-S4-02 | Large-scale performance | Generate 3,000 folders/cases, measure tree load time | QA |
| V-S4-03 | DnD cross-browser | Verify drag event works on Safari | QA |
| V-S4-04 | Spreadsheet row height | Verify auto-wrap for 50+ Korean char in row | Frontend |
| V-S4-05 | AI autogeneration delay | Verify 2s debounce actual behavior (Components 3.3) | Backend |

---

## 5. Backend Features Not in Screen

| Endpoint | Description | Exposed | Reason |
|----------|------|---------|------|
| `/api/testcases/ai/generate-meta` | AI meta autogeneration | ✅ Exposed | Called from form field (S4-F09) |
| `/api/testcases/{id}/move` | Single DnD move | ✅ Exposed | Called from tree (S4-F10) |
| `/api/testcases/move-batch` | Batch DnD move | ✅ Exposed | Called after multi-select (S4-F11) |
| `/api/testcases/cross-project/move` | Cross-project move | ✅ Exposed | Called from dialog (S4-F13) |
| `/api/testcases/cross-project/copy` | Cross-project copy | ✅ Exposed | Called from dialog (S4-F14) |
| `/api/testcases/batch` | Spreadsheet bulk save | ✅ Exposed | Spreadsheet mode save (S4-F06) |
| `/api/testcases/{id}/audit-log` | Audit log retrieval | ❌ Not exposed | Owned by separate screen (Audit Log S7) |

---

## 6. Maintenance Handoff

### 6.1 Known Limitations
- **Large-scale performance**: 3,000+ items cause tree render delay. Virtual rendering not implemented.
- **Concurrent editing**: Auto-conflict resolution not supported. Last-saved version maintained.
- **Mobile**: Responsive layout not verified. Tablet <768px nav collapse policy may not apply.

### 6.2 Migration Path
- v1.0.x → v1.1.0: DnD persistence migration
- v1.1.0 → v2.0.0: Tree performance optimization planned

### 6.3 Test Coverage
- Unit tests: Form validation, field toggle 9 items + tag cleanup logic on parent move
- Integration tests: Cross-project move/copy scenarios (results, versions, attachments sync)
- E2E: Pending (setup needed)

### 6.4 Dependency Recheck
- Cache: 5-min policy (update on change)
- Markdown editor: Description input supported
- File upload: 100MB max policy

---

## 7. Mapping 01~03 Sections

| Feature | Workflow (01) | Screen Definition (02) | Components (03) |
|-----|----------------|-----------|-----------|
| Retrieve | 3.1 | 2.2.A~D | 3.2, 3.4 |
| Create | 3.2 | 2.2.F~H | 3.2, 3.5 |
| Edit | 3.3 | 2.2.H | 3.3, 3.5 |
| DnD | 3.4 | 2.2.D~E | 3.2, 3.6 |
| Cross-project | 3.4 | 2.3 | 3.5 |
| Permission | 5 | 2.5 | 3.2 |
| API | — | — | 3.5 |
