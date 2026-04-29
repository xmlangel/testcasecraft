// MUI AppBar Component
Object.assign(window, { MuiAppBar });

function MuiAppBar({ title = "App", onMenuClick, actions = [], color = "primary" }) {
  const bg = color === "primary" ? "#9747FF" : color === "white" ? "#fff" : color;
  const fg = color === "white" ? "rgba(0,0,0,0.87)" : "#fff";
  return (
    <div style={{
      background: bg, color: fg, height: 64, display: "flex", alignItems: "center",
      padding: "0 16px", gap: 8, flexShrink: 0,
      boxShadow: "0px 2px 4px -1px rgba(0,0,0,.20),0px 4px 5px 0px rgba(0,0,0,.14),0px 1px 10px 0px rgba(0,0,0,.12)",
      zIndex: 100, position: "relative"
    }}>
      <button onClick={onMenuClick} style={{ background: "none", border: "none", color: fg, cursor: "pointer", padding: 4, borderRadius: "50%", display: "flex" }}>
        <span className="material-icons" style={{ fontSize: 24 }}>menu</span>
      </button>
      <span style={{ fontFamily: "Roboto", fontSize: 20, fontWeight: 500, letterSpacing: "0.15px", flex: 1 }}>{title}</span>
      {actions.map((a, i) => (
        <button key={i} onClick={a.onClick} style={{ background: "none", border: "none", color: fg, cursor: "pointer", padding: 4, borderRadius: "50%", display: "flex" }}>
          <span className="material-icons" style={{ fontSize: 24 }}>{a.icon}</span>
        </button>
      ))}
    </div>
  );
}
