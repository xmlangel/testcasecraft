// Material 3 — Core Components
// TopAppBar, NavBar, Button, FAB, Card, Chip, TextField, Switch, Dialog, Snackbar, ListItem, Avatar

// ── TopAppBar ──────────────────────────────────────────────────────
function TopAppBar({ title, onBack, actions = [], colors, elevated = false }) {
  const C = colors;
  return (
    <div style={{
      background: elevated ? C.surfaceContainerHigh : C.surface,
      boxShadow: elevated ? M3Elevation[2] : 'none',
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '0 4px', height: 64, flexShrink: 0,
      transition: 'background 0.2s, box-shadow 0.2s',
    }}>
      {onBack && (
        <IconButton icon="arrow_back" onClick={onBack} colors={C} />
      )}
      <div style={{
        flex: 1, padding: '0 8px',
        fontFamily: 'Roboto, sans-serif', fontSize: 22, fontWeight: 400,
        color: C.onSurface, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{title}</div>
      {actions.map((a, i) => <IconButton key={i} icon={a.icon} onClick={a.onClick} colors={C} />)}
    </div>
  );
}

// ── IconButton ─────────────────────────────────────────────────────
function IconButton({ icon, onClick, colors, filled = false, selected = false }) {
  const C = colors;
  const [hover, setHover] = React.useState(false);
  const bg = filled
    ? (selected ? C.primary : C.surfaceVariant)
    : hover ? `color-mix(in srgb, ${C.onSurfaceVariant} 8%, transparent)` : 'transparent';
  const fg = filled ? (selected ? C.onPrimary : C.onSurfaceVariant) : C.onSurfaceVariant;
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: 40, height: 40, borderRadius: M3Shape.full, border: 'none',
        background: bg, color: fg, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.15s', flexShrink: 0,
      }}>
      <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{icon}</span>
    </button>
  );
}

// ── Button ─────────────────────────────────────────────────────────
function Button({ label, variant = 'filled', icon, onClick, disabled = false, colors }) {
  const C = colors;
  const [hover, setHover] = React.useState(false);
  const styles = {
    filled:   { bg: C.primary, fg: C.onPrimary, border: 'none', shadow: hover ? M3Elevation[2] : M3Elevation[0] },
    tonal:    { bg: C.secondaryContainer, fg: C.onSecondaryContainer, border: 'none', shadow: 'none' },
    outlined: { bg: 'transparent', fg: C.primary, border: `1px solid ${C.outline}`, shadow: 'none' },
    text:     { bg: 'transparent', fg: C.primary, border: 'none', shadow: 'none', px: 12 },
    elevated: { bg: C.surfaceContainerLow, fg: C.primary, border: 'none', shadow: hover ? M3Elevation[2] : M3Elevation[1] },
  };
  const s = styles[variant] || styles.filled;
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        height: 40, padding: `0 ${s.px || 24}px`,
        borderRadius: M3Shape.full, border: s.border || 'none',
        background: disabled ? 'rgba(28,27,31,0.12)' : s.bg,
        color: disabled ? 'rgba(28,27,31,0.38)' : s.fg,
        boxShadow: disabled ? 'none' : s.shadow,
        fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 500, letterSpacing: '0.1px',
        cursor: disabled ? 'default' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        transition: 'box-shadow 0.2s, background 0.15s',
        opacity: hover && !disabled ? 0.92 : 1,
      }}>
      {icon && <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>}
      {label}
    </button>
  );
}

