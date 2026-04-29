// MUI DataTable component
Object.assign(window, { MuiDataTable });

function MuiDataTable({ columns = [], rows = [], onRowClick }) {
  const [sortCol, setSortCol] = React.useState(null);
  const [sortDir, setSortDir] = React.useState("asc");

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("asc"); }
  };

  const sorted = [...rows].sort((a, b) => {
    if (!sortCol) return 0;
    const av = a[sortCol], bv = b[sortCol];
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div style={{ background: "#fff", borderRadius: 4, boxShadow: "0px 2px 1px -1px rgba(0,0,0,.20),0px 1px 1px 0px rgba(0,0,0,.14),0px 1px 3px 0px rgba(0,0,0,.12)", overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.12)" }}>
            {columns.map(col => (
              <th key={col.key} onClick={() => col.sortable !== false && handleSort(col.key)}
                style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.6)", fontFamily: "Roboto, sans-serif", whiteSpace: "nowrap", cursor: col.sortable !== false ? "pointer" : "default", userSelect: "none" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {col.label}
                  {col.sortable !== false && <span className="material-icons" style={{ fontSize: 16, opacity: sortCol === col.key ? 1 : 0.3, transform: sortCol === col.key && sortDir === "desc" ? "rotate(180deg)" : "none" }}>arrow_upward</span>}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, ri) => (
            <tr key={ri} onClick={() => onRowClick && onRowClick(row)}
              style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", cursor: onRowClick ? "pointer" : "default" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.04)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {columns.map(col => (
                <td key={col.key} style={{ padding: "12px 16px", fontSize: 14, color: "rgba(0,0,0,0.87)", fontFamily: "Roboto, sans-serif" }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
