# Test Results(S7) Components

> Screen ID **S7** · Parent document: [`EN-S7-Screen.md`](EN-S7-Screen.md)

---

## 1. Component List

| Screen area | Element | Type | Role |
|---|---|---|---|
| **Common** | 2 tabs | Tab | Switch between statistics dashboard and detail table |
| | Filter panel | Filter set | Filter by period, test plan, assignee, result status |
| | Reset button | Button | Restore all filters to initial state |
| | Export dropdown | Button+menu | Download Excel / PDF / CSV |
| **Tab 0: Statistics Dashboard** | Pass rate card | Statistics card | Display overall pass rate (%) |
| | Result distribution shape chart | Chart | Visualize PASS / FAIL / BLOCKED / NOTRUN ratio |
| | Execution trend line graph | Chart | Trend of test execution count by date |
| | Folder statistics | Table | Aggregate results by module/folder |
| **Tab 1: Detail Table** | Data table | Table | Case name, status, assignee, execution time with sort and filter |
| | Virtualization scroll | UI pattern | Smooth scrolling with thousands of records |
| | Pagination | Navigation | Default 50 per page, adjustable page size |
| **QA Summary** | Markdown editor | Editor | Record summary/analysis after execution completion (max 10,000 chars) |
| | Metadata | Read-only | Display author and modification time |
| | Save button | Button | Save QA summary |

---

## 2. Display Specifications

### 2.1 Pass Rate Card

- Number: 85.5% (one decimal place)
- Subtitle: `(21/24)` is pass count and total count
- Color: Green ≥85%, yellow 70~84%, red <70%

### 2.2 Result Distribution Donut Chart

| Status | Color | Description |
|---|---|---|
| PASS | Green | Pass |
| FAIL | Red | Fail |
| BLOCKED | Orange | Blocked |
| NOTRUN | Grey | Not run |

Display count and percentage for each segment with legend.

### 2.3 Detail Table Columns

| Column | Sort | Filter | Description |
|---|---|---|---|
| Test case name | ✓ available | — | Test case ID and title |
| Result status | ✓ available | ✓ available | PASS / FAIL / BLOCKED / NOTRUN chip |
| Assignee | ✓ available | — | Name of user who performed execution |
| Execution time | ✓ available | — | YYYY-MM-DD HH:MM format |

### 2.4 Filter Item Display

Display active filter state next to each item:
- Period: "Last 7 days" / "Last 30 days" / "All"
- Test plan: List of selected plans (e.g., "Plan A, Plan B")
- Assignee: List of selected users
- Result status: Selected statuses (e.g., "Pass, Fail")

### 2.5 Export Options

| Format | Extension | Description |
|---|---|---|
| Excel | .xlsx | Spreadsheet, choose whether to include QA summary |
| PDF(landscape) | .pdf | Dashboard screenshot included |
| PDF(portrait) | .pdf | Detail table vertical output |
| CSV | .csv | Raw data download |

---

## 3. Interaction Specifications

| User action | Result | Timing |
|---|---|---|
| Click "Statistics Dashboard" tab | Load and display dashboard | Approx 1~2 seconds |
| Click "Details Table" tab | Load and display table | Approx 1~2 seconds |
| Change filter item | Immediately apply filter, re-query data | Approx 0.5 seconds (debounced) |
| Click reset button | Restore all filters to defaults | Immediate |
| Change period filter | Display data only within selected period range | Approx 1 second |
| Click table column to sort | Sort ascending by selected column (re-click for descending) | Immediate |
| Change table page | Load and display selected page data | Approx 0.5 seconds |
| Click export button | Display format selection menu | Immediate |
| Select export format | Start file download | Approx 3~5 seconds (varies by data size) |
| Enter QA summary | Reflect local changes | Immediate |
| Save QA summary | Save to server and update metadata (modification time) | Approx 1 second |

---

## 4. State Transitions

| State | Condition | Screen display |
|---|---|---|
| **Loading** | Initial entry, tab change, filter change | Skeleton or loading spinner |
| **Normal** | Data load complete | Display statistics and table |
| **Empty** | Filter result 0 records | "No matching results" message |
| **Error** | API response failure | "Query failed. Retry" button displayed |

---

## 5. Where Settings Are Saved

| Item | Save location | Synchronization | Description |
|---|---|---|---|
| **Filter selection** | Browser local storage | Not synchronized | Recovered on screen re-entry |
| **Tab selection** | Browser local storage | Not synchronized | Recovered on page refresh |
| **Table sort** | Not saved | — | Revert to default sort on page refresh |
| **Statistics data** | Server DB | All devices synchronized | Real-time query |
| **QA summary** | Server DB | All devices synchronized | Reflect immediately after save |

---

## 6. Information Exchanged with Server

### 6.1 Statistics and Detail Results Query

**GET** `/api/test-results` (on screen entry and filter change)

Query conditions: period, test plan, assignee, result status

### 6.2 QA Summary Query

**GET** `/api/executions/{executionId}/qa-summary` (on execution selection)

### 6.3 QA Summary Save

**PUT** `/api/executions/{executionId}/qa-summary` (after save button click)

Maximum characters: 10,000

### 6.4 Export

**POST** `/api/test-results/export`

Supported formats: Excel(XLSX) / PDF / CSV

Download timing: Right after user selects format

---

## 7. Responsive and Accessibility Specifications

### 7.1 Layout by Screen Size

| Device | Width | Dashboard | Table | Charts |
|---|---|---|---|---|
| **Mobile** | < 480px | Filter + cards vertical | 1 column | Vertical |
| **Tablet** | 480~960px | Filter + cards 2 columns | 2 columns | 2 columns |
| **Desktop** | ≥ 960px | Filter + cards 3 columns | Full width | 3 columns |

### 7.2 Accessibility

- **Keyboard navigation**: Tab key to access tabs, filters, buttons
- **Signal beyond color**: Chart legend, table icons for status recognition
- **Text contrast**: Meet WCAG AA standard
- **Form labels**: Clear labels for all input fields

---

## 8. Permission-based Screen Display

| Role | Change filter | Export | QA summary write |
|---|---|---|---|
| **PROJECT_MANAGER** | ✓ | ✓ | ✓ |
| **LEAD_DEVELOPER** | ✓ | ✓ | ✓ |
| **DEVELOPER** | ✓ | ✓ | ✓ |
| **TESTER** | ✓ | ✓ | ✓ |
| **VIEWER** | ✓ | — | — |

VIEWER permission: Query only, no export or QA summary editing

---

## 9. Maintenance Precautions

### 9.1 When Adding API Response Fields

Add new column to table:
1. Add column definition to data table `columns` array
2. Set sort availability (`sortable: true/false`)
3. Add data validation in E2E test

### 9.2 When Adding Filter

Add new filter:
1. Add filter element to `StatisticsFilterPanel`
2. Add browser storage key (for default save)
3. Add new condition to API query parameters

### 9.3 When Changing Export Format

Modify export option:
1. Verify backend `TestResultReportService`
2. Synchronize frontend dropdown menu
3. Verify filename rule for each format

### 9.4 When Changing QA Summary Character Limit

10,000 character limit is backend configuration.

**Before changing:** Verify backend setting then synchronize frontend UI message
