# Material UI Design System

## Overview

This design system is based on the **Material UI for Figma (Community)** file — a comprehensive Figma component library that mirrors the [MUI (Material UI)](https://mui.com/) React component library. MUI is one of the most widely used React UI frameworks, implementing Google's Material Design specification with extensive customization capabilities.

**Source:** Figma community file — "Material UI for Figma (and MUI X) (Community)"
- Figma file contains 70 pages, 143 top-level frames
- Covers core MUI components, MUI X (Data Grid, Date/Time pickers, Charts, Tree View), and example Screens/Blocks

This design system distills the Figma file into reusable CSS tokens, HTML preview cards, and a full UI kit for rapid prototyping and design work.

---

## Products / Surfaces

This kit covers a **single component library** (MUI) used across both web and mobile-responsive contexts:

1. **Desktop web** — Full-width layouts (1440px), sidebar navigation, data tables
2. **Mobile web** — Responsive breakpoints (xs: 375px, sm: 600px, md: 768px, lg: 1200px, xl: 1440px)
3. **MUI X** — Advanced components: Data Grid, Date/Time Pickers, Charts, Tree View

Example screens provided in the Figma:
- **Log In** — Card-based login form (desktop + mobile)
- **Job Directory** — Job listing with filters sidebar, cards, pagination
- **User Management** — Admin table interface

---

## CONTENT FUNDAMENTALS

### Tone & Voice
Material UI is a **developer-first** component library. Copy style is:
- **Technical and direct** — Documentation-style language, no fluff
- **Action-oriented** — Labels use imperative verbs: "ACTION", "SUBMIT", "Search by title"
- **Concise** — Short labels; e.g. button text is ALL CAPS for contained buttons
- **Third-person product references** — "MUI", not "we" or "our product"
- **No emoji** — The UI uses zero emoji throughout; purely text-based
- **Sentence case for most labels**, ALL CAPS for contained button text (Material Design spec)

### Copy Examples (from Figma)
- "Buttons allow users to take actions, and make choices, with a single tap."
- "Use typography to present your design and content as clearly and efficiently as possible."
- "Pro tip: Change the text styles using the global right-hand panel."
- "Get started for free" (card subtitle)
- "I accept the Terms and Conditions" (checkbox label)
- "Search by title", "Location" (input placeholders)
- "Show more" (link text)
- "Latest Jobs" (page title — title case)

### Casing Rules
- **Headings**: Title Case
- **Body / descriptions**: Sentence case
- **Button labels (contained)**: ALL CAPS
- **Button labels (text/outlined)**: Title Case
- **Form labels**: Sentence case
- **Navigation items**: Title Case

---

## VISUAL FOUNDATIONS

### Color System

**Primary**: `#9747FF` (rgb(151,71,255)) — A vivid purple-violet; the dominant brand color used across buttons, links, active states, checkboxes, focus rings, and component accents.

**Semantic Palette**:
| Role | Color | Hex |
|---|---|---|
| Primary | Purple | `#9747FF` |
| Secondary | Deep Purple | `#9C27B0` |
| Error | Red | `#D32F2F` |
| Warning | Deep Orange | `#EF6C00` |
| Info | Light Blue | `#0288D1` |
| Success | Green | `#2E7D32` |
| Action Blue | Blue | `#1976D2` |

**Text**:
| Token | Value |
|---|---|
| text.primary | `rgba(0,0,0,0.87)` |
| text.secondary | `rgba(0,0,0,0.60)` |
| text.disabled | `rgba(0,0,0,0.38)` |

**Backgrounds**:
- `background.default`: `#F5F5F5`
- `background.paper`: `#FFFFFF`
- Dark surface: `rgb(18,18,18)`

**Divider**: `rgba(0,0,0,0.12)`

### Typography

Primary font: **Roboto** (Regular, Medium, Light, Bold, Black)
Monospace: **Roboto Mono** (Medium)
Annotation/label font: **Inter** (Medium 12px — used in design annotations, not UI)
Icon font: **Material Icons**

| Variant | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|
| h1 | 96px | Light (300) | 1.167 | -1.5px |
| h2 | 60px | Light (300) | 1.2 | -0.5px |
| h3 | 48px | Regular (400) | 1.167 | 0 |
| h4 | 34px | Regular (400) | 1.235 | 0.25px |
| h5 | 24px | Regular (400) | 1.334 | 0 |
| h6 | 20px | Medium (500) | 1.6 | 0.15px |
| subtitle1 | 16px | Regular (400) | 1.75 | 0.15px |
| subtitle2 | 14px | Medium (500) | 1.57 | 0.1px |
| body1 | 16px | Regular (400) | 1.5 | 0.15px |
| body2 | 14px | Regular (400) | 1.43 | 0.17px |
| button | 14px | Medium (500) | 1.75 | 0.4px (uppercase) |
| caption | 12px | Regular (400) | 1.66 | 0.4px |
| overline | 12px | Regular (400) | 2.66 | 1px (uppercase) |

### Spacing

Base unit: **8px**. The spacing scale is: 4, 8, 12, 16, 24, 32, 40, 48, 64px. Components use `padding: 16px` internally for Card content.

### Borders & Corners

- **Border radius (components)**: `4px` (cards, buttons, text fields, chips, alerts)
- **Border radius (circular)**: `50%` (avatars, FABs)
- **Border radius (pill)**: `100px` (some chips/badges)
- **Divider**: `1px solid rgba(0,0,0,0.12)`
- **Outlined input border**: `1px solid rgba(0,0,0,0.23)` → on focus `2px solid #9747FF`
- **No visible borders on cards** — elevation via shadow only

### Elevation / Shadow System

MUI uses a layered shadow system (3 shadow layers per elevation):

```
elevation 1: 0px 2px 1px -1px rgba(0,0,0,.20), 0px 1px 1px 0px rgba(0,0,0,.14), 0px 1px 3px 0px rgba(0,0,0,.12)
elevation 2: 0px 3px 1px -2px rgba(0,0,0,.20), 0px 2px 2px 0px rgba(0,0,0,.14), 0px 1px 5px 0px rgba(0,0,0,.12)
elevation 4: 0px 2px 4px -1px rgba(0,0,0,.20), 0px 4px 5px 0px rgba(0,0,0,.14), 0px 1px 10px 0px rgba(0,0,0,.12)
elevation 8: 0px 5px 5px -3px rgba(0,0,0,.20), 0px 8px 10px 1px rgba(0,0,0,.14), 0px 3px 14px 2px rgba(0,0,0,.12)
elevation 24: 0px 11px 15px -7px rgba(0,0,0,.20), 0px 24px 38px 3px rgba(0,0,0,.14), 0px 9px 46px 8px rgba(0,0,0,.12)
```

### Interactive States

- **Hover**: A translucent overlay of the component's color at `rgba(color, 0.04)` (light) or `rgba(color, 0.08)` (on dark)
- **Focus**: A translucent overlay at `rgba(color, 0.12)` + outline
- **Pressed/Active**: `rgba(color, 0.12)` ripple effect (Material ripple)
- **Disabled**: `rgba(0,0,0,0.38)` text, `rgba(0,0,0,0.12)` background — no interaction

### Backgrounds & Surfaces

- **White surfaces** (`#FFFFFF`) on a light gray default background (`#F5F5F5`)
- **No full-bleed imagery** in component documentation; screens use white backgrounds
- **No gradients** — flat material design
- **No textures or patterns**
- **Dark mode** supported: surfaces use `rgb(18,18,18)` base with semi-transparent white overlays per elevation level

### Animation

Material UI uses **short, purposeful transitions**:
- Duration: `150ms–300ms`
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (standard), `cubic-bezier(0.0, 0, 0.2, 1)` (decelerate), `cubic-bezier(0.4, 0, 1, 1)` (accelerate)
- **Ripple effect** on button/list interactions
- **No bounce** — Material Design uses ease-in-out, not spring physics
- Drawers slide in; Dialogs fade+scale; Snackbars slide up from bottom

### Cards

- `background: #FFFFFF`
- `border-radius: 4px`
- `box-shadow`: elevation 1 (standard), elevation 8 (raised/focused)
- No border
- Content padding: `16px`
- Header padding: `16px` with title (subtitle1/h6) + optional subheader (body2, secondary text)

### Imagery / Iconography

See **ICONOGRAPHY** section below.

---

## ICONOGRAPHY

**Icon Font**: Material Icons (`Material Icons` Regular, via Google Fonts CDN)
- Usage: `<span class="material-icons">icon_name</span>`
- CDN: `https://fonts.googleapis.com/icon?family=Material+Icons`
- Sizes seen: 16px, 20px, 24px (standard), 35px
- Style: **Filled** icons predominantly (e.g. ChevronRightFilled, AddFilled, CancelFilled, ArrowDropDownFilled, SearchFilled, ViewModuleFilled)

**No custom SVG illustrations** — the kit uses Material Icons exclusively for iconography.
**No emoji** used in any component.
**No PNG icon sprites** — all icons are from the Material Icons font.

Icons are used in:
- Buttons (leading/trailing icons)
- Text fields (start/end adornments)
- List items
- App bars
- Chips
- FABs
- Navigation

---

## FILES

```
README.md                    ← This file
colors_and_type.css          ← CSS custom properties: colors, type, spacing, shadows
SKILL.md                     ← Agent skill descriptor

assets/                      ← (No proprietary logos; MUI is open-source)

preview/                     ← Design System tab cards
  colors-primary.html
  colors-semantic.html
  colors-text-bg.html
  type-scale.html
  type-specimens.html
  spacing-tokens.html
  shadows.html
  buttons.html
  inputs.html
  feedback.html
  navigation.html
  data-display.html

ui_kits/
  mui-web/
    README.md
    index.html               ← Interactive UI kit (Job Directory screen)
    AppBar.jsx
    Button.jsx
    TextField.jsx
    Card.jsx
    Chip.jsx
    Badge.jsx
    Dialog.jsx
    Sidebar.jsx
    DataTable.jsx
```
