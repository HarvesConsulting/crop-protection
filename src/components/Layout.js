// src/components/Layout.js
import React from "react";
import "../index.css"; // або "./Layout.css", якщо хочеш окремий файл

export default function Layout({ children }) {
  return (
    <div className="page-wrapper">
      <div className="glass-container">
        {children}
      </div>
    </div>
  );
}