// ── FAB ────────────────────────────────────────────────────────────
function FAB({ icon, label, size = 'medium', onClick, colors }) {
  const C = colors;
  const [hover, setHover] = React.useState(false);
  const dim = size === 'large' ? 96 : size === 'small' ? 40 : 56;
  const radius = size === 'large' ? M3Shape.xl : size === 'small' ? M3Shape.md : M3Shape.lg;
  const iconSize = size === 'large' ? 36 : 24;
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        width: label ? 'auto' : dim, height: dim,
        padding: label ? `0 16px 0 16px` : 0,
        borderRadius: radius, border: 'none',
        background: C.primaryContainer,
        color: C.onPrimaryContainer,
        boxShadow: hover ? M3Elevation[4] : M3Elevation[3],
        cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', gap: label ? 12 : 0,
        fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 500,
        transition: 'box-shadow 0.2s',
      }}>
      <span className="material-symbols-outlined" style={{ fontSize: iconSize }}>{icon}</span>
      {label && <span>{label}</span>}
    </button>
  );
}

// ── Card ───────────────────────────────────────────────────────────
function Card({ children, variant = 'elevated', onClick, colors, style = {} }) {
  const C = colors;
  const [hover, setHover] = React.useState(false);
  const variants = {
    elevated: { bg: C.surfaceContainerLow, shadow: hover ? M3Elevation[2] : M3Elevation[1], border: 'none' },
    filled:   { bg: C.surfaceContainerHighest, shadow: 'none', border: 'none' },
    outlined: { bg: C.surface, shadow: 'none', border: `1px solid ${C.outlineVariant}` },
  };
  const v = variants[variant] || variants.elevated;
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: M3Shape.md, background: v.bg, boxShadow: v.shadow,
        border: v.border, overflow: 'hidden', cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s', ...style,
      }}>
      {children}
    </div>
  );
}

// ── Chip ───────────────────────────────────────────────────────────
function Chip({ label, selected = false, icon, onClose, onClick, colors }) {
  const C = colors;
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 32, padding: '0 12px',
        borderRadius: M3Shape.sm,
        background: selected ? C.secondaryContainer : (hover ? C.surfaceContainerHigh : 'transparent'),
        border: selected ? 'none' : `1px solid ${C.outline}`,
        color: selected ? C.onSecondaryContainer : C.onSurfaceVariant,
        fontFamily: 'Roboto, sans-serif', fontSize: 14, fontWeight: 500,
        cursor: 'pointer', userSelect: 'none', transition: 'background 0.15s',
      }}>
      {selected && <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check</span>}
      {icon && !selected && <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{icon}</span>}
      {label}
      {onClose && <span className="material-symbols-outlined" style={{ fontSize: 18 }} onClick={e => { e.stopPropagation(); onClose(); }}>close</span>}
    </div>
  );
}

