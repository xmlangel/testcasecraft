# Release Note - v1.0.119

## [1.0.119] - 2026-08-22

You no longer need to type model names by hand when using OpenRouter. Register an API key and the free models appear as a list, with a way to check which ones work right now. When something fails, the reason is shown as a single line first.

### Highlights

#### 🔧 A wrong API URL that produced 404

The OpenRouter documentation gives `https://openrouter.ai/api/v1` as the base URL. Entering that value produced this error:

```
Connection test failed: OpenRouter API call failed (status: 404 NOT_FOUND): 404 Not Found
```

The server appended `/api/v1/chat/completions` to that value, so the request went to `/api/v1/api/v1/chat/completions`. Any form now resolves to the same address.

| Entered value | Before | Now |
|---|---|---|
| `https://openrouter.ai` | Passed | Passed |
| `https://openrouter.ai/api/v1` | 404 | Passed |
| `https://openrouter.ai/api/v1/chat/completions` | 404 | Passed |

The same trap existed for OpenAI, Ollama, OpenWebUI, and Perplexity. All four were fixed together. The OpenAI documentation also gives a base URL that includes `/v1`, so the same failure was waiting there.

**Choosing a provider fills in its default URL.** A value you edited yourself is not overwritten.

#### 📋 Pick a free model from a list

Selecting OpenRouter under Admin → LLM Configuration shows two buttons.

- **Load free models** — fetches the free models currently offered. No cost, appears immediately.
- **Check availability** — sends a minimal request to each model to see whether it works right now.

After the check, unusable models turn grey with the reason attached.

| Label | Meaning | Selectable |
|---|---|---|
| Available | Normal response | Yes |
| Quota used up | That model's shared free pool is busy | No, greyed out |
| Account quota | The account's daily free-request quota is used up | Yes (not the model's fault) |
| Unavailable | Cannot be called through this path | No, greyed out |

**Account quota does not block selection.** Switching models does not help, so greying everything out would leave nothing to choose. The reset time is shown instead.

**For paid models, type the slug directly.** The list holds free models only.

#### 💬 Change the model from the chat screen

When the default configuration is OpenRouter, a model selector appears at the top of the AI Q&A screen. You can change the model for the current conversation without editing the admin settings.

Only free models from the list are accepted. The server blocks the path where a user picks a paid model and incurs charges.

#### ⚠️ Failure reasons are shown

There were cases where a request failed and nothing appeared on screen. The server sent the cause and the screen discarded it.

- With conversation auto-save on, the failure response vanished entirely, taking the unsaved question with it.
- When streaming was cut and the regular call retried, the failure response body appeared as if it were a normal answer.

Long reasons now show a summary, with the full text behind **Details**.

```
⚠ OpenRouter API call failed (status: 429 TOO_MANY_REQUESTS)
  Details ⌄
```

Expanding it shows the called address and the full response body, with a copy button. Short reasons get no button.

The same format applies to the LLM connection test, document upload, chunk listing, analysis results, and the shared documents screen.

### Upgrade notes

* No DB migration scripts. No schema changes.
* **Existing API URLs can be left as they are.** The server strips any appended path before calling. Saving the configuration again stores the normalized value.
* **English strings appear after a restart.** Korean is immediate.
* The free model list comes straight from OpenRouter. Which models exist, and when a free offering ends, is not decided by this product. Expiration dates are shown when the list provides them.
* Checking availability sends one request per model, so it consumes a small part of the free quota. Use it when you need it.
* For 1.0.118 changes, see [RELEASE_NOTE_1.0.118_EN.md](RELEASE_NOTE_1.0.118_EN.md).

### Known limitations

* Whether a free model picked in the chat screen actually answers was not confirmed. At verification time the account's daily free quota was exhausted and no free model responded. The rejection of paid models was confirmed.
* Response quality varies widely between free models. Some emit their reasoning into the answer body.

### Verification

| Target | Method | Result |
|---|---|---|
| URL normalization | 5 providers × 14 input forms | Passed |
| Connection test | Real calls with three URL forms | 200 on all three |
| Free model list | Real query (20 selected from 421 total) | Passed |
| Availability check | 20 real calls, 15 seconds | Passed |
| Error summary rules | 7 new tests | Passed |
| Error display component | 5 new tests | Passed |
| Screen behavior | Browser check on admin and chat screens | Passed |
| Frontend suite | 85 files, 673 tests | Passed |
| Backend | Compile, test compile, LLM and RAG tests | Passed |
| Format check | Prettier, full run | Passed |
