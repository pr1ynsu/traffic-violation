import { useState, useRef } from "react";
import emailjs from "emailjs-com";
import "./Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [status, setStatus] = useState("");
  const formRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const scrollToForm = () => {
    if (formRef.current) formRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus("Sending...");

    emailjs
      .send(
        "service_lmtlbco",
        "template_os603jg",
        formData,
        "YUXqWTkLf7w6dJvyBd"
      )
      .then(
        () => {
          setStatus("✅ Message Sent Successfully!");
          setFormData({ name: "", email: "", subject: "", message: "" });
        },
        () => {
          setStatus("❌ Failed to Send. Try Again.");
        }
      );
  };

  return (
    <div className="contact-page">
      {/* Background Video */}
      <video autoPlay loop muted className="bg-video">
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>
      <div className="overlay"></div>

      <div className="contact-container">
        {/* Left Side Info */}
        <aside className="info-box" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="info-title">Get in touch — we’re listening</h2>

          <p className="info-sub">
            CityWatch is here to help: whether you want to report an issue, share product feedback, or ask about partnerships.
            Tell us what happened, attach details, and we’ll respond with clear next steps.
          </p>

          <ul className="info-list">
            <li><span className="dot">•</span><strong>What we do:</strong> Verify reports, help reduce road risks, and support safe communities.</li>
            <li><span className="dot">•</span><strong>Expected response:</strong> We acknowledge receipt within 24 hours and aim to resolve/advise within 3 business days.</li>
            <li><span className="dot">•</span><strong>Privacy:</strong> We never share your personal details without consent — read our policy for details.</li>
            <li><span className="dot">•</span><strong>Escalations:</strong> For urgent safety issues, call the phone number below for faster handling.</li>
          </ul>

          <div className="contact-quick">
            <div><strong>Email:</strong> <a href="mailto:support@citywatch.com">support@citywatch.com</a></div>
            <div><strong>Phone:</strong> <a href="tel:+919876543210">+91-9876543210</a></div>
            <div><strong>Hours:</strong> Mon–Fri, 09:00–18:00 IST</div>
          </div>

          <div className="info-cta-wrap">
            <button className="info-cta" onClick={scrollToForm}>Report an Issue / Send Message</button>
            <div className="trust">Trusted by thousands • Secure & private</div>
          </div>
        </aside>

        {/* Right Side Form */}
        <form className="form-box" onSubmit={sendEmail} ref={formRef}>
          <h2 className="form-title">Send a Message</h2>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <select
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          >
            <option value="">Select Subject</option>
            <option value="Feedback">Feedback</option>
            <option value="Bug Report">Bug Report</option>
            <option value="General Query">General Query</option>
          </select>
          <textarea
            name="message"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
          <button type="submit" className="send-btn">Send</button>
          <p className="status">{status}</p>
        </form>
      </div>
    </div>
  );
}
