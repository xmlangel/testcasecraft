# Release Note - v1.0.123

## [1.0.123] - 2026-08-26

The AI chat (RAG) no longer answers with data from projects you cannot access, and the range of what you can ask has been widened to the whole database. Tags, QA opinions, and execution results — things the chat could not find before — are now answered.

### Highlights

#### Projects you cannot access are not answered

The AI chat only checked whether you were logged in, not whether you could access the requested project. So supplying the id of a project you did not belong to returned that project's test case counts and contents anyway.

Now the chat answers only when you have access to the requested project. Without access, no data is shown and the request is denied. The same rule applies to both the regular and the streaming (real-time) response.

**Impact:** A path that could leak data between projects through the chat is closed. Peeking at another team's project without access no longer happens.

#### A wider range of questions

Until now the chat searched little more than a test case's title and description. Asking it to group cases by tag, to summarize the QA opinion of an execution, or to show the notes on failed results returned "no data" — even though the data was there, it just could not be found.

The chat now queries these directly:

| What you can ask | Example |
|---|---|
| Cases grouped by tag | "Show cases tagged payment" |
| Preconditions and test techniques | "Find cases built with boundary-value analysis" |
| Test step contents | "Find cases with a login step" |
| QA opinion of an execution | "Summarize the QA opinions for these runs" |
| Results and their notes | "Show failed cases and their notes" |

Keyword search over cases now covers preconditions, test technique, and tags in addition to title and description.

**Impact:** You can ask about what a project holds straight from the chat, without opening a screen and applying filters. Every query stays scoped to the requested project, and sensitive information such as user accounts and passwords is blocked from being queried.

#### A cut-off answer is fixed

When some AI models wrapped their answer in a particular format, the chat could stop with an error while analyzing the intent of the question and fall back to answering with count statistics only. It now handles any incoming format reliably, so requests such as tags or QA opinions no longer revert to statistics.

### Scope verified

- Confirmed with a real account that a request for a project without access is denied, while a project with access responds normally.
- Confirmed that tag, QA opinion, count, and step queries actually read the database and return correct answers.
- Added two automated tests for blocking unauthenticated chat; all AI chat tests pass.
- The quality of the AI chat's answers depends on the AI model that is connected.
