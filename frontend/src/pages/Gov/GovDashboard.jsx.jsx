// src/pages/Gov/GovDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../dashboard.css"; // reuse same styles

export default function GovDashboard() {
  const navigate = useNavigate();
  const [gov, setGov] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("current_user");
      if (!raw) {
        navigate("/login");
        return;
      }
      const parsed = JSON.parse(raw);
      // simple guard: redirect non-government users
      if ((parsed.userType || "").toLowerCase() !== "government") {
        // if it's a normal user, send to user dashboard instead
        navigate("/user/dashboard");
        return;
      }
      setGov(parsed);
    } catch (err) {
      console.error(err);
      navigate("/login");
    }
    // eslint-disable-next-line
  }, []);

  if (!gov) return null;

  const Row = ({ label, value }) => (
    <div className="info-row">
      <div className="info-label">{label}</div>
      <div className="info-value">{value ?? "—"}</div>
    </div>
  );

  return (
    <div className="dashboard-page">
      <header className="dash-header glass-box">
        <div className="dash-left">
          <div className="big-initial">{(gov.name||gov.email||"G").trim()[0]?.toUpperCase()}</div>
          <div className="user-meta">
            <div className="user-name">{gov.name || "Government"}</div>
            <div className="user-email">{gov.email}</div>
          </div>
        </div>
        <div className="dash-right">
          <div className="user-type">Government</div>
        </div>
      </header>

      <main className="dash-main glass-box">
        <h2>Profile Details (Government)</h2>
        <div className="info-grid">
          <Row label="Name" value={gov.name} />
          <Row label="Email" value={gov.email} />
          <Row label="Mobile" value={gov.mobile} />
          <Row label="Department / Role" value={gov.userType} />
          <Row label="ID" value={gov.id} />
          {/* Add other gov-specific fields if any */}
        </div>
      </main>

      <nav className="bottom-nav glass-box bottom-nav-curve">
        <button className="nav-item" onClick={() => navigate("/gov/challan")}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M3 13h18v-2H3v2zm0 6h18v-2H3v2zM3 7h18V5H3v2z"/></svg>
          <span>Challan</span>
        </button>

        <button className="nav-item" onClick={() => navigate("/gov/credits")}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1L3 5v6c0 5.25 3.87 10.74 9 12 5.13-1.26 9-6.75 9-12V5l-9-4zM11 10h2v6h-2zM11 7h2v2h-2z"/></svg>
          <span>Credits</span>
        </button>

        <button className="nav-item" onClick={() => navigate("/gov/violation")}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M1 21h22L12 2 1 21zM12 16a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0-7v5h1V9h-1z"/></svg>
          <span>Violation</span>
        </button>
      </nav>
    </div>
  );
}
