// src/components/Layout.js
import React from "react";
import "../index.css"; // або окремий css, якщо ти створив інший

export default function Layout({ children }) {
  return <div className="page-wrapper">{children}</div>;
}
