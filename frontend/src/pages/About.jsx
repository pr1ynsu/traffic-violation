import React from "react";
import "./About.css";

export default function About() {
  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <h2 className="about-title">About Our Platform</h2>
        <p className="about-description">
          Our platform is a comprehensive digital solution designed to
          streamline the management of challans, improve transparency, and
          enhance user experience for both citizens and government authorities.
        </p>

        <div className="about-content">
          <div className="about-card">
            <h3>Efficiency</h3>
            <p>
              Automating challan processes reduces paperwork, minimizes delays,
              and ensures faster service delivery.
            </p>
          </div>
          <div className="about-card">
            <h3>Transparency</h3>
            <p>
              Citizens can track their challan status and history in real time,
              ensuring fairness and accountability.
            </p>
          </div>
          <div className="about-card">
            <h3>Security</h3>
            <p>
              Our system uses secure authentication methods to protect sensitive
              data and prevent unauthorized access.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
