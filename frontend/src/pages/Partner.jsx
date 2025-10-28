import React from "react";
import "./Partner.css";

export default function Partner() {
  return (
    <section id="partner" className="partner-section">
      <div className="partner-container">
        <h2 className="partner-title">Our Partners</h2>
        <p className="partner-description">
          We collaborate with key organizations and stakeholders to ensure
          transparency, efficiency, and innovation in the management of challans
          and public services.
        </p>

        <div className="partner-logos">
          <div className="partner-card">Partner 1</div>
          <div className="partner-card">Partner 2</div>
          <div className="partner-card">Partner 3</div>
        </div>
      </div>
    </section>
  );
}
