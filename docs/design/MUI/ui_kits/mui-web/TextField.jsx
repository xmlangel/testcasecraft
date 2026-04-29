// MUI TextField Component
Object.assign(window, { MuiTextField, MuiSelect });

function MuiTextField({ label, value, onChange, type = "text", error = false, helperText, startAdornment, endAdornment, size = "medium", fullWidth = false, style = {} }) {
  const [focused, setFocused] = React.useState(false);
  const hasValue = value && value.length > 0;
  const labelUp = focused || hasValue;
  const borderColor = error ? "#D32F2F" : focused ? "#9747FF" : "rgba(0,0,0,0.23)";
  const labelColor = error ? "#D32F2F" : focused ? "#9747FF" : "rgba(0,0,0,0.6)";
  const bw = focused ? 2 : 1;
  const ph = size === "small" ? 8 : 14;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", position: "relative", width: fullWidth ? "100%" : "auto", ...style }}>
      <div style={{ position: "relative", borderRadius: 4, border: `${bw}px solid ${borderColor}`, display: "flex", alignItems: "center" }}>
        {startAdornment && <span className="material-icons" style={{ fontSize: 20, color: "rgba(0,0,0,0.54)", marginLeft: 12 }}>{startAdornment}</span>}
        <input
          type={type} value={value} onChange={onChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            border: "none", outline: "none", background: "transparent",
            fontFamily: "Roboto, sans-serif", fontSize: size === "small" ? 14 : 16,
            color: "rgba(0,0,0,0.87)", padding: `${ph}px ${endAdornment ? 4 : 14}px ${ph}px ${startAdornment ? 8 : 14}px`,
            width: "100%", minWidth: 180
          }}
          placeholder={labelUp ? "" : ""}
        />
        {endAdornment && <span className="material-icons" style={{ fontSize: 20, color: "rgba(0,0,0,0.54)", marginRight: 12 }}>{endAdornment}</span>}
        <label style={{
          position: "absolute", left: startAdornment ? 36 : 14, top: labelUp ? -9 : ph,
          fontSize: labelUp ? 12 : (size === "small" ? 14 : 16),
          color: labelColor, background: "#fff", padding: labelUp ? "0 4px" : 0,
          pointerEvents: "none", transition: "all 150ms cubic-bezier(0.4,0,0.2,1)",
          fontFamily: "Roboto, sans-serif"
        }}>{label}</label>
      </div>
      {helperText && <span style={{ fontSize: 12, color: error ? "#D32F2F" : "rgba(0,0,0,0.6)", marginTop: 4, marginLeft: 14, fontFamily: "Roboto, sans-serif" }}>{helperText}</span>}
    </div>
  );
}

function MuiSelect({ label, value, onChange, options = [], size = "medium", fullWidth = false }) {
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", position: "relative", width: fullWidth ? "100%" : "auto" }}>
      <div style={{ position: "relative", borderRadius: 4, border: "1px solid rgba(0,0,0,0.23)" }}>
        <select value={value} onChange={onChange} style={{
          appearance: "none", border: "none", outline: "none", background: "transparent",
          fontFamily: "Roboto, sans-serif", fontSize: size === "small" ? 14 : 16,
          color: "rgba(0,0,0,0.87)", padding: size === "small" ? "8px 36px 8px 14px" : "14px 36px 14px 14px",
          width: fullWidth ? "100%" : "auto", cursor: "pointer"
        }}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span className="material-icons" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "rgba(0,0,0,0.54)", fontSize: 20 }}>arrow_drop_down</span>
        <label style={{ position: "absolute", left: 14, top: -9, fontSize: 12, color: "rgba(0,0,0,0.6)", background: "#fff", padding: "0 4px", fontFamily: "Roboto, sans-serif" }}>{label}</label>
      </div>
    </div>
  );
}
