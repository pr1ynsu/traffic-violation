import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Login.css";

/*
 Combined Login / Register page.
 - USE_MOCK: when true stores users in localStorage (dev)
 - Route: /login/:role  (role => "user" or "government")
*/

const USE_MOCK = false;
const API_BASE = "http://localhost:8000";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const uid = () => `u_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;

export default function Login() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
    vehicle: "",
    license: "",
    age: "",
    guardianName: "",
    guardianNumber: "",
    userType: "User",
    password: "",
    confirmPassword: "",
    agreeRules: false,
    agreeMonitoring: false
  });

  function update(field, value) {
    setForm(p => ({ ...p, [field]: value }));
  }

  function validateRegister() {
    if (!form.name || !form.mobile || !form.email || !form.password) {
      setMessage({ type: "error", text: "Please fill required fields (name, mobile, email, password)." });
      return false;
    }
    if (form.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters." });
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return false;
    }
    if (!form.agreeRules || !form.agreeMonitoring) {
      setMessage({ type: "error", text: "Please agree to terms and monitoring." });
      return false;
    }
    return true;
  }

  function validateLogin() {
    if (!form.email || !form.password) {
      setMessage({ type: "error", text: "Email and password are required." });
      return false;
    }
    return true;
  }

  // Mock storage (dev)
  function mockFindUserByEmail(email) {
    const users = JSON.parse(localStorage.getItem("mock_users_v2") || "[]");
    return users.find(u => u.email === email || u.mobile === email);
  }
  function mockSaveUser(user) {
    const users = JSON.parse(localStorage.getItem("mock_users_v2") || "[]");
    users.push(user);
    localStorage.setItem("mock_users_v2", JSON.stringify(users));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    if (isRegister) {
      if (!validateRegister()) return;
    } else {
      if (!validateLogin()) return;
    }

    setLoading(true);
    try {
      if (USE_MOCK) {
        await sleep(400);

        if (isRegister) {
          if (mockFindUserByEmail(form.email)) {
            setMessage({ type: "error", text: "Email already registered (mock)." });
            setLoading(false);
            return;
          }

          const newUser = {
            id: uid(),
            name: form.name,
            mobile: form.mobile,
            email: form.email,
            address: form.address,
            vehicle: form.vehicle,
            license: form.license,
            age: form.age,
            guardianName: form.guardianName,
            guardianNumber: form.guardianNumber,
            userType: form.userType,
            password: form.password // mock only
          };
          mockSaveUser(newUser);
          localStorage.setItem("token", `mock-token-${newUser.id}`);
          localStorage.setItem("current_user", JSON.stringify(newUser));
          setMessage({ type: "success", text: "Registered (mock). Redirecting..." });
          await sleep(600);
          navigate("/forum");
          return;
        }

        // login mock
        const user = mockFindUserByEmail(form.email);
        if (!user || user.password !== form.password) {
          setMessage({ type: "error", text: "Invalid credentials (mock)." });
          setLoading(false);
          return;
        }
        localStorage.setItem("token", `mock-token-${user.id}`);
        localStorage.setItem("current_user", JSON.stringify(user));
        setMessage({ type: "success", text: "Login successful (mock). Redirecting..." });
        await sleep(400);
        navigate("/forum");
        return;
      }

      // real backend paths
      const endpoint = isRegister ? `${API_BASE}/api/auth/signup` : `${API_BASE}/api/auth/login`;
      const payload = isRegister
        ? {
            name: form.name, mobile: form.mobile, email: form.email,
            address: form.address, vehicle: form.vehicle, license: form.license,
            age: form.age, guardianName: form.guardianName, guardianNumber: form.guardianNumber,
            role: form.userType.toLowerCase(), password: form.password
          }
        : { email: form.email, password: form.password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "Server error" });
        setLoading(false);
        return;
      }

      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("current_user", JSON.stringify(data.user));
      setMessage({ type: "success", text: isRegister ? "Registered. Redirecting..." : "Logged in. Redirecting..." });
      setTimeout(() => navigate("/forum"), 500);
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page register-split-page">
      <video autoPlay loop muted playsInline className="bg-video">
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>
      <div className="overlay" />

      {/* Header: only logo (no CityWatch text) */}
      <header className="auth-header">
        <img src="/logo.jpg" alt="logo" className="auth-logo" />
      </header>

      {/* If register mode: show 2-column split. Else show compact login */}
      {isRegister ? (
        <main className="register-split">
          <section className="info-pane glass-left">
            <h2>Why Choose Us?</h2>
            <ul className="bullets">
              <li>🚦 Make roads safer by joining a responsible community.</li>
              <li>✅ Earn rewards for following traffic rules.</li>
              <li>⚡ Instant alerts for violations.</li>
            </ul>

            <h3>Incentives for You:</h3>
            <ul className="incentives">
              <li>🏆 Cashback rewards for safe driving.</li>
              <li>🎯 Discount on penalties when you report violations.</li>
              <li>🌟 Priority support & premium features.</li>
            </ul>
          </section>

          <section className="form-pane glass-right" aria-labelledby="register-heading">
            <h2 id="register-heading" className="form-title">Create Account</h2>

            <form className="register-form" onSubmit={handleSubmit}>
              <input name="name" value={form.name} onChange={e => update("name", e.target.value)} placeholder="Full Name" required />
              <input name="mobile" value={form.mobile} onChange={e => update("mobile", e.target.value)} placeholder="Mobile Number" required />
              <input type="email" name="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="Email ID" required />
              <input name="address" value={form.address} onChange={e => update("address", e.target.value)} placeholder="Address" />
              <input name="vehicle" value={form.vehicle} onChange={e => update("vehicle", e.target.value)} placeholder="Registered Vehicle Number" />
              <input name="license" value={form.license} onChange={e => update("license", e.target.value)} placeholder="Driving License Number" />
              <input name="age" type="number" value={form.age} onChange={e => update("age", e.target.value)} placeholder="Age" />
              <input name="guardianName" value={form.guardianName} onChange={e => update("guardianName", e.target.value)} placeholder="Guardian Name" />
              <input name="guardianNumber" value={form.guardianNumber} onChange={e => update("guardianNumber", e.target.value)} placeholder="Guardian Number" />

              <select name="userType" value={form.userType} onChange={e => update("userType", e.target.value)} aria-label="Select user type">
                <option value="User">User</option>
                <option value="Government">Government</option>
              </select>

              <input name="password" type="password" value={form.password} onChange={e => update("password", e.target.value)} placeholder="Password" required />
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} placeholder="Confirm Password" required />

              <label className="small-checkbox">
                <input type="checkbox" checked={form.agreeRules} onChange={e => update("agreeRules", e.target.checked)} />
                I agree to follow traffic rules and accept penalties for violations.
              </label>

              <label className="small-checkbox">
                <input type="checkbox" checked={form.agreeMonitoring} onChange={e => update("agreeMonitoring", e.target.checked)} />
                I agree to allow my activity to be monitored for rewards & penalties.
              </label>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>
            <div className="register-footer">
              <div className={`msg ${message?.type || ""}`}>{message?.text}</div>
              <div className="small-row">
                <button className="ghost" onClick={() => { setIsRegister(false); setMessage(null); }}>Already have an account? Login</button>
                <button className="ghost" onClick={() => navigate("/")}>Back home</button>
              </div>
            </div>
          </section>
        </main>
      ) : (
        /* compact login view */
        <main className="login-compact">
          <div className="login-card glass-box">
            <h2 className="login-title">{role === "government" ? "Government Login" : "User Login"}</h2>

            <form className="compact-form" onSubmit={handleSubmit}>
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={e => update("email", e.target.value)} required />
              <input name="password" type="password" placeholder="Password" value={form.password} onChange={e => update("password", e.target.value)} required />
              <button type="submit" className="submit-btn" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
            </form>

            <div className="compact-footer">
              <div className={`msg ${message?.type || ""}`}>{message?.text}</div>
              <div className="compact-actions">
                <button className="linkless" onClick={() => setIsRegister(true)}>New here? Register Now</button>
                <div className="links">
                  <button className="ghost" onClick={() => navigate("/")}>Back home</button>
                  <button className="ghost" onClick={() => navigate("/contact")}>Contact</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
