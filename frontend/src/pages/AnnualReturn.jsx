import React from "react";
import "./annualreturn.css";

export default function AnnualReturn() {
  return (
    <article className="ar-page" aria-labelledby="ar-title">
      <header className="ar-hero" role="banner">
        <h1 id="ar-title" className="ar-title">Annual Return</h1>
        <p className="ar-subtitle">
          A yearly disclosure of compliance, governance, financial standing, and
          operational transparency as required by applicable laws.
        </p>
      </header>

      <main className="ar-content" role="main">

        {/* 1 — Overview */}
        <section className="ar-section" id="overview">
          <h2 className="ar-section-title">1. Overview</h2>
          <p className="ar-text">
            CityWatch Technologies publishes an Annual Return to maintain transparency
            on all legally mandated corporate, financial, and operational activities.
            It outlines the organization’s structure, capital details, key personnel,
            shareholding patterns, compliance status, and operational milestones.
          </p>
        </section>

        <hr className="ar-divider" />

        {/* 2 — Company Details */}
        <section className="ar-section" id="company-info">
          <h2 className="ar-section-title">2. Company Information</h2>
          <ul className="ar-list">
            <li><strong>Registered Name:</strong> CityWatch Technologies Pvt. Ltd.</li>
            <li><strong>Registered Office:</strong> (Auto-filled dynamically if needed)</li>
            <li><strong>Corporate Identification Number (CIN):</strong> Provided as per registration.</li>
            <li><strong>Date of Incorporation:</strong> Recorded under corporate registry.</li>
            <li><strong>Nature of Business:</strong> Urban governance technology & digital enforcement systems.</li>
          </ul>
        </section>

        <hr className="ar-divider" />

        {/* 3 — Directors & Management */}
        <section className="ar-section" id="directors">
          <h2 className="ar-section-title">3. Directors & Key Management Personnel</h2>
          <p className="ar-text">
            The Annual Return includes details of board members and executives
            overseeing operations during the financial year.
          </p>
          <ul className="ar-list">
            <li>Names of directors serving during the year.</li>
            <li>Date of appointment, re-appointment, or resignation.</li>
            <li>Key managerial personnel (CEO, CTO, CFO).</li>
          </ul>
        </section>

        <hr className="ar-divider" />

        {/* 4 — Shareholding Pattern */}
        <section className="ar-section" id="shareholding">
          <h2 className="ar-section-title">4. Shareholding Pattern</h2>
          <p className="ar-text">
            Discloses ownership structure and changes within the financial year.
          </p>
          <ul className="ar-list">
            <li>List of shareholders.</li>
            <li>Percentage of shareholding.</li>
            <li>Changes in ownership or transfers.</li>
          </ul>
        </section>

        <hr className="ar-divider" />

        {/* 5 — Financial Summary */}
        <section className="ar-section" id="financials">
          <h2 className="ar-section-title">5. Financial Summary</h2>
          <p className="ar-text">
            A high-level summary of CityWatch’s financial performance for the
            preceding year, as audited by authorized bodies.
          </p>
          <ul className="ar-list">
            <li>Revenue and operational income.</li>
            <li>Expenses and major allocations.</li>
            <li>Net profit/loss details.</li>
            <li>Audit remarks or statutory disclosures.</li>
          </ul>
        </section>

        <hr className="ar-divider" />

        {/* 6 — Compliance Statement */}
        <section className="ar-section" id="compliance">
          <h2 className="ar-section-title">6. Compliance & Regulatory Filings</h2>
          <p className="ar-text">
            Details of statutory compliance with corporate law, tax systems,
            IT governance, and operational mandates.
          </p>
          <ul className="ar-list">
            <li>Annual corporate filings.</li>
            <li>Regulatory disclosures made to authorities.</li>
            <li>Status of KYC, ROC, and annual e-filings.</li>
            <li>Certifications and inspections completed.</li>
          </ul>
        </section>

        <hr className="ar-divider" />

        {/* 7 — Corporate Governance */}
        <section className="ar-section" id="governance">
          <h2 className="ar-section-title">7. Corporate Governance Principles</h2>
          <p className="ar-text">
            Outlines how CityWatch ensures integrity, transparency, and responsible
            decision-making in its operations.
          </p>
          <ul className="ar-list">
            <li>Board meeting frequency & participation.</li>
            <li>Conflict-of-interest declarations.</li>
            <li>Internal audit processes.</li>
          </ul>
        </section>

        <hr className="ar-divider" />

        {/* 8 — Digital & Data Transparency */}
        <section className="ar-section" id="digital">
          <h2 className="ar-section-title">8. Digital Systems & Data Transparency</h2>
          <p className="ar-text">
            As a gov-tech platform, CityWatch annually reports on data usage,
            verification systems, privacy compliance, and security posture.
          </p>
          <ul className="ar-list">
            <li>Data protection and encryption updates.</li>
            <li>Verification system improvements.</li>
            <li>Security audits passed.</li>
            <li>Transparency in citizen-uploaded evidence handling.</li>
          </ul>
        </section>

        <hr className="ar-divider" />

        {/* 9 — Acknowledgment */}
        <section className="ar-section" id="acknowledgment">
          <h2 className="ar-section-title">9. Declaration & Acknowledgment</h2>
          <p className="ar-text">
            This Annual Return is prepared in accordance with the Companies Act and
            relevant regulatory frameworks. The information is reviewed by authorized
            officers and approved for public disclosure.
          </p>
        </section>
      </main>

      <footer className="ar-footer" role="contentinfo">
        <small className="ar-footnote">
          CityWatch Technologies — Annual Return & Transparency Report.
        </small>
      </footer>
    </article>
  );
}
