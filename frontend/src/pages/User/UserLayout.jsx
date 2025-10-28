// src/pages/User/UserLayout.jsx
import React from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import Violations from "./Violations";
import Credits from "./Credits";
import Challan from "./Challan";

export default function UserLayout() {
  return (
    <div style={{ padding: 18 }}>
      <div style={{ background: "#072b66", color: "#fff", padding: 12, borderRadius: 8, marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>User Dashboard</h2>
        <div style={{ opacity: 0.9 }}>Your personal vehicle records</div>
      </div>

      <nav style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <NavLink to="violations">Violations</NavLink>
        <NavLink to="credits">Credits</NavLink>
        <NavLink to="challan">All Challan</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="violations" replace />} />
        <Route path="violations" element={<Violations />} />
        <Route path="credits" element={<Credits />} />
        <Route path="challan" element={<Challan />} />
      </Routes>
    </div>
  );
}
