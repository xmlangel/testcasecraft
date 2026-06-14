# Release Note - v1.0.88

## [1.0.88] - 2026-06-14

Hello! Version 1.0.88 is a stability update focused on **initial screen-load performance**. We cleaned up several spots where the same API was being called twice right after login or on screen transitions, reducing redundant network requests and server load. There are no functional changes — loading just feels lighter.

### Highlights

#### ⚡ Redundant Initial API Calls Removed (Performance)

We fixed multiple places where an identical request fired two or more times on screen entry.

* **Removed double-nested Provider tree**: A Context Provider was mounted twice at the top level, causing every Context's initial fetch (`rag/status`, `auth/me`, `preferences`, etc.) to run in full twice. The duplicate nesting was removed.
* **Stopped fetch-effect re-run storms**: Unstable function references (such as `api`) recreated on every render were used as effect dependencies, causing auth-related fetch effects to re-run repeatedly. They are now pinned via refs.
* **Organization members (`/api/organizations/{id}/members`)**: Project cards belonging to the same organization each called the same organization-members API. They now share a single call via an organization-keyed cache plus in-flight request sharing.
* **User preferences (`/api/auth/me/preferences`)**: Each preference key used to fetch the entire preferences blob separately; all consumers now share a single request.
* **RAG status (`/api/system-settings/rag/status`)**: Duplicate calls under dev-mode (StrictMode) double-mount or remount are now collapsed into a single in-flight request.

#### 🛠️ PWA Icon 401 Fix (Improved)

* `logo192.png`, referenced by the manifest and `apple-touch-icon`, was blocked by the security filter and returned **401 (Unauthorized)**, producing console errors and a failed icon download. The PWA icon path was added to the static-resource allow list.

### Upgrade Notes

* No DB migration — just replace the image.
* No changes to screen behavior or displayed data; only duplicate requests are eliminated.
* For 1.0.87's result entry view options, see [RELEASE_NOTE_1.0.87_EN.md](RELEASE_NOTE_1.0.87_EN.md).
