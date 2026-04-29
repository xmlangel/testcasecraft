// MUI Dialog component
Object.assign(window, { MuiDialog, MuiSnackbar });

function MuiDialog({ open, title, children, actions, onClose, maxWidth = 600 }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} />
      <div style={{
        position: "relative", background: "#fff", borderRadius: 4, maxWidth, width: "90%",
        boxShadow: "0px 11px 15px -7px rgba(0,0,0,.20),0px 24px 38px 3px rgba(0,0,0,.14),0px 9px 46px 8px rgba(0,0,0,.12)",
        display: "flex", flexDirection: "column", maxHeight: "90vh"
      }}>
        {title && <div style={{ padding: "20px 24px 12px", fontFamily: "Roboto, sans-serif", fontSize: 20, fontWeight: 500, color: "rgba(0,0,0,0.87)" }}>{title}</div>}
        <div style={{ padding: "8px 24px 20px", fontFamily: "Roboto, sans-serif", fontSize: 16, color: "rgba(0,0,0,0.6)", lineHeight: 1.5, overflowY: "auto" }}>{children}</div>
        {actions && <div style={{ padding: "8px", display: "flex", justifyContent: "flex-end", gap: 8, borderTop: "1px solid rgba(0,0,0,0.12)" }}>{actions}</div>}
      </div>
    </div>
  );
}

function MuiSnackbar({ open, message, action, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 1400,
      background: "rgb(50,50,50)", color: "#fff", borderRadius: 4, padding: "12px 16px",
      display: "flex", alignItems: "center", gap: 16, minWidth: 280,
      boxShadow: "0px 3px 5px -1px rgba(0,0,0,.20),0px 6px 10px 0px rgba(0,0,0,.14),0px 1px 18px 0px rgba(0,0,0,.12)",
      fontFamily: "Roboto, sans-serif", fontSize: 14
    }}>
      <span style={{ flex: 1 }}>{message}</span>
      {action && <button onClick={action.onClick} style={{ background: "none", border: "none", color: "#C19EFF", cursor: "pointer", fontFamily: "Roboto, sans-serif", fontSize: 14, fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>{action.label}</button>}
      {onClose && <span className="material-icons" onClick={onClose} style={{ cursor: "pointer", fontSize: 20, opacity: 0.7 }}>close</span>}
    </div>
  );
}
