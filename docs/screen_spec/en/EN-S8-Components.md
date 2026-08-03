# Automated Tests(S8) Components

> Screen ID **S8** · Parent: [`02`](EN-S8-Screen.md)

---

## 1. Component List

| Screen area | Element | Type | Role |
|---|---|---|---|
| **List screen** | Upload button | Button | Start JUnit XML file upload |
| | Statistics section | Card group | Display total test, pass, fail, error, skip counts |
| | Pass rate progress bar | Graph | Visualize overall pass rate (%) |
| | Result chart | Pie chart | PASS/FAIL/ERROR/SKIPPED distribution |
| | Date filter | Tabs | Select 7 days/30 days/90 days/all |
| | Search input | Text field | Search by filename |
| | Status filter tabs | Tabs | Filter by all/pass/fail/skip |
| | Result list table | Table | Display result for each XML file |
| | Detail link | Link | Click filename → enter detail screen |
| | Pagination | Navigation | 20 items per page default |
| | ⋮ menu | Button+menu | Options: detail, download, delete |
| | Large file progress dialog | Dialog | Display large file (≥50MB) processing status |
| **Detail screen** | Back button | Button | Return to list |
| | Filename header | Title | Name of current JUnit file |
| | ⋮ menu | Button+menu | Options: download, delete |
| | Statistics cards | Card group | PASS/FAIL/ERROR/SKIPPED counts and percentages |
| | Suite selection tabs | Tabs | Select by test class (default: all) |
| | Case table | Table | List each test case |
| | Search, filter, pagination | Filter+navigation | Search by case name, filter by status |
| | Right detail panel | Panel | Full error message and stack trace for selected case |
| | Edit button | Button | Enter edit mode for status, priority, notes |
| | Edit fields | Input fields | Select status, select priority, enter notes |
| | Save/Cancel buttons | Button | Save edit or discard |
| | Bottom collapsible section | Toggle section | List failed cases and longest-running cases |

---

## 2. Display Specification

### 2.1 JUnit Result Status

| Status | Chip color | Icon |
|---|---|---|
| **PASS** | Green | ✓ |
| **FAIL** | Red | ✗ |
| **ERROR** | Orange | ⚠ |
| **SKIPPED** | Gray | ⊘ |
| **PROCESSING** | Blue | ⟳ (loading indicator) |

### 2.2 Statistics Card Display

Each card shows:
- Status name (example: "Pass")
- Count (example: "125")
- Percentage (example: "94.2%")

### 2.3 Success Rate Progress Bar

- Length: 85.5% (one decimal place)
- Color: ≥95% bright green, 80–94% green, 70–79% yellow, <70% orange

### 2.4 Table Column Display

**List screen (result table)**
- Filename: XML file name (link)
- Execution name: Name specified on upload (empty if none)
- Total test count: Number
- Pass/Fail/Error/Skip: Count for each status
- Success rate: Progress bar + percentage number
- Upload time: YYYY-MM-DD HH:MM format

**Detail screen (case table)**
- Case name: Test method name
- Status: PASS/FAIL/ERROR/SKIPPED chip
- Execution time: In seconds (example: "2.34s")
- Error message: Abbreviated (full shown in right panel)

---

## 3. Interaction Specification

| User action | Result | Timing |
|---|---|---|
| **List screen** | | |
| Click upload button | Open file selection dialog | Immediate |
| Select XML file | Display filename | Immediate |
| Click upload confirm button | Start upload (< 50MB: sync, ≥ 50MB: async) | Immediate |
| Select date filter (7d/30d/90d) | Show data for that date range only | ~1 second |
| Enter search text | Filter results by filename | ~0.5 seconds (debounce) |
| Click status tab | Show results for that status only | Immediate |
| Click filename | Enter detail screen | ~1 second |
| ⋮ menu > download | Download original XML file | ~1 second |
| ⋮ menu > delete | Show result delete confirmation dialog | Immediate |
| Change page | Load next/previous page data | ~0.5 seconds |
| **Detail screen** | | |
| Click back | Return to list screen | Immediate |
| Select suite tab | Show cases for selected class only | ~0.5 seconds |
| Click case row | Show detail info and error message in right panel | Immediate |
| Enter case search text | Filter by case name | ~0.5 seconds (debounce) |
| Select status filter | Show only cases with that status | Immediate |
| Click edit button | Case status, priority, notes fields become editable | Immediate |
| Save edit | Save to server, exit edit mode | ~1 second |
| Expand bottom collapsible section | Show failed cases / longest-running cases list | Immediate |

