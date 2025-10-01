import React from "react";
import "../index.css";

export default function Layout({ children }) {
  return (
    <div className="page-wrapper">
      <header className="header">
        <div className="logo">🍅 Crop Protection</div>
        <button className="logout-btn">Вийти з акаунту</button>
      </header>

      <main className="main-content">
        <div className="glass-container">{children}</div>
      </main>

      <footer className="footer">
        © {new Date().getFullYear()} Crop Protection
      </footer>
    </div>
  );
}
