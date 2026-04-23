# Release Note - v1.0.71

## [1.0.71] - 2026-04-23

Hello! In this 1.0.71 update, we focused on **significantly enhancing the stability of test management** and **resolving fine bugs that hindered the user experience**. The system has become more robust and smoother to use.

### Key Changes

#### 🛠️ Enhanced Test Case Management
- **Fixed Add-to-Empty Bug**: Resolved an issue where adding new cases was impossible when the test case tree was empty.
- **Improved Bulk Deletion Stability**: Fixed system crashes (JPA errors) that occurred when deleting a large number of test cases at once. Bulk operations are now handled reliably.
- **Fixed Initialization Errors**: Eliminated internal initialization errors (TDZ) that occasionally occurred during page load for a more pleasant experience.

#### 🔒 Improved Data Protection and Integrity
- **Protected Completed Results**: Added protection logic to prevent accidental modification of test results that are already in 'COMPLETED' status.
- **Clearer Error Messages**: When a result cannot be modified, the system now provides friendly explanations in both Korean and English.
- **Database Optimization**: Refined internal data structures (JPA) to improve invisible performance and stability.

#### 🎨 Smoother and More Comfortable UI
- **Natural Focus Handling**: Fixed focus jumping issues when opening or closing menus, providing smoother keyboard and mouse interaction.
- **Lighter Interface**: Improved UI responsiveness by cleaning up redundant code and enhancing accessibility (Aria-hidden fixes).