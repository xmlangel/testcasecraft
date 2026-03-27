# Release Note - v1.0.50

## [1.0.50] - 2026-03-25

### Main Changes

#### 🐞 Bug Fixes

- **Enhanced Test Case Tree UI Stability**:
  - Restored item selection functionality, fixing integration issues with the detail form that occurred after the virtualization update.
  - Fixed layout overlaps and rendering glitches when adding folders or test cases to the tree.
  - Resolved runtime errors caused by undefined handlers and missing library references within the tree component.
- **Improved JIRA Status Indicator**: Promptly fixed a `ReferenceError` in the `JiraStatusIndicator` component caused by an uninitialized variable reference.
- **Resolved MUI Tooltip Console Warnings**: Eliminated `Material-UI` console warning messages triggered when using disabled buttons or improper children within a `Tooltip` by implementing layout wrappers (`<span>`).
- **Strengthened Data Protection on Settings Save**: Modified the saving logic to prevent existing API keys from being overwritten by empty values and inadvertently deleted when updating application settings.
