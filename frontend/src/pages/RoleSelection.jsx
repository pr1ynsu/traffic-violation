import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./RoleSelection.css";

export default function RoleSelection() {
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const circlesRef = useRef([]);

  useEffect(() => {
    // set stagger delays for entrance
    const items = circlesRef.current;
    items.forEach((el, i) => {
      if (!el) return;
      el.style.setProperty("--delay", `${i * 120}ms`);
    });
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      setMouse({ x: (e.clientX - cx) / cx, y: (e.clientY - cy) / cy });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  function handleRole(role) {
    const el = document.querySelector(`.role-circle[data-role="${role}"]`);
    if (el) {
      el.classList.add("pulse");
      setTimeout(() => el.classList.remove("pulse"), 380);
    }
    setTimeout(() => {
      if (role === "Government") navigate("/login/government");
      else if (role === "User") navigate("/login/user");
    }, 180);
  }

  function onKeyRole(e, role) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleRole(role);
    }
  }

  const BG_VIDEO = "/bg-video.mp4"; // put a subtle video in public/

  return (
    <div
      className="role-selection"
      aria-label="Role selection"
      style={{
        "--mx": `${mouse.x * 6}px`,
        "--my": `${mouse.y * 6}px`
      }}
    >
      <video className="bg-video" autoPlay loop muted playsInline>
        <source src={BG_VIDEO} type="video/mp4" />
      </video>
      <div className="bg-overlay" />

      <header className="role-header glass">
        <div className="role-header-inner">
          <div className="brand">CityWatch</div>
        </div>
      </header>

      <h1 className="role-title">Choose Your Role</h1>

      <main className="roles-wrap" role="main">
        <div className="roles" aria-live="polite">
          <div
            ref={(el) => (circlesRef.current[0] = el)}
            className="role-circle glass"
            data-role="Government"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => onKeyRole(e, "Government")}
            onClick={() => handleRole("Government")}
            style={{
              transform: `translate(${mouse.x * -8}px, ${mouse.y * -6}px)`
            }}
          >
            <div className="role-inner">
              <div className="role-name">Government</div>
            </div>
          </div>

          <div
            ref={(el) => (circlesRef.current[1] = el)}
            className="role-circle glass"
            data-role="User"
            tabIndex={0}
            role="button"
            onKeyDown={(e) => onKeyRole(e, "User")}
            onClick={() => handleRole("User")}
            style={{
              transform: `translate(${mouse.x * 6}px, ${mouse.y * 4}px)`
            }}
          >
            <div className="role-inner">
              <div className="role-name">User</div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom center navigation bar (glass) */}
      <nav className="bottom-bar" role="navigation" aria-label="Main navigation">
        <button className="bar-btn" onClick={() => navigate("/")}>Home</button>
        <button className="bar-btn" onClick={() => navigate("/about")}>About</button>
        <button className="bar-btn" onClick={() => navigate("/gallery")}>Gallery</button>
        <button className="bar-btn" onClick={() => navigate("/contact")}>Contact</button>
      </nav>
    </div>
  );
}
