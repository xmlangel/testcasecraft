# Material 3 Design System — UI Kit

A high-fidelity interactive prototype of a Material 3 app, built with React + JSX.

## Screens

- **Home** — note list with filter chips, tonal cards, extended FAB
- **Note Detail** — reading view with delete dialog + snackbar
- **Search** — full-width search bar with live results
- **Profile** — switches, list items, outlined button, avatar
- **New Note** — filled + outlined text fields, chip tag selector

## Components

All components in `components.jsx` accept a `colors` prop (pass `M3Colors` or `M3Dark`):

| Component | Description |
|-----------|-------------|
| `TopAppBar` | App bar with title, back button, action icons |
| `Button` | `variant`: filled / tonal / outlined / text / elevated |
| `FAB` | Floating action button, `size`: small / medium / large |
| `Card` | `variant`: elevated / filled / outlined |
| `Chip` | Filter chip with selected state |
| `TextField` | `variant`: filled / outlined, with error + support text |
| `ListItem` | Two-line list with leading icon + trailing widget |
| `Avatar` | Initials-based, tonal container |
| `NavigationBar` | Bottom nav with active indicator |
| `NavigationRail` | Side rail for larger screens |
| `Switch` | Controlled toggle |
| `Dialog` | Modal with icon, title, body, actions |
| `Snackbar` | Toast with optional action |
| `Divider` | Outline-variant line |
| `IconButton` | Circular icon button, optional filled variant |

## Usage

```html
<script src="tokens.js"></script>
<script type="text/babel" src="components.jsx"></script>

<!-- Then in JSX: -->
<Button label="Save" variant="filled" colors={M3Colors} onClick={save} />
<Card variant="elevated" colors={M3Colors}>…</Card>
```

## Dark mode

Pass `colors={M3Dark}` to any component to use dark theme tokens.
