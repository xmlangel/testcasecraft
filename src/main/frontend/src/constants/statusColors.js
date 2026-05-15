// CreateSpace semantic palette (aligned with docs/design/CreateSpaceDesign/Design.md light mode)
//   Primary  #E11D48   Secondary #2563EB   Tertiary #FACC15
//   Success  #16A34A   Warning   #D97706   Error    #DC2626
//   Grayscale: text #1F2937 / muted #6B7280 / subtle #9CA3AF / border #E5E7EB

export const RESULT_COLORS = {
  PASS: "#16A34A",
  FAIL: "#DC2626",
  BLOCKED: "#D97706",
  SKIPPED: "#6B7280",
  NOTRUN: "#9CA3AF",
};

export const STATUS_COLORS = {
  PASSED: "#16A34A",
  FAILED: "#DC2626",
  ERROR: "#D97706",
  SKIPPED: "#9CA3AF",
  UPLOADING: "#2563EB",
  PARSING: "#2563EB",
  COMPLETED: "#16A34A",
};

export const CHART_COLORS = [
  "#E11D48",
  "#2563EB",
  "#FACC15",
  "#16A34A",
  "#D97706",
];

// Tinted backgrounds for status chips (light surface). Mirrors jira_dashboard
// status chip styles: chip-done / chip-new / chip-indeterminate / chip-unknown.
export const STATUS_BG_COLORS = {
  PASSED: "#DCFCE7",
  FAILED: "#FEF2F2",
  ERROR: "#FEF3C7",
  SKIPPED: "#F3F4F6",
};

export const JIRA_STATUS_COLORS = {
  "To Do": "#2563EB",
  "In Progress": "#FACC15",
  Done: "#16A34A",
  Blocked: "#DC2626",
  Review: "#9333EA",
  Testing: "#D97706",
  Default: "#9CA3AF",
};
