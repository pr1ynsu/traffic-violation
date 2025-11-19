// src/pages/SwitchUser.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SwitchUser.css";

function readSavedProfiles() {
  try {
    return JSON.parse(localStorage.getItem("saved_profiles") || "[]");
  } catch {
    return [];
  }
}

export default function SwitchUser() {
  const navigate = useNavigate();
  const [savedProfiles, setSavedProfiles] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    reload();
    // eslint-disable-next-line
  }, []);

  function reload() {
    const arr = readSavedProfiles();
    setSavedProfiles(arr);
    try {
      setCurrent(JSON.parse(localStorage.getItem("current_user")));
    } catch {
      setCurrent(null);
    }
  }

  function goToDashboardForProfile(profile) {
    // decide which dashboard route the profile should go to
    try {
      const type = (profile.userType || "").toString().trim().toLowerCase();
      if (type === "government" || type === "gov" || type === "admin") {
        navigate("/gov/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      console.error("goToDashboardForProfile error:", err);
      navigate("/user/dashboard");
    }
  }

  function handleSwitch(profile) {
    // set as current user
    localStorage.setItem("current_user", JSON.stringify(profile));
    // optionally set a token for mock flows
    if (!localStorage.getItem("token")) {
      localStorage.setItem("token", `mock-token-${profile.id || profile.email}`);
    }
    // move switched profile to top of saved_profiles
    const arr = readSavedProfiles().filter(
      (p) =>
        !(
          (p.id && profile.id && p.id === profile.id) ||
          (p.email && profile.email && p.email === profile.email)
        )
    );
    arr.unshift(profile);
    localStorage.setItem("saved_profiles", JSON.stringify(arr.slice(0, 8)));
    // notify other parts of app
    window.dispatchEvent(new Event("userChanged"));
    // go to correct dashboard for the switched profile
    goToDashboardForProfile(profile);
  }

  function handleDelete(profile) {
    if (!window.confirm(`Remove saved profile ${profile.name || profile.email}?`)) return;
    const arr = readSavedProfiles().filter(
      (p) =>
        !(
          (p.id && profile.id && p.id === profile.id) ||
          (p.email && profile.email && p.email === profile.email)
        )
    );
    localStorage.setItem("saved_profiles", JSON.stringify(arr));
    // if deleting current user, also clear current_user and token and go to login
    try {
      const cur = JSON.parse(localStorage.getItem("current_user"));
      if (
        cur &&
        ((cur.id && profile.id && cur.id === profile.id) ||
          (cur.email && profile.email && cur.email === profile.email))
      ) {
        localStorage.removeItem("current_user");
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("userChanged"));
        navigate("/login");
        return;
      }
    } catch (err) {
      // ignore
    }
    reload();
  }

  function handleAddAccount() {
    navigate("/login");
  }

  return (
    <div className="switch-page">
      <div className="switch-container glass-box">
        <h1>Switch User</h1>

        <section className="current-section">
          <h2>Current Account</h2>
          {current ? (
            <div className="profile-row current-profile">
              <div className="initial">{(current.name || current.email || "").trim()[0]?.toUpperCase()}</div>
              <div className="meta">
                <div className="name">{current.name}</div>
                <div className="email">{current.email}</div>
              </div>
              <div className="actions">
                <button
                  className="btn ghost"
                  onClick={() => {
                    localStorage.removeItem("current_user");
                    localStorage.removeItem("token");
                    window.dispatchEvent(new Event("userChanged"));
                    navigate("/login");
                  }}
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="empty">No user currently signed in.</div>
          )}
        </section>

        <section className="others-section">
          <div className="section-header">
            <h2>Saved Profiles</h2>
            <button className="btn primary" onClick={handleAddAccount}>
              Add / Log in as new
            </button>
          </div>

          {savedProfiles && savedProfiles.length ? (
            <div className="profiles-list">
              {savedProfiles.map((p, idx) => (
                <div className="profile-row" key={`${p.id || p.email}-${idx}`}>
                  <div className="initial">{(p.name || p.email || "").trim()[0]?.toUpperCase()}</div>
                  <div className="meta">
                    <div className="name">{p.name}</div>
                    <div className="email">{p.email}</div>
                  </div>
                  <div className="actions">
                    <button className="btn" onClick={() => handleSwitch(p)}>
                      Switch
                    </button>
                    <button className="btn danger" onClick={() => handleDelete(p)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">No saved profiles — add one by logging in.</div>
          )}
        </section>
      </div>
    </div>
  );
}
