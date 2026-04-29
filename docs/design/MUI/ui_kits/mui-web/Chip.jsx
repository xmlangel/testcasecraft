// MUI Chip, Badge, Divider, List components
Object.assign(window, { MuiChip, MuiBadge, MuiDivider, MuiList, MuiListItem, MuiCheckbox, MuiFormControlLabel, MuiPagination });

function MuiChip({ label, onDelete, icon, color = "default", variant = "filled", size = "medium" }) {
  const h = size === "small" ? 24 : 32;
  const fs = size === "small" ? 12 : 13;
  const colors = {
    default: { bg: "rgba(0,0,0,0.08)", color: "rgba(0,0,0,0.87)", border: "none" },
    primary: { bg: "rgba(151,71,255,0.12)", color: "#6B21C7", border: "none" },
    error: { bg: "rgba(211,47,47,0.12)", color: "#D32F2F", border: "none" },
    success: { bg: "rgba(46,125,50,0.12)", color: "#2E7D32", border: "none" },
  };
  const outlined = variant === "outlined";
  const c = colors[color] || colors.default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, height: h,
      padding: `0 ${onDelete ? 6 : 12}px 0 ${icon ? 6 : 12}px`,
      borderRadius: h / 2, fontFamily: "Roboto, sans-serif", fontSize: fs,
      background: outlined ? "transparent" : c.bg, color: c.color,
      border: outlined ? `1px solid ${c.color}66` : "none"
    }}>
      {icon && <span className="material-icons" style={{ fontSize: fs + 4 }}>{icon}</span>}
      {label}
      {onDelete && <span className="material-icons" onClick={onDelete} style={{ fontSize: 16, cursor: "pointer", opacity: 0.6 }}>cancel</span>}
    </span>
  );
}

function MuiBadge({ children, badgeContent, color = "primary" }) {
  const colors = { primary: "#9747FF", error: "#D32F2F", warning: "#EF6C00" };
  const c = colors[color] || color;
  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      {children}
      {badgeContent !== undefined && (
        <span style={{
          position: "absolute", top: -4, right: -8, minWidth: 18, height: 18,
          borderRadius: 9, fontSize: 11, fontWeight: 500, display: "flex", alignItems: "center",
          justifyContent: "center", padding: "0 4px", color: "#fff", background: c,
          fontFamily: "Roboto, sans-serif", boxSizing: "border-box"
        }}>{badgeContent}</span>
      )}
    </div>
  );
}

function MuiDivider({ vertical = false }) {
  return <div style={vertical
    ? { width: 1, background: "rgba(0,0,0,0.12)", alignSelf: "stretch" }
    : { height: 1, background: "rgba(0,0,0,0.12)", width: "100%" }} />;
}

function MuiList({ children, subheader }) {
  return (
    <div style={{ padding: "8px 0" }}>
      {subheader && <div style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.6)", padding: "6px 16px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{subheader}</div>}
      {children}
    </div>
  );
}

function MuiListItem({ primary, secondary, icon, selected, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 16, padding: "8px 16px",
      background: selected ? "rgba(151,71,255,0.08)" : "transparent",
      cursor: onClick ? "pointer" : "default", fontFamily: "Roboto, sans-serif"
    }}>
      {icon && <span className="material-icons" style={{ fontSize: 24, color: selected ? "#9747FF" : "rgba(0,0,0,0.54)" }}>{icon}</span>}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, color: selected ? "#9747FF" : "rgba(0,0,0,0.87)", fontWeight: selected ? 500 : 400 }}>{primary}</div>
        {secondary && <div style={{ fontSize: 14, color: "rgba(0,0,0,0.6)" }}>{secondary}</div>}
      </div>
    </div>
  );
}

function MuiCheckbox({ checked, onChange, label, disabled = false }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.38 : 1, fontFamily: "Roboto, sans-serif", fontSize: 14, color: "rgba(0,0,0,0.87)" }}>
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} style={{ width: 18, height: 18, accentColor: "#9747FF" }} />
      {label}
    </label>
  );
}

function MuiFormControlLabel({ control, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontFamily: "Roboto, sans-serif", fontSize: 14, color: "rgba(0,0,0,0.87)" }}>
      {control}
      {label}
    </label>
  );
}

function MuiPagination({ count = 10, page = 1, onChange }) {
  const pages = [];
  for (let i = 1; i <= count; i++) {
    if (i === 1 || i === count || (i >= page - 1 && i <= page + 1)) pages.push(i);
    else if (pages[pages.length - 1] !== "...") pages.push("...");
  }
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center", justifyContent: "center" }}>
      <button onClick={() => onChange && onChange(page - 1)} disabled={page === 1} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.38 : 1, borderRadius: 16 }}>
        <span className="material-icons" style={{ fontSize: 20 }}>chevron_left</span>
      </button>
      {pages.map((p, i) => (
        <button key={i} onClick={() => p !== "..." && onChange && onChange(p)} style={{
          minWidth: 32, height: 32, borderRadius: 16, border: "none", cursor: p === "..." ? "default" : "pointer",
          background: p === page ? "#9747FF" : "none", color: p === page ? "#fff" : "rgba(0,0,0,0.87)",
          fontFamily: "Roboto, sans-serif", fontSize: 14, fontWeight: p === page ? 500 : 400
        }}>{p}</button>
      ))}
      <button onClick={() => onChange && onChange(page + 1)} disabled={page === count} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", cursor: page === count ? "not-allowed" : "pointer", opacity: page === count ? 0.38 : 1, borderRadius: 16 }}>
        <span className="material-icons" style={{ fontSize: 20 }}>chevron_right</span>
      </button>
    </div>
  );
}
