# Release Note - v1.0.118

## [1.0.118] - 2026-08-22

When AI features were paused, the screen showed nothing but an error. It now lists which features are blocked and which still work, and the admin settings are documented in the manual.

### Highlights

#### 🚫 The reason is shown instead of an error

Opening the RAG documents screen produced only this:

```
/api/rag/documents?projectId=... : 500
```

It looked like an outage, but an administrator had turned the AI features off. The server knew the reason and it never reached the screen. Users read it as a fault, and administrators could not tell it came from a setting.

The server now sends the cause along with the response, and the screen turns it into guidance.

#### 🚦 What works right now, item by item

Two settings mean the available actions differ by state. The current state appears at the top of the RAG screen.

| State | Questions | Document search | List and download | Upload and analysis | Case indexing |
|---|---|---|---|---|---|
| Both on | Yes | Yes | Yes | Yes | Yes |
| Indexing off | Yes | Yes | Yes | No | No |
| AI features off | No | No | No | No | No |

**What works is marked as working.** With only indexing paused, the screen shows that questions and search are still available, so it is clear what can be attempted.

Nothing appears when everything is on. The notice shows up only when something is blocked.

### 📖 Admin settings are now in the manual

Three of the four admin screens were missing from the manual. `/llm-config` has four tabs and only two were documented.

- **17-6** was expanded to cover all four tabs, including the encryption key guidance shown by the connection test
- **17-6-1 RAG Shared Documents** added — the place for documents every project sees
- **17-6-2 System Settings** added — a table of what each toggle stops and what remains available in each state
- **Section 11** now describes what appears on screen while the feature is paused

The Korean and English editions were updated together.

### Upgrade notes

* No database migration scripts. No schema changes.
* **English text appears after a restart.** Korean shows immediately.
* **This release does not turn the settings on.** If AI features are off in your environment, enable "RAG Feature Status" under admin → RAG System Settings. To keep indexing paused, leave the second toggle off.
* Cases added or changed while indexing is off will not appear in search results. Turning it back on does not catch up on those changes, so documents have to be analyzed again if needed.
* Turning off the AI features also stops the related scheduled jobs. Enable them again on the Scheduler Management screen afterwards.
* For 1.0.117 changes, see [RELEASE_NOTE_1.0.117_EN.md](RELEASE_NOTE_1.0.117_EN.md).

### Verification

| Target | Method | Result |
|---|---|---|
| State resolution | 7 new tests (four combinations, defaults, edges) | Pass |
| Exception handling | 1 new test (queries refused while off) | Pass |
| Existing RAG behavior | 6 backend RAG tests | Pass |
| Frontend suite | 83 files, 661 tests | Pass |
| Backend | Compile, test compile | Pass |
| Format check | Run in automation | Pass |
| Manual style | AI-tell scan on the added text | 0 findings |
| Manual structure | Table syntax and in-document links | 0 issues |
