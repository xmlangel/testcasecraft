# Release Note - v1.0.117

## [1.0.117] - 2026-08-22

When the AI assistant gets stuck, the screen now tells you what to do next. Failures that used to be invisible are shown with their cause, long-running questions can be stopped, and indexing can be paused on its own while questions keep working.

### Highlights

#### 💬 Failures are visible

A failed question left behind a single bubble that looked like an answer. The server was reporting the cause precisely, and the screen discarded it.

```
Check that the registered API key is correct and has not expired.
```

That sentence was being sent, yet the screen showed only "Sorry, an error occurred while generating the response." A failed bubble now looks different and carries the cause inside it.

Three places were fixed. The cause is carried through for regular and saved conversations, an interrupted stream that used to leave **an empty bubble** now shows the failure, and the error signal the server sends over the stream — which the screen never received at all — is now wired up. When no cause is reported, the screen says the server log has to be checked.

#### ⏹️ A request can be stopped

There was nothing to do but wait. "The AI is generating a response..." stayed on screen with no way to cancel.

**The send button turns into a stop button while a request is in flight.** Rather than adding a second button, the same spot switches by state.

The conditions were exactly out of step: the stop button appeared only after streaming began, and the loading text appeared only before it, so **the button could not appear while the text was showing.** Two related defects were fixed as well — pressing stop did not clear the loading text, and non-streaming requests stayed alive after being stopped. A stop the user pressed is not a failure, so it is not shown as an error.

#### ⏱️ Guidance when a request times out

If a response does not arrive within the limit, the proxy closes the connection. The screen could not read what came back and broke on an unreadable string.

Now the guidance matches the situation.

| Situation | Guidance |
|---|---|
| Timed out | The server may still be working; split the question or retry shortly |
| Session expired | Sign in again |
| Server error | Retry shortly; if it persists, check the server log |
| Connection failed | Check the network |

#### 🗂️ Pause indexing while questions keep working

Turning off the AI features used to block questions too. There was no way to cap cost or pause indexing while **still answering questions from material already registered**.

A "Vector indexing" toggle was added to the admin screen.

| Area | When turned off |
|---|---|
| Document upload, analysis, embedding, test case and conversation indexing, auto analysis | Stops |
| Questions, search, document list, detail, download | Keeps working |
| Index deletion | Keeps working |

**Stopping works two ways.** Actions the user pressed are refused with a reason, while indexing that runs in the background is skipped quietly, because saving a test case or holding a conversation must not appear to fail.

When an upload is refused on the document screen, the message adds that querying already-indexed material keeps working.

#### 🧹 Error causes that used to disappear

Across the screens, the code that reads the cause sent by the server **could never read anything**, because it was written for a different transport. 45 places in 22 files were fixed, along with 24 places where the response status was never checked so no cause was produced at all.

This also surfaced a defect where **an error response was taken for a document and shown on screen** while polling analysis progress.

### Upgrade notes

* No database migration scripts. No schema changes.
* **English text appears after a restart.** Korean shows immediately.
* Vector indexing defaults to on, so leaving it alone keeps the previous behavior.
* **Test cases added or changed while indexing is off will not appear in search results.** Turning it back on does not catch up on those changes, so documents have to be analyzed again if needed.
* The response timeout is configured longer than the proxy connection limit. For long questions the screen receives the disconnect notice while the server is still working. This release reports that situation rather than removing it.
* For 1.0.116 changes, see [RELEASE_NOTE_1.0.116_EN.md](RELEASE_NOTE_1.0.116_EN.md).

### Developer notes

Frontend code formatting was normalized once and the check was added to automation. Changes from now on have to pass the format check; run `npm run format` if it does not.

The cleanup is line wrapping only and behavior did not change.

| Check | Result |
|---|---|
| Unit tests | 654 passing before and after |
| Build chunk names | All 66 identical |
| Korean strings in the output | 2,330 identical in kind and count |
| Output size | 4,861,450 → 4,861,464 bytes |

The extra 14 bytes come from internal name assignment shifting by one character during minification; the strings and behavior are unchanged.

### Verification

| Target | Method | Result |
|---|---|---|
| Indexing toggle | 5 new regression tests (refuse, skip, enabled) | Pass |
| Error message selection | 14 new tests | Pass |
| Response cause extraction | 10 new tests | Pass |
| Frontend suite | 82 files, 654 tests | Pass |
| Backend | Compile, test compile, RAG tests | Pass |
| Format check | Run in automation | Pass (41s) |
| Format gate | Deliberately misformatted line | Blocked |
