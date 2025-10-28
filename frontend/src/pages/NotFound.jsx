// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ minHeight: "80vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
      <div>
        <h1 style={{ fontSize: 48 }}>404</h1>
        <p style={{ fontSize: 20 }}>Page not found.</p>
        <Link to="/">Go home</Link>
      </div>
    </div>
  );
}
