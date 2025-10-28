import { useState } from "react";
import "./Gallery.css";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null);

  // 10 sample photos (replace with your actual images in /public/images)
  const images = [
    { src: "/images/img1.jpeg", text: "Smart city traffic monitoring." },
    { src: "/images/img2.jpeg", text: "Citizens rewarded for following rules." },
    { src: "/images/img3.jpeg", text: "AI-powered signal management." },
    { src: "/images/img4.jpeg", text: "Government awareness campaign." },
    { src: "/images/img5.jpeg", text: "Partnership with developers." },
    { src: "/images/img6.jpeg", text: "Drone footage of traffic flow." },
    { src: "/images/img7.jpeg", text: "Volunteers helping traffic awareness." },
    { src: "/images/img8.jpeg", text: "Smart helmet detection system." },
    { src: "/images/img9.jpeg", text: "Reward ceremony for safe driving." },
    { src: "/images/img10.jpeg", text: "Control room operations overview." },
  ];

  return (
    <div className="gallery-container">
      <h1 className="gallery-title">Our Gallery</h1>
      <div className="gallery-grid">
        {images.map((img, index) => (
          <div 
            key={index} 
            className="gallery-item" 
            onClick={() => setSelectedImage(img)}
          >
            <img src={img.src} alt={`Gallery ${index}`} />
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage.src} alt="Selected" />
            <p>{selectedImage.text}</p>
            <button onClick={() => setSelectedImage(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
