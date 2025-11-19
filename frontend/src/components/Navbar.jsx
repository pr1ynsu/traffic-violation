import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);

  // load user from localStorage
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("current_user"));
    } catch {
      return null;
    }
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const avatarBtnRef = useRef(null);
  const portalRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

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

  function computeAndSetCoords() {
    const btn = avatarBtnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const dropdownWidth = 260;
    let left = rect.right - dropdownWidth;
    if (left < 8) left = Math.max(8, rect.left);
    if (rect.left + dropdownWidth + 8 > window.innerWidth) {
      left = Math.max(8, window.innerWidth - dropdownWidth - 8);
    }
    const top = rect.bottom + 12;
    setCoords({ top: Math.round(top), left: Math.round(left) });
  }

  function toggleMenu() {
    if (!menuOpen) {
      computeAndSetCoords();
      setMenuOpen(true);
    } else {
      setMenuOpen(false);
    }
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onResize() {
      computeAndSetCoords();
    }
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [menuOpen]);

  useEffect(() => {
    function onDocClick(e) {
      const btn = avatarBtnRef.current;
      const portalNode = portalRef.current;
      if (btn && btn.contains(e.target)) return;
      if (portalNode && portalNode.contains(e.target)) return;
      setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  function getInitial(name) {
    if (!name) return "";
    return name.trim()[0].toUpperCase();
  }

  // Remove current_user from saved_profiles then clear current_user and token
  function handleLogout() {
    try {
      const current = JSON.parse(localStorage.getItem("current_user"));
      if (current) {
        const raw = localStorage.getItem("saved_profiles") || "[]";
        const arr = JSON.parse(raw);
        const filtered = arr.filter(
          (p) =>
            !(
              (p.id && current.id && p.id === current.id) ||
              (p.email && current.email && p.email === current.email)
            )
        );
        localStorage.setItem("saved_profiles", JSON.stringify(filtered));
      }
    } catch (err) {
      console.error("logout cleanup error:", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("current_user");
    window.dispatchEvent(new Event("userChanged"));
    setMenuOpen(false);
    navigate("/login");
  }

  // go to dashboard depending on role
  function goToDashboard() {
    try {
      const raw = localStorage.getItem("current_user");
      if (!raw) {
        navigate("/login");
        return;
      }
      const cur = JSON.parse(raw);
      const type = (cur.userType || "").toString().trim().toLowerCase();
      if (type === "government" || type === "gov" || type === "admin") {
        navigate("/gov/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (err) {
      console.error("goToDashboard error", err);
      navigate("/login");
    } finally {
      setMenuOpen(false);
    }
  }

  const dropdown = menuOpen
    ? createPortal(
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
            <li onClick={() => goToDashboard()}>Dashboard</li>
            <li onClick={() => { setMenuOpen(false); navigate("/switch-user"); }}>Switch user</li>
            <li onClick={() => { setMenuOpen(false); navigate("/settings"); }}>Settings</li>
            <li onClick={() => { setMenuOpen(false); navigate("/notifications"); }}>Notifications</li>
            <li className="logout" onClick={handleLogout}>Log out</li>
          </ul>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {/* We allow App to decide when Navbar is mounted.
          Navbar renders its full UI (no extra isHomePage gate). */}
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
            <li>
              <Link to="/" onClick={() => window.scrollTo(0, 0)}>Home</Link>
            </li>
            <li>
              <Link to="/about" onClick={() => window.scrollTo(0, 0)}>About</Link>
            </li>
            <li>
              <Link to="/partner" onClick={() => window.scrollTo(0, 0)}>Partner</Link>
            </li>
            <li>
              <Link to="/gallery" onClick={() => window.scrollTo(0, 0)}>Gallery</Link>
            </li>
            <li>
              <Link to="/Forum" onClick={() => window.scrollTo(0, 0)}>Community</Link>
            </li>
            <li>
              <Link to="/contact" onClick={() => window.scrollTo(0, 0)}>Contact</Link>
            </li>
            <li>
              <Link to="/dashboard" onClick={() => window.scrollTo(0, 0)}>Dashboard</Link>
            </li>
          </ul>
        </div>
      </nav>

      {dropdown}
    </>
  );
}
