// src/pages/BlogView.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function BlogView() {
  const { blogId } = useParams();
  const [html, setHtml] = useState("");

  useEffect(() => {
    import(`../BlogData/${blogId}.html`)
      .then((module) => fetch(module.default))
      .then((res) => res.text())
      .then((data) => setHtml(data))
      .catch(() => setHtml("<h2>Blog not found</h2>"));
  }, [blogId]);

  return (
    <div className="blog-view" dangerouslySetInnerHTML={{ __html: html }} />
  );
}