**Large file (≥ 50MB) processing**: After upload, progress status updates in dialog **approximately every 2 seconds**. Dialog auto-closes and list refreshes after processing completes.

---

## 4. State Transition

| State | Condition | Screen display |
|---|---|---|
| **Loading** | Initial entry, filter change, page change | Skeleton or loading spinner |
| **Normal** | Data loaded | Statistics and table displayed |
| **Uploading** | After file selection, upload starts | Progress percentage (0–100%) |
| **Processing (large file)** | Large file (≥50MB) upload completed | "Processing..." dialog + progress status |
| **Empty** | Filter result 0 items | "No results" message |
| **Error** | Upload failure, query failure | "Error message" + "Retry" button |
| **Edit mode** | Case edit button clicked | Fields active, Save/Cancel buttons shown |

---

## 5. Where Settings Are Stored

| Item | Storage | Sync | Description |
|---|---|---|---|
| **Date filter** | Browser storage | Not synced | Recovered when screen re-entered |
| **Status filter** | Browser storage | Not synced | Recovered on page refresh |
| **Collapsible section expanded state** | Browser storage | Not synced | Remember bottom section expand/collapse |
| **JUnit file data** | Server DB | All devices | Other users can also view |
| **Case edit (status, priority, notes)** | Server DB | All devices | Reflected immediately after save |

---

## 6. Server Communication

### 6.1 JUnit XML File Upload

**POST** `/api/junit-results/upload` (after file selection and upload confirmation)

File size:
- < 50MB: Sync processing, return result immediately
- ≥ 50MB: Async processing, track status by polling

### 6.2 List View

**GET** `/api/junit-results/projects/{projectId}` (on screen entry and filter change)

Query conditions: date range, status filter

### 6.3 Detail View

**GET** `/api/junit-results/{testResultId}` (on filename click)

Includes: filename, execution name, statistics, test suite list

### 6.4 Suite-Specific Case View

**GET** `/api/junit-results/suites/{suiteId}/cases` (on suite tab selection)

Query conditions: status filter, pagination

### 6.5 Case Editing

**PUT** `/api/junit-results/cases/{testCaseId}` (on save button click)

Saved content: status, priority, notes

### 6.6 Delete

**DELETE** `/api/junit-results/{testResultId}` (on delete selection and confirmation from menu)

---

## 7. Responsive and Accessibility Specification

### 7.1 Layout by Screen Size

| Device | Width | Statistics | Table | Width |
|---|---|---|---|---|
| **Mobile** | < 480px | Cards vertical | 1 column (horizontal scroll) | Full width |
| **Tablet** | 480–960px | Cards 2 columns | 2–3 columns | Full width |
| **Desktop** | ≥ 960px | Cards 3–4 columns | 4+ columns | Full width |

### 7.2 Accessibility

- **Keyboard navigation**: Tab key accesses buttons, tabs, input fields
- **Color plus signal**: Status icons (✓·✗·⚠) used alongside color
- **Text contrast**: WCAG AA standard compliance
- **Form labels**: Clear labels on all input fields

---

## 8. Screen Display by Permission

| Role | File upload | Case edit |
|---|---|---|
| **PROJECT_MANAGER** | ✓ | ✓ |
| **LEAD_DEVELOPER** | ✓ | ✓ |
| **DEVELOPER** | ✓ | ✓ |
| **TESTER** | ✓ | ✓ |
| **VIEWER** | — | — |

VIEWER permission: View only, cannot upload or edit

---

## 9. Maintenance Notes

### 9.1 When changing file size threshold

50MB is the branch point between sync and async processing.

**Before changing**: Confirm backend setting value and synchronize with frontend upload dialog validation rules

### 9.2 When changing large file polling interval

2 seconds is the large file (≥ 50MB) processing status update interval.

**Before changing**: Consider server processing speed and network load

### 9.3 When adding status values

PASS/FAIL/ERROR/SKIPPED are JUnit XML standard status values.

**When adding custom status**:
1. Add color and icon to statusConfig object
2. Add to filter options
3. Update E2E tests

### 9.4 When adding new filter

When adding new filter:
1. Add filter UI element
2. Add browser storage key (for default value storage)
3. Add API query parameter
