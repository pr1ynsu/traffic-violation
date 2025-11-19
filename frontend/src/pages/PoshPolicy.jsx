// File: PoshPolicy.jsx
import React from "react";
import "./poshPolicy.css";

export default function PoshPolicy({
  lastUpdated = "November 19, 2025",
  contactEmail = "hr@citywatch.example",
}) {
  return (
    <article className="posh-page" aria-labelledby="posh-title" role="article">
      <header className="posh-hero" role="banner">
        <h1 id="posh-title" className="posh-title">POSH Policy</h1>
        <p className="posh-lead">
          CityWatch is committed to a safe, inclusive, and respectful workplace.
          This policy implements Prevention of Sexual Harassment (POSH) guidelines,
          with reporting, investigation and support processes.
        </p>
      </header>

      <main className="posh-content" role="main">
        <section className="posh-section" aria-labelledby="scope-heading">
          <h2 id="scope-heading" className="posh-section-title">Scope</h2>
          <p className="posh-text">
            Applies to all employees, contractors, interns, volunteers and third-party collaborators
            on company premises, at company events, and while representing CityWatch.
          </p>
        </section>

        <hr className="posh-divider" />

        <section className="posh-section" aria-labelledby="definition-heading">
          <h2 id="definition-heading" className="posh-section-title">Definition</h2>
          <p className="posh-text">
            Sexual harassment includes unwelcome behaviour (verbal, non-verbal or physical)
            of a sexual nature that violates dignity or creates a hostile environment.
            Examples: inappropriate comments, gestures, advances, unwanted touching.
          </p>
        </section>

        <hr className="posh-divider" />

        <section className="posh-section" aria-labelledby="reporting-heading">
          <h2 id="reporting-heading" className="posh-section-title">Reporting & Support</h2>
          <ol className="posh-list">
            <li>Report incidents to your manager or the POSH Committee promptly.</li>
            <li>If uncomfortable, email <a className="posh-link" href={`mailto:${contactEmail}`}>{contactEmail}</a>.</li>
            <li>Interim protection measures (no-contact, reassignment, paid leave) will be available as needed.</li>
            <li>Confidentiality is maintained to the extent possible during investigation.</li>
          </ol>
        </section>

        <hr className="posh-divider" />

        <section className="posh-section" aria-labelledby="investigation-heading">
          <h2 id="investigation-heading" className="posh-section-title">Investigation Process</h2>
          <p className="posh-text">
            Complaints are investigated by the POSH Committee through a fair procedure.
            Both parties can present evidence and witnesses. Possible outcomes include counseling,
            warnings, suspension, or termination.
          </p>
        </section>

        <hr className="posh-divider" />

        <section className="posh-section" aria-labelledby="non-retal-heading">
          <h2 id="non-retal-heading" className="posh-section-title">Non-Retaliation</h2>
          <p className="posh-text">
            Retaliation against anyone reporting in good faith or participating in investigations
            is strictly prohibited and will result in disciplinary action.
          </p>
        </section>

        <hr className="posh-divider" />

        <section className="posh-section posh-section--small" aria-labelledby="contact-heading">
          <h3 id="contact-heading" className="posh-section-subtitle">Contact & Effective Date</h3>
          <p className="posh-text">
            For assistance or to file a complaint: <a className="posh-link" href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </p>
          <div className="posh-meta">
            <span>Effective date: <strong>{lastUpdated}</strong></span>
          </div>
        </section>
      </main>

      <footer className="posh-footer" role="contentinfo">
        <small className="posh-footnote">
          CityWatch — committed to workplace safety and dignity.
        </small>
      </footer>
    </article>
  );
}
