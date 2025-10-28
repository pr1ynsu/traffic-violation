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

// new pages/layouts (mock-backed)
import UserLayout from "./pages/User/UserLayout";
import GovLayout from "./pages/Gov/GovLayout";

function AppWrapper() {
  const location = useLocation();

  const navbarPaths = ["/"];
  const hideFooterPaths = ["/login", "/login/government", "/login/user", "/login/developer"];
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

        {/* NEW: user & gov nested routes */}
        <Route path="/user/*" element={<UserLayout />} />
        <Route path="/gov/*" element={<GovLayout />} />
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
