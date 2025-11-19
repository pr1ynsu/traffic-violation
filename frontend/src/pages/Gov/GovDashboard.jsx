// src/pages/Gov/GovDashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../dashboard.css"; // reuse the main dashboard styles

/*
  Government Dashboard
  - Left: editable profile + photo upload
  - Right: read-only profile summary (reflects saved changes)
  - Bottom: curved nav (Challan / Credits / Violations)
*/

function saveProfileToSavedProfiles(user) {
  if (!user) return;
  try {
    const raw = localStorage.getItem("saved_profiles") || "[]";
    const arr = JSON.parse(raw);
    const existsIndex = arr.findIndex(
      (p) => (p.id && user.id && p.id === user.id) || (p.email && user.email && p.email === user.email)
    );
    const toSave = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      userType: user.userType || "Government",
      avatar: user.avatar || null
    };
    if (existsIndex >= 0) {
      arr.splice(existsIndex, 1);
    }
    arr.unshift(toSave);
    localStorage.setItem("saved_profiles", JSON.stringify(arr.slice(0, 8)));
  } catch (err) {
    console.error("saveProfileToSavedProfiles error", err);
  }
}

export default function GovDashboard() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [gov, setGov] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    department: "",
    office: "",
    avatar: null
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("current_user");
      if (!raw) {
        navigate("/login");
        return;
      }
      const parsed = JSON.parse(raw);
      // protect route: only government users allowed
      if ((parsed.userType || "").toString().toLowerCase() !== "government") {
        // if it's a normal user, send to user dashboard instead
        navigate("/user/dashboard");
        return;
      }
      setGov(parsed);
      setForm({
        name: parsed.name || "",
        email: parsed.email || "",
        mobile: parsed.mobile || "",
        department: parsed.userType || "",
        office: parsed.address || "",
        avatar: parsed.avatar || null
      });
    } catch (err) {
      console.error("GovDashboard load error:", err);
      navigate("/login");
    }
    // eslint-disable-next-line
  }, []);

  function updateField(field, value) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  function handleImageChoose(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setForm((p) => ({ ...p, avatar: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

  function triggerFile() {
    fileInputRef.current?.click();
  }

  function persistProfile(updated) {
    // update current_user
    localStorage.setItem("current_user", JSON.stringify(updated));
    // update saved_profiles
    saveProfileToSavedProfiles(updated);
    // notify navbar/other components
    window.dispatchEvent(new Event("userChanged"));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedGov = {
        ...gov,
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        userType: form.department,
        address: form.office,
        avatar: form.avatar || null
      };

      // persist locally (mock)
      persistProfile(updatedGov);

      // set state
      setGov(updatedGov);

      // small delay to show saved state
      await new Promise((r) => setTimeout(r, 350));
    } catch (err) {
      console.error("save error", err);
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    // remove current_user but keep saved_profiles (optionally)
    localStorage.removeItem("token");
    localStorage.removeItem("current_user");
    window.dispatchEvent(new Event("userChanged"));
    navigate("/login");
  }

  if (!gov) return null;

  return (
    <div className="user-dashboard-page">
      <div className="dashboard-wrap">

        <aside className="left-pane glass-box">
          <div className="avatar-block">
            {form.avatar ? (
              <img src={form.avatar} alt="avatar" className="avatar-img" />
            ) : (
              <div className="avatar-initial">{(form.name || form.email || "G").trim()[0]?.toUpperCase()}</div>
            )}

            <div className="avatar-actions">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChoose}
              />
              <button className="btn" onClick={triggerFile}>Upload Photo</button>
              <button
                className="btn ghost"
                onClick={() => { setForm((p) => ({ ...p, avatar: null })); }}
              >
                Remove
              </button>
            </div>
          </div>

          <form className="edit-form" onSubmit={handleSave}>
            <label>
              Full name
              <input value={form.name} onChange={(e) => updateField("name", e.target.value)} />
            </label>

            <label>
              Email
              <input value={form.email} onChange={(e) => updateField("email", e.target.value)} />
            </label>

            <label>
              Mobile
              <input value={form.mobile} onChange={(e) => updateField("mobile", e.target.value)} />
            </label>

            <label>
              Department / Role
              <input value={form.department} onChange={(e) => updateField("department", e.target.value)} />
            </label>

            <label>
              Office / Address
              <input value={form.office} onChange={(e) => updateField("office", e.target.value)} />
            </label>

            <div className="form-actions">
              <button type="submit" className="btn primary" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
              <button type="button" className="btn ghost" onClick={handleLogout}>Log out</button>
            </div>
          </form>
        </aside>

        <main className="right-pane">
          <div className="profile-summary glass-box">
            <h2>Profile Summary</h2>

            <div className="summary-grid">
              <div className="summary-item">
                <div className="label">Full name</div>
                <div className="value">{gov.name || "—"}</div>
              </div>

              <div className="summary-item">
                <div className="label">Email</div>
                <div className="value">{gov.email || "—"}</div>
              </div>

              <div className="summary-item">
                <div className="label">Mobile</div>
                <div className="value">{gov.mobile || "—"}</div>
              </div>

              <div className="summary-item">
                <div className="label">Department / Role</div>
                <div className="value">{gov.userType || "—"}</div>
              </div>

              <div className="summary-item">
                <div className="label">Office / Address</div>
                <div className="value">{gov.address || "—"}</div>
              </div>

              <div className="summary-item">
                <div className="label">User type</div>
                <div className="value">{gov.userType || "Government"}</div>
              </div>

              <div className="summary-item">
                <div className="label">ID</div>
                <div className="value">{gov.id || "—"}</div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* bottom nav */}
      <nav className="bottom-nav glass-box bottom-nav-curve">
        <button className="nav-item" onClick={() => navigate("/gov/challan")}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M3 13h18v-2H3v2zm0 6h18v-2H3v2zM3 7h18V5H3v2z"/></svg>
          <span>Challan</span>
        </button>

        <button className="nav-item" onClick={() => navigate("/gov/credits")}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 1L3 5v6c0 5.25 3.87 10.74 9 12 5.13-1.26 9-6.75 9-12V5l-9-4zM11 10h2v6h-2zM11 7h2v2h-2z"/></svg>
          <span>Credits</span>
        </button>

        <button className="nav-item" onClick={() => navigate("/gov/violations")}>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon" viewBox="0 0 24 24"><path fill="currentColor" d="M1 21h22L12 2 1 21zM12 16a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0-7v5h1V9h-1z"/></svg>
          <span>Violations</span>
        </button>
      </nav>
    </div>
  );
}
