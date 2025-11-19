import React from "react";
import "./privacypolicy.css";

export default function PrivacyPolicy({ lastUpdated = "November 19, 2025" }) {
  return (
    <article className="pp-page" aria-labelledby="privacy-title">
      <header className="pp-hero" role="banner">
        <h1 id="privacy-title" className="pp-title">Privacy Policy</h1>
        <p className="pp-subtitle">
          How CityWatch Technologies collects, uses, and protects data for
          challan and reward submissions. Clear, minimal, and transparent.
        </p>
      </header>

      <main className="pp-content" role="main">
        <section className="pp-section" id="summary">
          <h2 className="pp-section-title">1. Summary</h2>
          <p className="pp-text">
            CityWatch Technologies enables citizens to record traffic violations
            via dashcam and earn reward points. We collect only the data
            necessary to verify submissions, administer rewards or challans,
            and keep auditable records for users and authorized agencies.
          </p>
        </section>

        <hr className="pp-divider" />

        <section className="pp-section" id="data-we-collect">
          <h2 className="pp-section-title">2. Data we collect</h2>
          <ul className="pp-list">
            <li><strong>Account data:</strong> name, email, phone.</li>
            <li><strong>Dashcam evidence:</strong> video/photos, timestamps, GPS (optional).</li>
            <li><strong>Violation records:</strong> points, challans, logs.</li>
            <li><strong>Device & usage data:</strong> IP, app version, analytics.</li>
          </ul>
        </section>

        <hr className="pp-divider" />

        <section className="pp-section" id="purpose">
          <h2 className="pp-section-title">3. Why we use data</h2>
          <ol className="pp-list">
            <li>Authenticate accounts.</li>
            <li>Verify evidence.</li>
            <li>Maintain audit records.</li>
            <li>Improve performance & prevent fraud.</li>
          </ol>
        </section>

        <hr className="pp-divider" />

        <section className="pp-section" id="verification">
          <h2 className="pp-section-title">4. Verification flow</h2>
          <p className="pp-text">
            Submissions undergo automated screening and manual review. Automated
            flags assist triage but do not finalize any penalties.
          </p>
          <p className="pp-muted">No penalties are issued from automated flags alone.</p>
        </section>

        <hr className="pp-divider" />

        <section className="pp-section" id="sharing">
          <h2 className="pp-section-title">5. Sharing & government access</h2>
          <p className="pp-text">
            We never sell personal data. Verified records may be shared with
            authorized agencies strictly for enforcement and public safety.
          </p>
        </section>

        <hr className="pp-divider" />

        <section className="pp-section" id="rights">
          <h2 className="pp-section-title">6. Your rights</h2>
          <p className="pp-text">
            You can request access, correction, or deletion of personal data.
            Some records may remain for legal or audit requirements.
          </p>
        </section>

        <hr className="pp-divider" />

        <section className="pp-section" id="security">
          <h2 className="pp-section-title">7. Security</h2>
          <p className="pp-text">
            We use encryption, access controls, and monitoring. If a breach
            occurs, affected users and authorities will be notified.
          </p>
        </section>

        <hr className="pp-divider" />

        <section className="pp-section" id="retention">
          <h2 className="pp-section-title">8. Retention</h2>
          <p className="pp-text">
            Data is retained only as long as needed for verification, appeals,
            audits, and regulatory compliance.
          </p>
        </section>

        <hr className="pp-divider" />

        <section className="pp-section pp-section-meta" id="updates">
          <h3 className="pp-small-title">Policy updates & contact</h3>
          <p className="pp-text">This policy may update based on legal or product changes.</p>
          <p className="pp-effective">Effective date: <strong>{lastUpdated}</strong></p>
          <p className="pp-contact">
            Data Protection Team —
            <a href="mailto:privacy@citywatch.example" className="pp-link"> privacy@citywatch.example</a>
          </p>
        </section>
      </main>

      <footer className="pp-footer" role="contentinfo">
        <small className="pp-footnote">
          CityWatch Technologies — Privacy First, Transparency Always.
        </small>
      </footer>
    </article>
  );
}
