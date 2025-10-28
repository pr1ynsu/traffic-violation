import React from "react";
import Hero from "../components/hero";
import About from "./About";
 // Pinterest-style blog section
import Partner from "./Partner"; // Create later
import ContactSection from "./Contact"; // Contact section for scroll

export default function Home() {
  return (
    <>
      <Hero />
      <Partner />
      <ContactSection />
    </>
  );
}
