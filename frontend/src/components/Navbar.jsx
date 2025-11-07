import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useAuth from "../auth/userAuth";
import RoleDropdown from "./RoleDropdown";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const { user } = useAuth();
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current + 20) {
        setShowNavbar(false);
      } else if (currentScrollY < lastScrollY.current - 20) {
        setShowNavbar(true);
      }

      lastScrollY.current = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {isHomePage && (
        <nav className={`navbar glass-nav ${showNavbar ? "navbar-visible" : "navbar-hidden"}`}>
          <div className="navbar-top">
            <div className="logo-container">
              <img src="/logo.jpg" alt="Logo" className="logo" />
              
            </div>
            {user ? (
              <RoleDropdown />
            ) : (
              <Link to="/login">
                <button className="login-btn">Sign Up / Log In</button>
              </Link>
            )}
          </div>

          <div className="navbar-links">
            <ul>
              <li><Link to="/" onClick={() => window.scrollTo(0, 0)}>Home</Link></li>
              <li><Link to="/about" onClick={() => window.scrollTo(0, 0)}>About</Link></li>
              <li><Link to="/partner" onClick={() => window.scrollTo(0, 0)}>Partner</Link></li>
              <li><Link to="/gallery" onClick={() => window.scrollTo(0, 0)}>Gallery</Link></li>
              {/* ✅ Fixed: use lowercase route */}
              <li><Link to="/Forum" onClick={() => window.scrollTo(0, 0)}>Community</Link></li>
              <li><Link to="/contact" onClick={() => window.scrollTo(0, 0)}>Contact</Link></li>
            </ul>
          </div>
        </nav>
      )}
    </>
  );
}
