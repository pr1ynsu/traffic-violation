// frontend/src/components/ViolationImage.jsx
import React, { useState } from "react";

const PLACEHOLDER_SRC = "/images/no-image.png"; // adjust if using src/assets

function ViolationImage({ src, alt }) {
  const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER_SRC);

  const handleError = () => {
    if (imgSrc !== PLACEHOLDER_SRC) {
      setImgSrc(PLACEHOLDER_SRC);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt || "Violation proof"}
      style={{
        maxWidth: "100%",
        maxHeight: "400px",
        objectFit: "contain",
        borderRadius: "8px",
      }}
      onError={handleError}
    />
  );
}

export default ViolationImage;
