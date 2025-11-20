// src/components/RecordsTable.jsx
import React, { useEffect, useState, useCallback } from "react";
import "./RecordsTable.css"; // optional: lightweight styles (see note below)

/*
 Props:
  - columns: [{ key, label }]
  - fetcher?: async function ({ role, user, type }) => array of rows
  - type: optional string passed to fetcher
  - role: optional string passed to fetcher
 Behavior:
  - Reads current_user from localStorage
  - Loads rows (via fetcher or backend)
  - Filters rows for the user's vehicle number(s) or license
  - Renders a table. Clicking a row opens an image modal (proof image)
*/

export default function RecordsTable({ columns = [], fetcher = null, type = "all", role = "user" }) {
  const [user, setUser] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState({ open: false, src: null, id: null, row: null });

  const loadUser = useCallback(() => {
    try {
      const raw = localStorage.getItem("current_user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    setUser(loadUser());
  }, [loadUser]);

  // helper: normalize vehicle strings to compare
  function normalizeVehicle(v) {
    if (!v && v !== 0) return "";
    return String(v).replace(/\s+/g, "").toLowerCase();
  }

  // helper: determine whether a row belongs to the current user
  function belongsToUser(row, current) {
    if (!current) return false;
    const userVehicles = [];
    if (current.vehicle) {
      // allow comma-separated vehicle list
      current.vehicle.toString().split(",").forEach(s => {
        const t = s.trim();
        if (t) userVehicles.push(normalizeVehicle(t));
      });
    }
    const userLicenses = [];
    if (current.license) userLicenses.push(String(current.license).trim().toLowerCase());
    // row may use different keys for vehicle/license — try a few common ones
    const rowVehicle = normalizeVehicle(row.vehicle_number || row.vehicle || row.vehicleNo || row.vehicle_no || row.vehicle_number_raw);
    const rowLicense = (row.license || row.driving_license || row.license_no || row.licenseNumber || "").toString().trim().toLowerCase();

    // If user has a license and it matches row license -> true
    if (userLicenses.length && rowLicense && userLicenses.includes(rowLicense)) return true;

    // If user vehicle matches row vehicle -> true
    if (userVehicles.length && rowVehicle) {
      if (userVehicles.includes(rowVehicle)) return true;
      // try loose match (last 4 digits)
      const rv = rowVehicle.slice(-4);
      if (rv && userVehicles.some(u => u.endsWith(rv))) return true;
    }

    return false;
  }

  // Resolve proof image URL for a row
  function resolveProofUrl(row) {
    // priority: explicit proof_image field -> paths commonly used by project -> API endpoints
    if (row.proof_image) return row.proof_image;
    if (row.proofImage) return row.proofImage;
    if (row.image) return row.image;
    const id = row.id || row.record_id || row._id;
    if (id) {
      // try common server paths (adjust if your backend differs)
      return `/proof_images/${id}.jpg`;
    }
    // last resort: try vehicle+timestamp filename (not guaranteed)
    return null;
  }

  useEffect(() => {
    let mounted = true;
    async function fetchRows() {
      setLoading(true);
      setError(null);
      try {
        const cur = loadUser();
        // If custom fetcher provided, call it
        let fetched = [];
        if (typeof fetcher === "function") {
          // allow fetcher to accept an object with context
          fetched = await fetcher({ role, user: cur, type });
        } else {
          // fallback: try backend endpoints
          // prefer license-based endpoint if license present
          const license = cur?.license;
          const vehicle = cur?.vehicle;
          if (license) {
            const ep = `/api/violations/license/${encodeURIComponent(String(license))}`;
            const res = await fetch(ep);
            if (!res.ok) throw new Error(`Failed loading violations for license: ${res.status}`);
            fetched = await res.json();
          } else if (vehicle) {
            // try vehicle endpoint (if exists)
            const ep = `/api/violations/vehicle/${encodeURIComponent(String(vehicle))}`;
            const res = await fetch(ep);
            if (res.ok) {
              fetched = await res.json();
            } else {
              // fallback to all violations and filter client-side
              const res2 = await fetch(`/api/violations`);
              if (!res2.ok) throw new Error("Failed loading violations");
              fetched = await res2.json();
            }
          } else {
            // no user identifiers — load all and filter (will be empty)
            const res = await fetch(`/api/violations`);
            if (!res.ok) throw new Error("Failed loading violations");
            fetched = await res.json();
          }
        }

        if (!Array.isArray(fetched)) {
          // perhaps backend returns { data: [...] }
          if (fetched && Array.isArray(fetched.data)) fetched = fetched.data;
          else fetched = [];
        }

        // filter to rows belonging to user
        const filtered = (fetched || []).filter((r) => belongsToUser(r, cur));
        if (!mounted) return;
        setRows(filtered);
      } catch (err) {
        console.error("RecordsTable load error:", err);
        if (mounted) setError(err.message || "Failed to load records");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchRows();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, role, type]);

  function openImage(row) {
    const src = resolveProofUrl(row);
    if (!src) {
      setModal({ open: true, src: null, id: row.id, row });
      return;
    }
    setModal({ open: true, src, id: row.id || null, row });
  }

  function closeModal() {
    setModal({ open: false, src: null, id: null, row: null });
  }

  // keyboard ESC to close
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") closeModal();
    }
    if (modal.open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal.open]);

  return (
    <div className="records-table-wrap">
      {loading && <div className="rt-loading">Loading violations…</div>}
      {error && <div className="rt-error">Error: {error}</div>}

      {!loading && !error && rows.length === 0 && (
        <div className="rt-empty">No violations found for your registered vehicle(s).</div>
      )}

      {!loading && !error && rows.length > 0 && (
        <table className="records-table" role="table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id || r._id || `${r.vehicle_number}-${r.timestamp}`} onClick={() => openImage(r)} style={{ cursor: "pointer" }}>
                {columns.map((c) => {
                  // support nested keys and a few common field names
                  const val =
                    r[c.key] ??
                    r[c.key.toLowerCase()] ??
                    r[c.key.replace(/\s+/g, "_").toLowerCase()] ??
                    r.vehicle_number ??
                    r.challan_rupees ??
                    r.violation_text ??
                    "";
                  return <td key={c.key} title={String(val ?? "")}>{String(val ?? "")}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Image modal */}
      {modal.open && (
        <div
          className="rt-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="rt-modal">
            <button className="rt-modal-close" onClick={closeModal} aria-label="Close">✕</button>
            <div className="rt-modal-body">
              {modal.src ? (
                // use img with natural size fit
                <img src={modal.src} alt={`proof-${modal.id || ""}`} style={{ maxWidth: "100%", maxHeight: "80vh", display: "block", margin: "0 auto" }} />
              ) : (
                <div className="rt-no-image">
                  <div>No proof image available</div>
                  <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{JSON.stringify(modal.row || {}, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