// ── TextField ──────────────────────────────────────────────────────
function TextField({ label, value, onChange, variant = 'filled', error, supportText, type = 'text', colors }) {
  const C = colors;
  const [focused, setFocused] = React.useState(false);
  const filled = variant === 'filled';
  const hasVal = value && value.length > 0;
  const floated = focused || hasVal;
  const borderColor = error ? C.error : focused ? C.primary : C.outline;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
      <div style={{ position: 'relative', width: '100%' }}>
        {filled ? (
          <>
            <div style={{
              background: C.surfaceContainerHighest, borderRadius: '4px 4px 0 0',
              borderBottom: `${focused ? 2 : 1}px solid ${borderColor}`,
              padding: floated ? '20px 16px 4px' : '16px 16px',
              transition: 'border-color 0.15s',
            }}>
              <div style={{
                position: 'absolute', left: 16,
                top: floated ? 8 : 16, fontSize: floated ? 12 : 16,
                color: error ? C.error : focused ? C.primary : C.onSurfaceVariant,
                transition: 'all 0.15s', pointerEvents: 'none',
                fontFamily: 'Roboto, sans-serif',
              }}>{label}</div>
              <input type={type} value={value} onChange={e => onChange(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                style={{
                  background: 'transparent', border: 'none', outline: 'none', width: '100%',
                  fontFamily: 'Roboto, sans-serif', fontSize: 16, color: C.onSurface, marginTop: 4,
                }} />
            </div>
          </>
        ) : (
          <div style={{ position: 'relative' }}>
            <fieldset style={{
              border: `${focused ? 2 : 1}px solid ${borderColor}`,
              borderRadius: M3Shape.xs, padding: '0 12px 8px', margin: 0,
              transition: 'border-color 0.15s',
            }}>
              <legend style={{
                fontSize: 12, color: error ? C.error : focused ? C.primary : C.onSurfaceVariant,
                padding: '0 4px', fontFamily: 'Roboto, sans-serif',
                visibility: floated ? 'visible' : 'hidden', maxWidth: floated ? '100%' : 0,
              }}>{label}</legend>
              <div style={{ position: 'relative' }}>
                {!floated && <div style={{
                  position: 'absolute', top: -8, left: 0,
                  fontFamily: 'Roboto, sans-serif', fontSize: 16,
                  color: C.onSurfaceVariant, pointerEvents: 'none',
                }}>{label}</div>}
                <input type={type} value={value} onChange={e => onChange(e.target.value)}
                  onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                  style={{
                    background: 'transparent', border: 'none', outline: 'none', width: '100%',
                    fontFamily: 'Roboto, sans-serif', fontSize: 16, color: C.onSurface,
                  }} />
              </div>
            </fieldset>
          </div>
        )}
      </div>
      {(supportText || error) && (
        <div style={{
          fontSize: 12, color: error ? C.error : C.onSurfaceVariant,
          paddingLeft: 16, fontFamily: 'Roboto, sans-serif',
        }}>{error || supportText}</div>
      )}
    </div>
  );
}

// ── ListItem ───────────────────────────────────────────────────────
function ListItem({ headline, supportText, leading, trailing, onClick, colors }) {
  const C = colors;
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '8px 16px', minHeight: 56,
        background: hover && onClick ? `color-mix(in srgb, ${C.onSurface} 8%, transparent)` : 'transparent',
        cursor: onClick ? 'pointer' : 'default', transition: 'background 0.15s',
      }}>
      {leading && (
        <div style={{ flexShrink: 0, color: C.onSurfaceVariant }}>
          {typeof leading === 'string'
            ? <span className="material-symbols-outlined" style={{ fontSize: 24 }}>{leading}</span>
            : leading}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 16, color: C.onSurface, lineHeight: '24px' }}>{headline}</div>
        {supportText && <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: 14, color: C.onSurfaceVariant, lineHeight: '20px' }}>{supportText}</div>}
      </div>
      {trailing && <div style={{ flexShrink: 0, color: C.onSurfaceVariant }}>{trailing}</div>}
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────
function Avatar({ name, size = 40, colors }) {
  const C = colors;
  const initials = name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?';
  return (
    <div style={{
      width: size, height: size, borderRadius: M3Shape.full,
      background: C.primaryContainer, color: C.onPrimaryContainer,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Roboto, sans-serif', fontSize: size * 0.38, fontWeight: 500,
      flexShrink: 0,
    }}>{initials}</div>
  );
}

