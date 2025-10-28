// src/components/RecordsTable.jsx
import React, { useEffect, useState } from "react";

/*
Props:
  - columns: [{ key, label, render?(row) }]
  - fetcher: async ({ type, owner, page, q }) => ({ data, meta })
  - type: 'violations' | 'credits' | 'all'
  - role: 'user' | 'gov'
*/
export default function RecordsTable({ columns, fetcher, type = "violations", role = "user" }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const owner = role === "user" ? "me" : undefined;
      const res = await fetcher({ type, owner, page, q });
      setRows(res.data || []);
      setMeta(res.meta || null);
    } catch (e) {
      console.error("Fetch failed", e);
      setRows([]);
      setMeta(null);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [type, role, page]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search vehicle / violation / owner"
          style={{ padding: 8, flex: 1, marginRight: 12 }}
        />
        <div>
          <button onClick={load} style={{ marginRight: 8 }}>Refresh</button>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
          <span style={{ margin: "0 8px" }}>Page {page}</span>
          <button onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      </div>

      <div style={{ background: "#0b1f3a", padding: 12, borderRadius: 8 }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "8px" }}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ color: "#f3e8d7", fontWeight: 700, textAlign: "left", padding: "8px 12px" }}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length} style={{ padding: 20 }}>Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={columns.length} style={{ padding: 20 }}>No records</td></tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={r.id || idx}>
                  {columns.map((c) => (
                    <td key={c.key} style={{ background: "rgba(255,255,255,0.03)", padding: 12, borderRadius: 8 }}>
                      {c.render ? c.render(r) : (r[c.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {meta && (
        <div style={{ marginTop: 10, color: "#ddd", fontSize: 13 }}>
          Total: {meta.total} • Page size: {meta.pageSize}
        </div>
      )}
    </div>
  );
}
