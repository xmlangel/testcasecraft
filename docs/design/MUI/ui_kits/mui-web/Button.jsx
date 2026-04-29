// MUI Button Component
Object.assign(window, { MuiButton, MuiFab, MuiIconButton });

function MuiButton({ children, variant = "contained", color = "primary", size = "medium", disabled = false, startIcon, onClick, fullWidth = false, style = {} }) {
  const colors = {
    primary: "#9747FF", secondary: "#9C27B0", error: "#D32F2F",
    success: "#2E7D32", warning: "#EF6C00", info: "#0288D1", inherit: "rgba(0,0,0,0.87)"
  };
  const c = colors[color] || color;
  const sizes = { small: { padding: "4px 10px", fontSize: 13 }, medium: { padding: "6px 16px", fontSize: 14 }, large: { padding: "8px 22px", fontSize: 15 } };
  const sz = sizes[size];
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    border: "none", borderRadius: 4, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "Roboto, sans-serif", fontWeight: 500, letterSpacing: "0.4px",
    textTransform: "uppercase", transition: "all 250ms cubic-bezier(0.4,0,0.2,1)",
    opacity: disabled ? 0.38 : 1, width: fullWidth ? "100%" : "auto",
    ...sz, ...style
  };
  const variants = {
    contained: { background: c, color: "#fff", boxShadow: "0px 3px 1px -2px rgba(0,0,0,.20),0px 2px 2px 0px rgba(0,0,0,.14),0px 1px 5px 0px rgba(0,0,0,.12)" },
    outlined: { background: "transparent", color: c, border: `1px solid ${c}66`, padding: `${parseInt(sz.padding)-1}px ${parseInt(sz.padding.split(" ")[1])-1}px` },
    text: { background: "transparent", color: c }
  };
  return (
    <button onClick={!disabled ? onClick : undefined} style={{ ...base, ...variants[variant] }}>
      {startIcon && <span className="material-icons" style={{ fontSize: 18 }}>{startIcon}</span>}
      {children}
    </button>
  );
}

function MuiFab({ icon = "add", color = "primary", size = "medium", onClick }) {
  const colors = { primary: "#9747FF", secondary: "#9C27B0" };
  const c = colors[color] || color;
  const sz = size === "small" ? 40 : size === "large" ? 64 : 56;
  return (
    <button onClick={onClick} style={{
      width: sz, height: sz, borderRadius: "50%", background: c, color: "#fff",
      border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0px 3px 5px -1px rgba(0,0,0,.20),0px 6px 10px 0px rgba(0,0,0,.14),0px 1px 18px 0px rgba(0,0,0,.12)"
    }}>
      <span className="material-icons" style={{ fontSize: size === "small" ? 20 : 24 }}>{icon}</span>
    </button>
  );
}

function MuiIconButton({ icon, color = "default", onClick, size = 40 }) {
  const c = color === "primary" ? "#9747FF" : color === "inherit" ? "inherit" : "rgba(0,0,0,0.54)";
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: "50%", background: "none", border: "none",
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: c
    }}>
      <span className="material-icons" style={{ fontSize: 24 }}>{icon}</span>
    </button>
  );
}
