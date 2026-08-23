# Release Note - v1.0.120

## [1.0.120] - 2026-08-23

NVIDIA is now available as an LLM provider. AI chat is noticeably faster: three to five times quicker depending on the question, and questions that used to time out now return an answer.

### Highlights

#### 🟩 NVIDIA provider added

NVIDIA appears in the provider list. Register an API key and the available models show up as a list, from which you can filter down to the ones that actually respond.

Model listing no longer depends on the provider. It previously worked only for OpenRouter.

| Provider | Model list | Bulk check |
|---|---|---|
| OpenRouter | Free models | 40 at a time |
| NVIDIA | Models your account offers | 30 at a time |
| OpenAI · Perplexity · Ollama · OpenWebUI | Type in manually | Check one at a time |

**The NVIDIA list includes models your account cannot use.** The list alone does not reveal this, so the screen tells you to press "Check all" first. In our measurement, two thirds of 77 models were not available on the account.

#### ⚡ AI chat is faster

We timed three kinds of question.

| Question | Before | Now |
|---|---|---|
| A one-line greeting | 19.0s | **0.6–1.3s** |
| Asking for a test case count | 8.9s | **2.2s** |
| Looking for login test cases | Failed after 50s+ | **Answer in 21.3s** |

**Query results are now processed once instead of twice.** Previously the AI summarised what came back from the database, and that summary was handed to the AI again to write the answer. The summarising step alone took 43 seconds. The AI now reads the query results directly.

**The answers got better as a side effect.** Passing through a summary flattens the structure of the original rows; reading them directly lets the AI lay them out as a table.

**Greetings are answered immediately.** A one-line greeting used to send the whole database schema to the AI just to ask what to look up. Phrases that need no lookup are now recognised and skipped. If a question follows the greeting (`Hello, how many are there`), the lookup still runs.

#### 🧠 A separate model for analysis

Before writing an answer, the AI reads the question intent and organises the query results. That preparation answers in a fixed format, so a cheap and fast model handles it well.

The LLM settings now have an "Analysis model (optional)" field. Assign a good model for answers and a cheap one for preparation, and responses get faster still.

    Leave it blank and the answer model handles the preparation too (same as before)

With a cheap analysis model, the count question dropped from 5.1s to 2.2s and the search question from 31.6s to 21.3s.

#### 📊 Progress is visible while models are checked

Checking several models takes minutes. The screen used to look frozen, and if it took long enough no answer arrived at all.

The button now reads "Checking 12 / 40". The check keeps running on the server while the screen asks for progress, so the result arrives even when it takes a while.

**You are told when the per-round limit is exceeded.** Requested models used to disappear from the result silently. Everything looked checked, and picking an unchecked model later failed. The screen now adds "Only 40 models are checked at a time. 5 were not checked, so press the button again."

#### 🔤 Error messages unified in one language

Errors during chat mixed English into an otherwise Korean screen.

```
Failed to call OpenAI API stream (status: 404)
```

Other errors on the same screen were in Korean. They are now consistent.

#### 📖 Manual provider list corrected

The manual listed providers that do not exist in this product.

    Before  OpenAI / Anthropic / Azure OpenAI / local models, etc.
    Now     OpenAI / OpenRouter / NVIDIA / Perplexity / Ollama / OpenWebUI

Anthropic and Azure OpenAI are not available here. Conversely OpenRouter, Perplexity and NVIDIA, which you can actually use, were missing from the manual.

### Documentation

- User manual §17-6: provider list corrected, analysis model explained (KO/EN)

### Notes for developers

Code that was scattered per provider has been consolidated. Screens and API response shapes are unchanged.

| Area | Before | Now |
|---|---|---|
| LLM clients | 6 files, 1,762 lines (96% similar) | Base class + 33–44 lines per provider, 596 total |
| Frontend provider branching | 17 ternary chains | 0, replaced by a table lookup |
| RAG chat service | 624 lines, 14 dependencies | 384 lines, 11 dependencies |
| Tests in the LLM area | 15 | 154 |

**Three API paths changed.** No backward-compatible aliases were kept.

    POST /api/llm-configs/openrouter/free-models        → POST /api/llm-configs/models
    GET  /api/llm-configs/openrouter/free-models/for-chat → GET  /api/llm-configs/models/for-chat
    POST /api/llm-configs/openrouter/free-models/probe   → POST /api/llm-configs/models/probe-jobs
                                                           GET  /api/llm-configs/models/probe-jobs/{jobId}

The check API also changed shape: a single request that returned the result became a job you start and then poll. What sits inside `result` is unchanged.

One column was added to `llm_configs`: `analysis_model_name`. It is created automatically on startup, and an empty value behaves exactly as before.
