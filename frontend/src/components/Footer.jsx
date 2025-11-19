import { Link, useLocation } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  const location = useLocation();

  const hideFooterPaths = [
    "/login",
    "/login/government",
    "/login/user",
    "/login/developer",
    "/signup",
  ];

  if (hideFooterPaths.includes(location.pathname)) return null;

  return (
    <footer className="footer glass-footer">
      <div className="footer-overlay"></div>

      <div className="footer-main">
        {/* Brand */}
        <div className="footer-section footer-logo-section">
          <img src="/logo.jpg" alt="CityWatch Logo" className="footer-logo-img" />
          <p className="footer-desc">
            CityWatch Technologies transforms urban safety through transparent,
            citizen-driven reporting and AI-enabled solutions. We connect people
            and public systems for a safer, smarter, more responsive city.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/" onClick={() => window.scrollTo(0, 0)}>Home</Link></li>
            <li><Link to="/about" onClick={() => window.scrollTo(0, 0)}>About</Link></li>
            <li><Link to="/partner" onClick={() => window.scrollTo(0, 0)}>Partner</Link></li>
            <li><Link to="/gallery" onClick={() => window.scrollTo(0, 0)}>Gallery</Link></li>
            <li><Link to="/forum" onClick={() => window.scrollTo(0, 0)}>Community</Link></li>
            <li><Link to="/dashboard" onClick={() => window.scrollTo(0, 0)}>dashboard</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h3>Contact Info</h3>
          <p>KIIT University<br />School of Computer Science</p>
          <p><a href="mailto:contact@citywatch.com">contact@citywatch.com</a></p>
          <p>+91 1122334455</p>
        </div>

        {/* Socials */}
        <div className="footer-section">
          <h3>Follow Us</h3>
          <div className="footer-icons">
            <div className="icon-group">
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <span>Instagram</span>
            </div>
            <div className="icon-group">
              <a href="https://medium.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-medium"></i>
              </a>
              <span>Medium</span>
            </div>
            <div className="icon-group">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <span>Facebook</span>
            </div>
            <div className="icon-group">
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-youtube"></i>
              </a>
              <span>YouTube</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© 2025 CityWatch Technologies — All Rights Reserved</p>
        <div className="footer-policies">
          <Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)}>Privacy Policy</Link>
          <Link to="/annual-return" onClick={() => window.scrollTo(0, 0)}>Annual Return</Link>
          <Link to="/posh-policy" onClick={() => window.scrollTo(0, 0)}>Posh Policy</Link>
        </div>
      </div>
    </footer>
  );
}
