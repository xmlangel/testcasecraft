# Release Notes - v1.0.39

## 🚀 Key Changes

### 📊 Enhanced JUnit XML Parsing

- **system-out Metadata Extraction**: Analyzes `[METADATA:testName:key=value]` patterns in `<system-out>` logs to automatically recover and apply test specifications (description, steps, expected/actual results).
- **Structured Step Extraction**: Automatically parses `Step` attributes (pipe-separated) and custom `<step>` tags within JUnit XML `<properties>` to generate structured test step data.
- **Universal Property Support**: Recognizes and displays all custom attributes included in the XML beyond standard JUnit properties.
- **Improved Field Mapping**: Automatically maps key attributes like `Description`, `ExpectedResult`, and `ActualResult` to system fields for better visibility.

### 🎨 Improved Test Result UI (JUnit Detail Panel)

- **Enhanced SQL/Query Formatting**: SQL queries in test steps are now separated from headers and rendered in dedicated code blocks.
- **Preserved Readability & Newlines**: Applied `white-space: pre-wrap` to ensure long SQL queries or multi-line messages are displayed in their original format.
- **Duplicate Info Removal**: Enhanced filtering logic to prevent redundant information from appearing in both the header and the 'Execution Properties' section.

## 🛠 Bug Fixes & Optimizations

- **UI Layout Refinement**: Optimized info alignment within the detail panel for better accessibility on narrower screens.
- **Pipe (|) Delimiter Support**: Added logic to split step strings separated by pipes into individual actionable steps.
