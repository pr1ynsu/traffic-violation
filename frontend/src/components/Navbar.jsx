import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);
  const isHomePage = location.pathname === "/";

  // load user from localStorage
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("current_user"));
    } catch {
      return null;
    }
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const avatarBtnRef = useRef(null);      // ref to the avatar button
  const portalRef = useRef(null);         // ref to the portal dropdown DOM node
  const [coords, setCoords] = useState({ top: 0, left: 0 }); // fixed coords for portal

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

  // Listen for events when user is changed (from Login.jsx) and storage events (other tabs)
  useEffect(() => {
    function onUserChanged() {
      try {
        setUser(JSON.parse(localStorage.getItem("current_user")));
      } catch {
        setUser(null);
      }
    }
    function onStorage(e) {
      if (e.key === "current_user") onUserChanged();
    }
    window.addEventListener("userChanged", onUserChanged);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("userChanged", onUserChanged);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // compute and set portal coords: call whenever we open menu or on resize/scroll while open
  function computeAndSetCoords() {
    const btn = avatarBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();

    // desired dropdown width (should match CSS min-width); we'll use 260 as safe default
    const dropdownWidth = 260;
    // initial left aligns dropdown's right to the button's right
    // but we clamp so it doesn't overflow the viewport
    const spaceRight = window.innerWidth - rect.right;
    let left = rect.right - dropdownWidth; // try align right edges
    if (left < 8) left = Math.max(8, rect.left); // if too far left, align to button's left but not <8px
    if (rect.left + dropdownWidth + 8 > window.innerWidth) {
      // clamp to fit
      left = Math.max(8, window.innerWidth - dropdownWidth - 8);
    }
    // top should be just below the button
    const top = rect.bottom + 12;

    setCoords({ top: Math.round(top), left: Math.round(left) });
  }

  // open/close menu and compute coords
  function toggleMenu() {
    if (!menuOpen) {
      computeAndSetCoords();
      setMenuOpen(true);
    } else {
      setMenuOpen(false);
    }
  }

  // update coords on resize/scroll while menu is open
  useEffect(() => {
    if (!menuOpen) return;
    function onResize() {
      computeAndSetCoords();
    }
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true); // capture scrolls anywhere
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [menuOpen]);

  // click outside to close dropdown — check both avatar button and portal dropdown nodes
  useEffect(() => {
    function onDocClick(e) {
      const btn = avatarBtnRef.current;
      const portalNode = portalRef.current;
      if (btn && btn.contains(e.target)) return; // clicked avatar -> ignore (avatar toggles separately)
      if (portalNode && portalNode.contains(e.target)) return; // clicked inside portal -> ignore
      setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  function getInitial(name) {
    if (!name) return "";
    return name.trim()[0].toUpperCase();
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("current_user");
    window.dispatchEvent(new Event("userChanged"));
    setMenuOpen(false);
    navigate("/");
  }

  // Portal dropdown element
  const dropdown = menuOpen ? createPortal(
    <div
      ref={portalRef}
      className="glass-dropdown portal-dropdown"
      role="menu"
      style={{
        position: "fixed",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        minWidth: 240,
      }}
    >
      <div className="menu-header">
        <div className="menu-avatar">{getInitial(user?.name)}</div>
        <div className="menu-user">
          <div className="menu-name">{user?.name}</div>
          <div className="menu-email">{user?.email}</div>
        </div>
      </div>

      <ul className="menu-list">
        <li onClick={() => { setMenuOpen(false); navigate("/switch-user"); }}>Switch user</li>
        <li onClick={() => { setMenuOpen(false); navigate("/settings"); }}>Settings</li>
        <li onClick={() => { setMenuOpen(false); navigate("/notifications"); }}>Notifications</li>
        <li className="logout" onClick={handleLogout}>Log out</li>
      </ul>
    </div>,
    document.body
  ) : null;

  return (
    <>
      {isHomePage && (
        <nav className={`navbar ${showNavbar ? "navbar-visible" : "navbar-hidden"}`}>
          <div className="navbar-top">
            <div className="logo-container">
              <img src="/logo.jpg" alt="Logo" className="logo" />
            </div>

            <div className="login-container">
              {!user ? (
                <Link to="/login" className="login-link">
                  <button className="login-btn">Sign Up / Log In</button>
                </Link>
              ) : (
                <div className="avatar-wrapper">
                  <button
                    ref={avatarBtnRef}
                    className="login-btn avatar-btn"
                    onClick={toggleMenu}
                    aria-haspopup="true"
                    aria-expanded={menuOpen}
                    title={user?.name || "User"}
                  >
                    {getInitial(user.name)}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="navbar-links">
            <ul>
              <li><Link to="/" onClick={() => window.scrollTo(0, 0)}>Home</Link></li>
              <li><Link to="/about" onClick={() => window.scrollTo(0, 0)}>About</Link></li>
              <li><Link to="/partner" onClick={() => window.scrollTo(0, 0)}>Partner</Link></li>
              <li><Link to="/gallery" onClick={() => window.scrollTo(0, 0)}>Gallery</Link></li>
              <li><Link to="/Forum" onClick={() => window.scrollTo(0, 0)}>Community</Link></li>
              <li><Link to="/contact" onClick={() => window.scrollTo(0, 0)}>Contact</Link></li>
            </ul>
          </div>
        </nav>
      )}
      {dropdown}
    </>
  );
}
