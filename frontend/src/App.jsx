// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import React from "react";

// existing components/pages you already had
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import RoleSelection from "./pages/RoleSelection";
import GovernmentLogin from "./pages/GovernmentLogin";
import Login from "./pages/Login"; // your combined Login page
import DeveloperLogin from "./pages/DeveloperLogin";
import ContactPage from "./pages/Contact";
import Gallery from "./pages/Gallery";

import Forum from "./pages/Forum";
import About from "./pages/About";
import Partner from "./pages/Partner";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AnnualReturn from "./pages/AnnualReturn";
import PoshPolicy from "./pages/PoshPolicy";

// generic dashboard router entry (redirects to /user/dashboard or /gov/dashboard)
import DashboardEntry from "./pages/Dashboard";

// user pages (match files in frontend/src/pages/User/)
import UserDashboard from "./pages/User/Dashboard";
import UserChallan from "./pages/User/Challan";
import UserCredits from "./pages/User/Credits";
import UserViolations from "./pages/User/Violations";

// government pages (match files in frontend/src/pages/Gov/)
// note: rename the file on disk to GovDashboard.jsx if possible. For now we import using the current filename.
import GovDashboard from "./pages/Gov/GovDashboard.jsx.jsx";
import GovChallan from "./pages/Gov/Challan";
import GovCredits from "./pages/Gov/Credits";
import GovViolations from "./pages/Gov/Violations";

// switch-user page you added
import SwitchUser from "./pages/SwitchUser";

function AppWrapper() {
  const location = useLocation();

  // show navbar on home and dashboard pages so avatar/menu remain accessible
  const navbarPaths = ["/", "/dashboard", "/user/dashboard", "/gov/dashboard"];

  // hide footer on login-related pages and switch-user
  const hideFooterPaths = ["/login", "/login/government", "/login/user", "/login/developer", "/switch-user"];

  // decide whether to mount top navbar and footer
  const showNavbar = navbarPaths.includes(location.pathname);
  const showFooter = !hideFooterPaths.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        {/* preserve your existing routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<RoleSelection />} />
        <Route path="/login/user" element={<Login />} />
        <Route path="/login/government" element={<Login />} />
        <Route path="/login/developer" element={<DeveloperLogin />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/partner" element={<Partner />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/annual-return" element={<AnnualReturn />} />
        <Route path="/posh-policy" element={<PoshPolicy />} />

        {/* generic dashboard entry: will redirect based on role */}
        <Route path="/dashboard" element={<DashboardEntry />} />

        {/* Switch user page */}
        <Route path="/switch-user" element={<SwitchUser />} />

        {/* User routes */}
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/challan" element={<UserChallan />} />
        <Route path="/user/credits" element={<UserCredits />} />
        <Route path="/user/violations" element={<UserViolations />} />

        {/* Government routes */}
        <Route path="/gov/dashboard" element={<GovDashboard />} />
        <Route path="/gov/challan" element={<GovChallan />} />
        <Route path="/gov/credits" element={<GovCredits />} />
        <Route path="/gov/violations" element={<GovViolations />} />
      </Routes>

      {showFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
