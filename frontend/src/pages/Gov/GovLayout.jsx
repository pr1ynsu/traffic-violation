// src/pages/Gov/GovLayout.jsx
import React from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import Violations from "./Violations";
import Credits from "./Credits";
import Challan from "./Challan";

export default function GovLayout() {
  return (
    <div style={{ padding: 18 }}>
      <div style={{ background: "#041836", color: "#fff", padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Government Dashboard</h2>
        <div style={{ opacity: 0.85 }}>View all registered vehicles and owners</div>
      </div>

      <nav style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <NavLink to="violations">Violations</NavLink>
        <NavLink to="credits">Credits</NavLink>
        <NavLink to="all">All Challan</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="all" replace />} />
        <Route path="violations" element={<Violations />} />
        <Route path="credits" element={<Credits />} />
        <Route path="all" element={<Challan />} />
      </Routes>
    </div>
  );
}