// ── NavigationBar ──────────────────────────────────────────────────
function NavigationBar({ items, activeIndex, onSelect, colors }) {
  const C = colors;
  return (
    <div style={{
      background: C.surfaceContainer, display: 'flex',
      alignItems: 'center', justifyContent: 'space-around',
      height: 80, paddingBottom: 8, flexShrink: 0,
    }}>
      {items.map((item, i) => {
        const active = i === activeIndex;
        return (
          <div key={i} onClick={() => onSelect(i)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 4, flex: 1, cursor: 'pointer', paddingTop: 12,
          }}>
            <div style={{
              width: 64, height: 32, borderRadius: M3Shape.full,
              background: active ? C.secondaryContainer : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: 24,
                fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                color: active ? C.onSecondaryContainer : C.onSurfaceVariant,
              }}>{item.icon}</span>
            </div>
            <div style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 12, fontWeight: 500,
              color: active ? C.onSurface : C.onSurfaceVariant,
            }}>{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── NavigationRail ─────────────────────────────────────────────────
function NavigationRail({ items, activeIndex, onSelect, colors, fab }) {
  const C = colors;
  return (
    <div style={{
      width: 80, background: C.surfaceContainerLow,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '12px 0', gap: 4, flexShrink: 0,
    }}>
      {fab && <div style={{ marginBottom: 8 }}>{fab}</div>}
      {items.map((item, i) => {
        const active = i === activeIndex;
        return (
          <div key={i} onClick={() => onSelect(i)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 4, width: '100%', padding: '4px 0', cursor: 'pointer',
          }}>
            <div style={{
              width: 56, height: 32, borderRadius: M3Shape.full,
              background: active ? C.secondaryContainer : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: 24,
                fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                color: active ? C.onSecondaryContainer : C.onSurfaceVariant,
              }}>{item.icon}</span>
            </div>
            <div style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 500,
              color: active ? C.onSurface : C.onSurfaceVariant,
            }}>{item.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Switch ─────────────────────────────────────────────────────────
function Switch({ checked, onChange, colors }) {
  const C = colors;
  return (
    <div onClick={() => onChange(!checked)} style={{ cursor: 'pointer', userSelect: 'none' }}>
      <div style={{
        width: 52, height: 32, borderRadius: 16,
        background: checked ? C.primary : C.surfaceContainerHighest,
        border: checked ? 'none' : `2px solid ${C.outline}`,
        position: 'relative', transition: 'background 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          left: checked ? 28 : 6, width: checked ? 24 : 16, height: checked ? 24 : 16,
          marginTop: checked ? 0 : 0,
          top: checked ? 4 : '50%', transform: checked ? 'none' : 'translateY(-50%)',
          borderRadius: M3Shape.full,
          background: checked ? C.onPrimary : C.outline,
          transition: 'all 0.2s',
        }}></div>
      </div>
    </div>
  );
}

// ── Dialog ─────────────────────────────────────────────────────────
function Dialog({ open, title, body, icon, actions, onClose, colors }) {
  const C = colors;
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.surfaceContainerHigh, borderRadius: M3Shape.xl,
        padding: '24px', width: 280, maxWidth: '90vw',
        boxShadow: M3Elevation[3],
      }}>
        {icon && <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 24, color: C.secondary }}>{icon}</span>
        </div>}
        <div style={{
          fontFamily: 'Roboto, sans-serif', fontSize: 24, fontWeight: 400,
          color: C.onSurface, textAlign: 'center', marginBottom: 16,
        }}>{title}</div>
        <div style={{
          fontFamily: 'Roboto, sans-serif', fontSize: 14, color: C.onSurfaceVariant,
          lineHeight: '20px', marginBottom: 24,
        }}>{body}</div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          {actions.map((a, i) => <Button key={i} label={a.label} variant={a.variant || 'text'} onClick={a.onClick} colors={C} />)}
        </div>
      </div>
    </div>
  );
}

// ── Snackbar ───────────────────────────────────────────────────────
function Snackbar({ open, message, action, onAction, colors }) {
  const C = colors;
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 88, left: '50%', transform: 'translateX(-50%)',
      background: C.inverseSurface, color: C.inverseOnSurface,
      borderRadius: M3Shape.xs, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 16,
      boxShadow: M3Elevation[3], zIndex: 90,
      fontFamily: 'Roboto, sans-serif', fontSize: 14,
      maxWidth: 320, width: 'max-content',
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      {action && <button onClick={onAction} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: C.inversePrimary, fontFamily: 'Roboto, sans-serif',
        fontSize: 14, fontWeight: 500, letterSpacing: '0.1px',
      }}>{action}</button>}
    </div>
  );
}

// ── Divider ────────────────────────────────────────────────────────
function Divider({ colors }) {
  return <div style={{ height: 1, background: (colors || M3Colors).outlineVariant }} />;
}

// Export all to window
Object.assign(window, {
  TopAppBar, IconButton, Button, FAB,
  Card, Chip, TextField,
  ListItem, Avatar,
  NavigationBar, NavigationRail,
  Switch, Dialog, Snackbar, Divider,
});
