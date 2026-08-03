# Login & Account(S0) Workflow

> Screen ID **S0** · Screen name **Login · Registration · Email Verification · Manual Reading**
> Routes: `/login` · `/verify-email` · `/manual` · `/guides/{guideName}`

---

## 1. Business Purpose

The sole entry point to the product. Handles three functions.

| Purpose | Description |
|---|---|
| ① **Account acquisition** | Log in with username and password, or switch mode on the same screen to create an account |
| ② **Token issuance** | On successful login, receive access and refresh tokens together to open a session |
| ③ **Pre-login information** | Users without an account can still read the user manual (Korean/English) |

**What this screen does not do**

| What it doesn't do | Why |
|---|---|
| Enforce email verification | Verification is used for receiving notifications and password reset, not to block entry. After registration, return to login mode |
| Change password | Handled by profile dialog (S2) after login |
| Social login | Not provided. Google integration is for Sheets integration (S2 profile), not login |
| Organization and project selection | Handled by S1 after successful login |

---

## 2. Screen Position

| Item | Description | Reference |
|---|---|---|
| Before | None (first entry) | — |
| After | **S1 Project list**(`/projects`) | Manual section 1-3 |
| Entry condition | None. Accessing protected paths while unauthenticated returns to this screen | |
| Go back | Logout returns to this screen | Manual section 15 |

**Three routes open without login:** `/login` `/verify-email` `/manual`. The guide document viewer (`/guides/:guideName`) is also unprotected. All other routes are wrapped with `ProtectedRoute`.

---

## 3. Business Process Flow

### 3.1 Login

| # | User action | Screen behavior | Result |
|---|---|---|---|
| 1 | Access `/` or `/login` | Show login form (username and password) | — |
| 2 | Enter values and click `[Login]` or press Enter | Button disabled + loading. Entire form receives `submit` event | — |
| 3 | Authentication success | Confirm two tokens and start session. Move focus to `body` | Go to S1 |
| 4 | Missing token response | "Login failed" | Form retained |
| 5 | Exception | Server message first, otherwise generic message | Form retained |

The focus move in step 3 prevents the profile menu from opening automatically after login.

### 3.2 Registration

| # | User action | Screen behavior | Result |
|---|---|---|---|
| 1 | Click `[Register]` | Same screen switches to registration mode. Add 3 fields (confirm password, name, email) | — |
| 2 | Submit `[Register]` | **Screen validates first** — empty fields, password mismatch | No server call on failure |
| 3 | Registration success | Show "Registration complete. Please log in." then **return to login mode**. Clear only the two password fields | Login form |
| 4 | Server rejection (duplicate username etc.) | Expose server message | Registration mode retained |

The retention of username, name, and email in step 3 is to reduce re-entry burden.

### 3.3 Email Verification

| # | Action | Behavior |
|---|---|---|
| 1 | Click `[Send verification email]` from profile | Send mail with verification link |
| 2 | Click link in mail | Enter `/verify-email?token=…`. Validate token immediately |
| 3 | Show result | Four states: success, expired, already used, failure |
| 4 | On expired/failure, click `[Resend]` | Resend with new token |
| 5 | Click `[Go to login]` | Move to login screen |

**Distinguish four result states with color and icon on one screen.** Success is green check, expired is orange warning, already used is blue info, others are red error. The link reuse is treated as info, not error. If an already-verified user clicks the link again and sees a failure screen, it causes confusion.

### 3.4 Logout

| Action | Behavior |
|---|---|
| Avatar → `[Logout]` | Discard refresh token and return to login screen |
| Long inactivity | Auto logout with session expiration notice |

A logout-all endpoint (`POST /api/auth/logout-all`) exists on the server but this screen has no entry point. **Status: Hidden.** The feature exists but cannot be called from the screen.

---

## 4. Account Model

| # | Rule | Description |
|---|---|---|
| A1 | **Username is immutable** | Fixed as login identifier. Only name and email can be changed in profile |
| A2 | **Default system permission is empty** | New users have no `role` and must join a project to do anything |
| A3 | **Registration alone shows nothing** | If joined projects = 0, S1 shows invitation request guidance |
| A4 | **Initial admin account in code** | `admin / admin123`. Must be changed immediately after deployment |
| A5 | **Two token types** | Request with access token; on expiration, reissue with refresh token |

---

## 5. Users and Permissions

Since this screen is pre-authentication, project permissions do not apply. Only two states are distinguished.

| State | What is visible |
|---|---|
| Unauthenticated | Login and registration forms, manual link |
| Authenticated | Does not appear on this screen. Accessing it redirects to workspace |

Email verification status is not a permission but a **display state**. Unverified users can still log in, create cases, and record results. Mail is needed only when the system sends notifications.

---

## 6. Feature Rules

| # | Rule |
|---|---|
| F1 | Form submission works with Enter. Prevent resubmission during loading |
| F2 | Errors filterable by screen validation (empty values, password mismatch) are not sent to server |
| F3 | Display server error messages as-is without modification |
| F4 | Clear password input on mode switch and registration success |
| F5 | All screen text is in form `t("key", "Korean")`. Fallback Korean is together with code |
| F6 | Do not distinguish whether username or password is wrong on auth failure |

---

## 7. Integration with Other Screens

| Target | Direction | Description |
|---|---|---|
| **S1 Project list** | S0 → S1 | Destination after successful login |
| **S2 Profile dialog** | S2 → S0 | "Send verification email" button starts section 3.3 flow |
| **S2 Header** | S2 → S0 | Logout returns to this screen |
| **Manual viewer** | S0 → Manual | Read Korean/English manual before login |
| **S11 Mail settings** | S11 → S0 | If SMTP settings are empty, verification mail won't send |

---

## 8. Premises and Constraints

| Item | Description | Reference |
|---|---|---|
| Mail dependency | Email verification requires S11 mail settings. Fails if unconfigured | Manual section 17-5 |
| Session duration | Varies by environment (dev ~30 days, production default 90 days) | Manual section 15 |
| `Failed to fetch` | Screen cannot reach server. Check connection environment variable | `../../deployment/DOCKER_SETUP.md` section 9 |
| Logout all devices | API exists but screen has no entry point (**Hidden**) | |

---

## 9. Requirement ↔ Section Mapping

| REQ-ID | Requirement | Section in this document |
|---|---|---|
| S0-01 | Username/password login + two token issuance | Section 3.1, section 4, A5 |
| S0-02 | Registration mode switch on same screen | Section 3.2 |
| S0-03 | Screen validation before server call | Section 3.2, section 6, F2 |
| S0-04 | Email verification result in four states | Section 3.3 |
| S0-05 | Read manual before login | Section 1, ③ |
| S0-06 | Logout and session expiration notice | Section 3.4 |

Full requirements and evidence are in [`EN-S0-Requirements.md`](EN-S0-Requirements.md).
