import React, { useState, useEffect } from "react";
import "./Partner.css";

const partnersData = [
  {
    id: 1,
    name: "Toyota",
    logo: "partner1.png",
    devices: 124,
    verifiedViolations: 42,
    rewardPoints: 8560,
    vehicles: 320,
  },
  {
    id: 2,
    name: "Kia",
    logo: "partner2.png",
    devices: 62,
    verifiedViolations: 20,
    rewardPoints: 4120,
    vehicles: 180,
  },
  {
    id: 3,
    name: "Audi",
    logo: "partner3.png",
    devices: 220,
    verifiedViolations: 95,
    rewardPoints: 12640,
    vehicles: 540,
  },
];

export default function Partner() {
  const [active, setActive] = useState(null);
  const [counters, setCounters] = useState({});

  useEffect(() => {
    if (!active) return;

    const target = partnersData.find((p) => p.id === active);
    const duration = 700; // ms
    const frameRate = 30;
    const frames = Math.round((duration / 1000) * frameRate);

    const animate = (key, to) => {
      let frame = 0;
      const from = counters[key] || 0;
      const diff = to - from;
      const id = setInterval(() => {
        frame++;
        const progress = frame / frames;
        const value = Math.round(from + diff * easeOutCubic(progress));
        setCounters((c) => ({ ...c, [key]: value }));
        if (frame >= frames) clearInterval(id);
      }, 1000 / frameRate);
    };

    if (target) {
      animate("devices", target.devices);
      animate("verifiedViolations", target.verifiedViolations);
      animate("rewardPoints", target.rewardPoints);
      animate("vehicles", target.vehicles);
    }

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }
  }, [active]);

  return (
    <section id="partner" className="partner-section">
      <div className="partner-container">
        <h2 className="partner-title">Our Partners</h2>
        <p className="partner-description">
          We collaborate with key organizations and stakeholders to ensure
          transparency, efficiency, and innovation in the management of challans
          and public services.
        </p>

        {/* Partner Logos */}
        <div className="partner-logos" role="list">
          {partnersData.map((p) => (
            <button
              key={p.id}
              role="listitem"
              aria-pressed={active === p.id}
              className={`partner-card ${active === p.id ? "is-active" : ""}`}
              onClick={() => setActive(active === p.id ? null : p.id)}
              title={p.name}
            >
              <img
                src={`/partner/${p.logo}`}
                alt={`${p.name} logo`}
                className="partner-logo-img"
                width="160"
                height="60"
                loading="lazy"
              />
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div className={`partner-detail ${active ? "open" : ""}`} aria-hidden={!active}>
          {active && (
            <div className="partner-detail-inner">
              <div className="partner-detail-head">
                <img
                  src={`/partner/${partnersData.find((p) => p.id === active).logo}`}
                  alt=""
                  className="partner-detail-logo"
                />
                <h3 className="partner-detail-title">
                  {partnersData.find((p) => p.id === active).name}
                </h3>
              </div>

              <div className="partner-stats" role="list">
                <Stat label="Active Devices" value={counters.devices ?? 0} />
                <Stat label="Verified Violations" value={counters.verifiedViolations ?? 0} />
                <Stat label="Reward Points" value={counters.rewardPoints ?? 0} />
                <Stat label="Vehicles" value={counters.vehicles ?? 0} />
              </div>

              <div className="partner-detail-footer">
                <p>
                  Quick summary and actions could go here. For a more immersive
                  experience, you can later turn this into a modal or drawer.
                </p>
                <div className="partner-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => alert("Open company dashboard (placeholder)")}
                  >
                    View Dashboard
                  </button>
                  <button className="btn btn-outline" onClick={() => setActive(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat" role="listitem" aria-label={`${label}: ${value.toLocaleString()}`}>
      <div className="stat-value">{value.toLocaleString()}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}