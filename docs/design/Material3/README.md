# Material 3 Design System

## Overview

This design system is based on **Google's Material Design 3** (Material You) — the latest evolution of Material Design. It is a comprehensive, adaptive design language developed by Google, used across Android, web, and cross-platform applications.

**Source:** Figma Community file — "Material 3 Design Kit (Community)"  
Figma source: https://www.figma.com/community/file/1035203688168086460 (community kit — read access required)

The kit covers the full M3 component and style library: tokens, type scale, color system, elevation, shape system, and ~30 component categories.

---

## Products / Surfaces

Material 3 is designed for:
- **Android apps** — primary platform, adaptive layouts
- **Web apps** — responsive, accessible interfaces
- **Cross-platform** — Flutter, Jetpack Compose, and web components

The kit includes both **light** and **dark** theme variants throughout.

---

## Content Fundamentals

### Tone & Voice
Material 3 copy is **clear, concise, and helpful**. Labels are action-oriented and human. The design system documentation uses direct second-person ("you"), imperative verbs, and avoids jargon.

- **Sentence case** is used for all UI labels, buttons, and navigation items (not Title Case)
- **No punctuation** on standalone labels or buttons
- **Descriptive, minimal copy** — "Save", "Done", "Cancel", not "Click here to save changes"
- Friendly and approachable but professional; no slang

### Casing
- UI text: sentence case ("Add to cart", not "Add To Cart")
- Error messages: friendly + actionable ("Something went wrong. Try again.")

### Emoji
Emoji are **not used** in UI components. Material Icons (outlined/filled/rounded) are the icon system.

---

## Visual Foundations

### Color System
Material 3 uses a **tonal palette system** derived from a seed color. The default baseline theme uses a **purple primary**.

| Role | Light | Dark |
|------|-------|------|
| Primary | `#6750A4` | `#D0BCFF` |
| On Primary | `#FFFFFF` | `#381E72` |
| Primary Container | `#EADDFF` | `#4F378B` |
| On Primary Container | `#21005D` | `#EADDFF` |
| Secondary | `#625B71` | `#CCC2DC` |
| On Secondary | `#FFFFFF` | `#332D41` |
| Secondary Container | `#E8DEF8` | `#4A4458` |
| On Secondary Container | `#1D192B` | `#E8DEF8` |
| Tertiary | `#7D5260` | `#EFB8C8` |
| On Tertiary | `#FFFFFF` | `#492532` |
| Tertiary Container | `#FFD8E4` | `#633B48` |
| On Tertiary Container | `#31111D` | `#FFD8E4` |
| Error | `#B3261E` | `#F2B8B5` |
| Error Container | `#F9DEDC` | `#8C1D18` |
| Surface | `#FFFBFE` | `#1C1B1F` |
| Surface Container | `#F3EDF7` | `#211F26` |
| Outline | `#79747E` | `#938F99` |
| Outline Variant | `#CAC4D0` | `#49454F` |
| Inverse Surface | `#322F35` | `#E6E1E5` |

Color vibe: **soft purple/lavender** — warm neutrals leaning slightly violet. Not cold or blue. Imagery tends to be warm and organic.

### Typography
Four families used:

| Family | Usage |
|--------|-------|
| **Google Sans** | Display, Headline — large expressive text |
| **Google Sans Text** | UI labels, chips, components (11–16px) |
| **Roboto** | Body and Title text |
| **Roboto Mono** | Code, technical/annotation text |

**Type scale:**
- Display Large: 57px / 64px line-height / -0.25 tracking
- Display Medium: 45px / 52px
- Display Small: 36px / 44px
- Headline Large: 32px / 40px
- Headline Medium: 28px / 36px
- Headline Small: 24px / 32px
- Title Large: 22px / 28px (Regular)
- Title Medium: 16px / 24px (Medium weight)
- Title Small: 14px / 20px (Medium weight)
- Body Large: 16px / 24px
- Body Medium: 14px / 20px
- Body Small: 12px / 16px
- Label Large: 14px / 20px (Medium)
- Label Medium: 12px / 16px (Medium)
- Label Small: 11px / 16px (Medium)

Google Fonts substitutes used: **Roboto** is available on Google Fonts. **Google Sans** → substituted with **Google Sans** via fonts.gstatic.com where possible.

### Spacing & Layout
- Base unit: **4px** grid
- Component padding: multiples of 4 (8, 12, 16, 24px)
- Card padding: typically 16px
- Section padding: 24–32px

### Shape System
- Extra Small: 4px radius (chips, small buttons)
- Small: 8px (cards, menus)
- Medium: 12px (dialogs, sheets)
- Large: 16px (nav drawers)
- Extra Large: 28px (FABs, large surfaces)
- Full: 50% (pills, icon buttons)

