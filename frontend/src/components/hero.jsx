import React from "react";
import "./Hero.css"; // Import the new CSS file
import About from "../pages/About";

export default function Hero() {
  return (
    <>
      <section id="home" className="hero-section">
        <video
          className="hero-video"
          src="/bg-video.mp4"
          autoPlay
          loop
          muted
          playsInline
        ></video>

        <div className="hero-overlay"></div>

        <div className="hero-content">
          <h1>Welcome to Our Platform</h1>
          <p>
            A modern, transparent, and efficient solution for managing challans
            and streamlining communication.
          </p>
        </div>

        <div className="scroll-indicator">
          <a href="/About">
            <div className="scroll-icon">↓</div>
          </a>
        </div>
      </section>

      <About />
    </>
  );
}
