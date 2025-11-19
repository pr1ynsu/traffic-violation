// src/pages/Dashboard.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/*
  Generic Dashboard entry point:
  - If not signed in -> /login
  - If signed in and userType === "government" -> /gov/dashboard
  - Otherwise -> /user/dashboard

  This file intentionally only routes to the correct dashboard component.
  The actual dashboards live in:
    - src/pages/User/Dashboard.jsx   (user dashboard)
    - src/pages/Gov/GovDashboard.jsx (government dashboard)
*/

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("current_user");
      if (!raw) {
        // no one signed in -> go to login
        navigate("/login");
        return;
      }

      const user = JSON.parse(raw);

      // guard: if gov -> gov dashboard
      const type = (user.userType || "").toString().trim().toLowerCase();

      if (type === "government" || type === "gov" || type === "admin") {
        navigate("/gov/dashboard");
        return;
      }

      // default -> regular user dashboard
      navigate("/user/dashboard");
    } catch (err) {
      console.error("Dashboard routing error:", err);
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render nothing — this component only redirects.
  return null;
}
