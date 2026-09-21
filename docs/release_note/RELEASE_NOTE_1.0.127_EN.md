# Release Note - v1.0.127

## [1.0.127] - 2026-09-20

Written: 2026-09-20 00:05 KST

An external QA agent — an LLM that reads test cases written in plain language and drives a real browser — is now wired into the product. The agent runs as a separate stack outside the product; what the product gains is per-project connection settings and a place for the results to land.

### Highlights

#### Connect an agent per project

Project settings now has an **Agent connection** tab. Enter the agent address, auth token, and default profile, verify the connection, then decide whether this project uses it.

**It is off by default.** Turning it on starts nothing. The agent runs as a stack of its own, so its container has to be up. The screen says so while the toggle is on.

Each field now states what to put in it. The two address fields are where setups go wrong most often. The product is a container too, so `localhost` points at itself; conversely `host.docker.internal` resolves only inside containers and a person's browser does not know it. Get only one of the two right and either the server connects while the run button fails to open, or the button opens while the connection test fails.

**Impact:** projects that do not use the integration behave exactly as before. To block the feature across an organization, override `AGENT_INTEGRATION_ENABLED=false`.

#### See the agent's screenshots in the dashboard

Results the agent uploads land as automation test results. So they never blend into human runs, the run name carries `[AI]`, the tag is `ai-agent`, and the first line of the summary marks it as a draft.

Each case gained an **attachment layer** that holds the screens captured during the run. Open them from the list as a preview, or find them inline at the matching step in the step timeline. Values stored as JSON render as a collapsible tree.

**Impact:** only failed cases get the last three screens. Passing cases get none, which keeps storage small.

#### Executions without a test plan reported zeros

An execution created without a test plan showed 0% progress and zero verdict counts. The cases had run and the results were stored; only the screen failed to reflect them.

**Impact:** existing executions show correct numbers when reopened.

#### A readable page while the server comes up

During the 30 to 60 seconds a restart takes, nothing answered and the edge served its own English 502 page. That page does not say what to wait for or when to come back.

A gateway now sits in front and keeps answering. It shows the error code (502 Bad Gateway) along with plain wording: the problem may be temporary, try again shortly, and contact your server administrator if the page keeps showing. It refreshes itself every 15 seconds and renders in Korean or English based on the language saved in the browser.

**Impact:** the gateway takes over the port the edge already pointed at, so nothing changes on the server side.

#### The setup procedure is now written down

`docs/deployment/AGENT_INTEGRATION.md` is new. It covers the three layers that all have to be on (the global environment variable, the per-project setting, and the agent container), the permissions the bot account needs, which side each of the two address fields is read from, and what to check first when a connection fails.

It records what actually went wrong while connecting to a remote server: `host.docker.internal` failing to resolve on a Linux host so the connection check fails, a data folder owned by the wrong user leaving the container in a restart loop, and `localhost` in `TCC_BASE_URL` making the agent call itself.

**Impact:** documentation only. Nothing the product does has changed.

### Verified

- Turning the integration on and off in project settings, and the connection test, against a real agent.
- Ran a session through the agent and reviewed the results and attached screens in the automation dashboard.
- Stopped the app to confirm the 502 page appears, then started it again and saw the normal screen return in 9 seconds.
- Field hints correct themselves at startup. Sites that edited the translations keep their own wording.
- After merging master, the full suites ran: 766 backend tests and 724 frontend tests, all passing.
