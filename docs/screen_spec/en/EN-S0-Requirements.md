# Login & Account(S0) Requirement Coverage

> Screen ID **S0** · Reference documents: [`EN-S0-Workflow.md`](EN-S0-Workflow.md) · [`EN-S0-Screen.md`](EN-S0-Screen.md) · [`EN-S0-Components.md`](EN-S0-Components.md)
> Baseline **v1.0.102**
> Status notation and reference convention: [`../README.md`](../README.md) section 4.

---

## 1. Functional Requirements

| # | Requirement | Where implemented | Status |
|---|---|---|---|
| **S0-01** | Log in with username and password; receive access and refresh token pair | EN-S0-Screen **area C, E** | Working |
| **S0-02** | Handle login and registration by **mode switch on same screen** | EN-S0-Screen **area B, C, E** | Working |
| **S0-03** | **Filter empty fields and password mismatch on screen, no server call** | EN-S0-Screen section 2.3 errors (2) **area D** | Working |
| **S0-04** | After registration success, return to login mode; retain username, name, email | EN-S0-Screen section 3 status table | Working |
| **S0-05** | Distinguish email verification result in **four states: success, expired, already used, failure** | EN-S0-Screen **area F** | Working |
| **S0-06** | Resend verification email on expired or failure | EN-S0-Screen **area F** | Environment-dependent — requires S11 mail settings |
| **S0-07** | Read user manual (Korean/English) before login | EN-S0-Screen **area E, G** | Working |
| **S0-08** | Change language before login | EN-S0-Screen **area A** | Working |
| **S0-09** | On logout, discard refresh token and return to this screen | EN-S0-Workflow section 3.4 | Working |
| **S0-10** | Notify user of session expiration | EN-S0-Workflow section 3.4 | Working |
| **S0-11** | Token refresh request sent only once concurrently | EN-S0-Components section 4.1 | Working |
| **S0-12** | Logout all devices | — | **Hidden** — API exists but no screen entry point |

---

## 2. Non-functional and Quality Requirements

| # | Requirement | Where implemented | Status |
|---|---|---|---|
| **S0-N1** | Do not distinguish auth failure by username or password | EN-S0-Screen section 6 | Working |
| **S0-N2** | Clear password input on mode switch and registration success | EN-S0-Screen section 3 | Working |
| **S0-N3** | Expose server error messages as-is without modification | EN-S0-Screen **area D** | Working |
| **S0-N4** | Prevent resubmission during loading | EN-S0-Components section 2.3 | Working |
| **S0-N5** | Screen text in form `t("key", "Korean")` with fallback together | EN-S0-Screen section 6 | Working |
| **S0-N7** | Profile menu does not open automatically after login | EN-S0-Workflow section 3.1 step 3 | Working |
| **S0-N8** | Limit routes open without authentication to 4 | EN-S0-Workflow section 2 | Working |

---

## 3. Needs Verification

| # | Item | Why ambiguous | Verification method |
|---|---|---|---|
| **V-S0-1** | Final responsibility for email format validation | Screen uses `type="text"` and does not validate format. Whether server rejects or valid registration succeeds with wrong format and only mail fails depends on code | Test registration with malformed format; verify response and DB storage |

---

## 4. Backend Functions Not on This Screen

Backend functions in this domain that this screen does not use. Listed to prevent false omission.

| Function | Why not on screen |
|---|---|
| Logout all devices | No entry point in UI. Requirement S0-12 |
| Change password | Handled by S2 profile dialog |
| User preferences query and save | Used by S2 (input mode, field toggle, menu structure, theme) |
| Admin password reset | Handled by S11 user management |

---

## 5. Maintenance Handoff

1. **When adding fields, edit three places together: form initial values, render, and pre-validation.** Missing initial values lead to `undefined` transmission (EN-S0-Components section 7-1).
2. **`login-title` is shared by both modes**.
3. **When adding verification result state, edit only `getResultConfig` once.** Do not create new state-specific components.
4. **Do not move `/manual`, `/verify-email`, `/guides/:name` to protected routes.** Breaks pre-login reading and mail link entry.
5. **Initial admin password (`admin/admin123`) is a change target after deployment.** Keep in documentation, not removed, to keep change requirement visible.
