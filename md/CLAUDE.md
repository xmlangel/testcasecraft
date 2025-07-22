# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm start` - Run development server (opens http://localhost:3000)
- `npm run build` - Build production version
- `npm test` - Run tests in interactive watch mode

### Project Structure
This is a React-based test case management application using local storage for data persistence. The current structure appears to be in a transition state with both active files in `backup/src/` and reference files throughout the repository.

## Application Architecture

### High-Level Structure
- **Test Case Management**: Tree-based folder/test case organization with drag-and-drop support
- **Test Plan Management**: Create test plans by selecting multiple test cases  
- **Test Execution Management**: Execute test plans and record results (PASS/FAIL/BLOCKED/NOTRUN)

### Key Components Location
The main application files are currently in `backup/src/`:
- `backup/src/index.jsx` - Application entry point with AppProvider
- `backup/src/components/` - All React components
- `backup/src/context/AppContext.jsx` - Global state management with Context API + useReducer
- `backup/src/models/` - Data model definitions
- `backup/src/utils/` - Utility functions for tree operations

### Main Components
- **TestCaseTree.js** - Tree view for folders/test cases with context menu operations
- **TestCaseForm.js** - Test case details/editing with step management
- **TestPlanList.js & TestPlanForm.js** - Test plan CRUD operations
- **TestExecutionList.js & TestExecutionForm.js** - Test execution management
- **TestResultForm.js** - Test result entry and tracking
- **ProjectManager.js** - Project management with role-based permissions

### State Management
- Uses React Context API with useReducer for global state
- Data persisted to localStorage for persistence across sessions
- Main contexts: projects, test cases, test plans, test executions

### UI Framework
- Material UI (MUI) for components and theming
- MUI Icons for iconography
- MUI X TreeView for hierarchical data display
- react-beautiful-dnd for drag-and-drop functionality
- Responsive grid layout using MUI Grid system

### Data Models
- **Test Cases**: Hierarchical structure with folders and test cases, each with steps and expected results
- **Test Plans**: Collections of selected test cases for execution
- **Test Executions**: Instances of test plan execution with progress tracking and results
- **Projects**: Top-level organization with role-based access control

### Role-Based Permissions
The application implements role-based access:
- **ADMIN/MANAGER**: Can create/edit/delete projects and all content
- **USER**: Read-only access to projects, can execute tests and record results

## Development Notes

### File Organization
- Working source code is in `backup/src/` directory
- Reference documentation in Korean is available in numbered markdown files (01_전체_구조_요약.md, etc.)
- Source code backups are in `source/` directory as .txt files

### Testing Strategy
- React Testing Library for component testing
- Test files follow the pattern of component testing with unit tests for individual functions
- Focus on testing user interactions, state changes, and component rendering

### Code Style
- Uses JSX for React components
- PropTypes for type checking
- ES6+ features including destructuring, async/await, and arrow functions
- Material UI theming and styling patterns

## Important Implementation Details

### Data Storage
- All data is stored in localStorage with JSON serialization
- No backend API calls - this is a frontend-only application
- Data models include built-in validation and default values

### Tree Operations
- Tree utilities in `utils/treeUtils.js` handle hierarchical data operations
- Supports deep nesting of folders and test cases
- Drag-and-drop reordering with react-beautiful-dnd

### Execution Flow
1. Create test cases in hierarchical folders
2. Create test plans by selecting test cases
3. Start test execution from test plans
4. Record results for each test case (PASS/FAIL/BLOCKED/NOTRUN)
5. Track progress and completion status

### Key Features
- Context menu operations for tree management
- Real-time progress tracking during test execution
- Role-based UI rendering based on user permissions
- Responsive design for various screen sizes
- Korean language UI with internationalization support