### Elevation
5 levels using box-shadow + surface tint overlay:
- Level 0: flat
- Level 1: `0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15)` + 5% tint
- Level 2: `0 1px 2px rgba(0,0,0,0.3), 0 2px 6px rgba(0,0,0,0.15)` + 8% tint
- Level 3: `0 4px 8px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.15)` + 11% tint
- Level 4: `0 6px 10px rgba(0,0,0,0.3), 0 2px 3px rgba(0,0,0,0.15)` + 12% tint
- Level 5: `0 8px 12px rgba(0,0,0,0.3), 0 4px 4px rgba(0,0,0,0.15)` + 14% tint

### Backgrounds
- Light theme: `#FFFBFE` (near-white with slight purple tint)
- Surface containers use tonal steps: Low (#F7F2FA), Mid (#F3EDF7), High (#ECE6F0), Highest (#E6E0E9)
- No gradients on backgrounds — flat tonal fills only
- No textures or patterns

### Animation & Motion
- Easing: **Emphasized** (cubic-bezier(0.2, 0, 0, 1.0)) for entrances; **Emphasized Decelerate** for exits
- Duration: short (50–200ms), medium (250–400ms), long (450–600ms)
- Transitions use **container transforms** for shared elements (Material Motion)
- Hover states: ripple + state-layer overlay at 8% opacity
- Press states: ripple + state-layer at 12% opacity
- No bouncy/spring animations — smooth and intentional

### Hover / Press States
- All interactive surfaces use **state layers**: a same-color tint overlay at 8% (hover), 12% (press), 16% (focus)
- No color change on hover — just opacity overlay
- No scale transforms on press

### Cards
- Border-radius: 12px (Medium shape)
- Light: white/surface background, subtle shadow (Elevation 1: `0 1px 2px rgba(0,0,0,0.3)`)
- Outlined variant: 1px border `#CAC4D0`, no shadow
- Filled variant: Surface Container background, no shadow
- Padding: 16px

### Borders
- Outlined components use 1px border in `#CAC4D0` (Outline Variant) resting, `#79747E` (Outline) focused
- Focus indicator: 3px solid `#6750A4`

### Blur / Transparency
- Used sparingly for navigation bars and scrim overlays
- Scrims: `rgba(0,0,0,0.4)` behind dialogs/sheets
- No frosted glass except modals on Android

### Corner Radii (Shape Scale)
- XS: 4px, S: 8px, M: 12px, L: 16px, XL: 28px, Full: 9999px

---

## Iconography

See [ICONOGRAPHY section](#iconography) below and the `assets/` folder.

Material 3 uses **Material Symbols** — a variable icon font from Google. Three styles:
- **Outlined** (default)
- **Rounded**
- **Sharp**

Variable axes: Fill (0–1), Weight (100–700), Grade (-25–200), Size (20–48).

CDN: `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined`

No custom SVG icon sets. No emoji as icons. Unicode chars not used as icons.

---

## Files Index

| File/Folder | Description |
|-------------|-------------|
| `README.md` | This file — high-level overview |
| `SKILL.md` | Agent skill descriptor for Claude Code / agents |
| `colors_and_type.css` | All CSS custom properties: color tokens (light + dark), tonal palettes, type scale classes, shape/spacing/elevation tokens |
| `preview/` | Design system card previews (shown in Design System tab) |
| `ui_kits/material3/index.html` | Interactive M3 Notes app — Home, Search, Detail, Profile, New Note |
| `ui_kits/material3/tokens.js` | JS token objects: `M3Colors`, `M3Dark`, `M3Elevation`, `M3Shape` |
| `ui_kits/material3/components.jsx` | Shared React components: Button, Card, Chip, TextField, NavBar, Dialog, Snackbar, Switch, Avatar, ListItem, FAB, TopAppBar |
| `ui_kits/material3/README.md` | UI kit usage guide |

### Preview Cards (Design System tab)

**Colors:** Primary palette · Secondary/Tertiary/Error · Surface & Neutral · Dark Theme  
**Type:** Display & Headline scale · Title, Body & Label scale  
**Spacing:** Spacing tokens · Shape scale · Elevation system  
**Components:** Buttons · Cards · Chips & Badges · Text Fields · Navigation · Selection Controls · Dialogs & Snackbar  
**Brand:** Material Symbols iconography

---

## Sources

- Figma: Material 3 Design Kit (Community) — attached as `.fig` virtual filesystem
- Material Design 3 docs: https://m3.material.io
