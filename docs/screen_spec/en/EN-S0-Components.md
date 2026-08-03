# Login & Account(S0) Components

> Screen ID **S0** · Parent document: [`EN-S0-Screen.md`](EN-S0-Screen.md)

---

## 1. Component List

| Screen | Route | Key elements | Purpose |
|---|---|---|---|
| Login | `/` (unauthenticated entry) | 2~5 input fields · notification · mode switch button | Login and registration both directions |
| Email verification | `/verify-email?token=…` | Icon · title · state-specific action button | Display verification result |
| Manual reading | `/manual` (lazy) | Markdown viewer | Read user manual |
| Guide reading | `/guides/{name}` (lazy) | Markdown viewer | Read guide document |

Login screen included in initial bundle. Manual and guides download on demand.

---

## 2. Display Specifications

### 2.1 Login and Registration Screen

**Card composition**
- Background: centered card (minimum width 350px · shadow)
- Title: center-aligned · "Login" or "Create account" depending on mode
- Language toggle: fixed top-right

**Fields**
- Login: username, password (2)
- Registration: username, password, confirm password, name, email (5) · label right-aligned
- Width: full width · normal spacing

**Notification**
- Error (red): "Account not found" etc.
- Info (green): "Registration confirmation email sent" etc.
- Rule: error and info show one at a time. Disappear on mode switch or input

**Buttons**
- Main button (login/register): submit start → progress indicator → hidden during loading (not just disabled)
- Mode switch: small size · bottom · hidden during loading
- Manual link: very small size · bottom center · open in new tab

**Field disable**
- Loading: all input fields and buttons disabled

### 2.2 Email Verification Result Screen

**Composition**
- Background: centered card
- Top icon: state-specific (success/expired/used/failure)
- Title: state-specific text
- Bottom button: "Go to login" or "Resend"

**State-specific presentation**

| State | Icon | Title color | Button |
|---|---|---|---|
| Success | Check circle | Green | [Go to login] |
| Expired | Warning | Orange | [Resend] |
| Used | Info | Blue | [Go to login] |
| Failure/error | X circle | Red | [Go to login] |

---

## 3. Interaction Specifications

### 3.1 Login and Registration Flow

| User action | Screen reaction | Server call | On success |
|---|---|---|---|
| Enter username | Clear prior error | None | — |
| Submit (login) | Disable fields · button → progress indicator | `POST /api/auth/login` | Receive tokens, start session |
| Submit (register) | Disable fields · button → progress indicator | `POST /api/auth/register` | Show "confirmation email sent" then go to login tab |
| Mode switch | Show different field set · do not retain input | None | — |
| Click manual link | Open `/manual` in new tab | None | — |

**Pre-validation (screen)**
- If two passwords differ: show "Passwords do not match" · no server call
- Do not validate email format on screen

**Timing**
- Loading button: hidden in ~0.3s (smooth transition)

### 3.2 Email Verification Flow

| Action | Reaction |
|---|---|
| Page entry | Immediately call `GET /api/email-verification/verify?token=…` · determine icon and title by result |
| [Go to login] | Redirect to `/login` |
| [Resend] | Call `POST /api/email-verification/resend` · show success or failure |

---

## 4. State Transition

Login screen

Idle (input allowed)
 ↓ field change
Input (clear error)
 ↓ submit
Loading (fields disabled)
 ↓ success
Session start (move to App)
 or failure
Show error (return to idle)

Mode

Login
 ↓ click [Create account]
Register (5 fields)
 ↓ click [Back to login]
Login (2 fields)

---

## 5. Where Settings Are Saved

| Item | Storage | Scope |
|---|---|---|
| Login token | Browser storage (encrypted) | Retained throughout session. Synchronized across tabs and windows |
| Language choice | Server user settings + browser storage | Maintained across devices. Same language on different devices |
| Input values (username etc.) | Memory (form state) | Cleared on page refresh |

---

## 6. Responsive and Accessibility Specifications

**Narrow screens**
- Card width: minimum 350px → shrink to 90% width
- Language toggle: keep top-right

**Keyboard navigation**
- Tab order: username → password (→ confirm password, name, email) → main button → mode switch → manual link
- Autofocus on username field · submit by button or Enter equally
- Escape: not a modal, ignore

**Alternative text**
- Username field: "Enter username"
- Password field: "Enter password" · show/hide icon: "Show password"

---

## 7. Server Request/Response

### 7.1 Authentication API

| Route | Method | Request | Response | Purpose |
|---|---|---|---|---|
| `/api/auth/login` | POST | `{ username, password }` | `{ accessToken, refreshToken, user }` | Login |
| `/api/auth/register` | POST | `{ username, password, name, email }` | `{ success }` | Register |
| `/api/auth/refresh` | POST | `{ refreshToken }` | `{ accessToken }` | Token refresh (automatic) |

**Token refresh**: On 401 response, automatically retry once. Even if simultaneous requests from multiple tabs/windows, make refresh call only once.

### 7.2 Email Verification API

| Route | Method | Request | Response | Purpose |
|---|---|---|---|---|
| `/api/email-verification/verify` | GET | `?token=…` | `{ success }` or `{ error: "EXPIRED"\|"USED"\|"INVALID"\|"ERROR" }` | Verify |
| `/api/email-verification/resend` | POST | None | `{ success }` | Resend mail |

### 7.3 Document API (No authentication required)

| Route | Method | Response | Purpose |
|---|---|---|---|
| `/api/manual` | GET | Markdown text (Korean/English) | User manual |
| `/api/guides/{name}` | GET | Markdown text | Guide document |

These routes must be accessible before login.

---

## 8. Maintenance Notes

1. **When adding fields, edit three places together**: registration field set (5) · initial values · pre-validation rules. Missing initial values send undefined to server.
2. **Keep login failure message singular: "Account not found".** Do not distinguish by reason to avoid leaking account existence.
3. **Password format (length etc.) validation only on server.** Screen receives input only; server errors show rules.
4. **Keep manual and guides outside ProtectedRoute.** They must be readable before login or from mail link.
5. **Do not split verification result (success/failure) across multiple components; branch with one config object.** Define icon, color, title in one place when adding states.
