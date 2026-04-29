// MUI Card Component
Object.assign(window, { MuiCard, MuiPaper, MuiAvatar });

function MuiAvatar({ children, src, size = 40, color = "#9747FF" }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: src ? "transparent" : color,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: size * 0.4, fontWeight: 500, fontFamily: "Roboto, sans-serif",
      overflow: "hidden", flexShrink: 0
    }}>
      {src ? <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" /> : children}
    </div>
  );
}

function MuiCard({ children, elevation = 1, style = {} }) {
  const shadows = {
    0: "none",
    1: "0px 2px 1px -1px rgba(0,0,0,.20),0px 1px 1px 0px rgba(0,0,0,.14),0px 1px 3px 0px rgba(0,0,0,.12)",
    2: "0px 3px 1px -2px rgba(0,0,0,.20),0px 2px 2px 0px rgba(0,0,0,.14),0px 1px 5px 0px rgba(0,0,0,.12)",
    8: "0px 5px 5px -3px rgba(0,0,0,.20),0px 8px 10px 1px rgba(0,0,0,.14),0px 3px 14px 2px rgba(0,0,0,.12)"
  };
  return (
    <div style={{ background: "#fff", borderRadius: 4, boxShadow: shadows[elevation] || shadows[1], overflow: "hidden", ...style }}>
      {children}
    </div>
  );
}

function MuiPaper({ children, elevation = 1, style = {} }) {
  return <MuiCard elevation={elevation} style={style}>{children}</MuiCard>;
}
