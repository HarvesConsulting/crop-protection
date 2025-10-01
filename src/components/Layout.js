// src/components/Layout.js
import React from "react";
import Stepper from "./Stepper";

export default function Layout({ children, currentStep }) {
  return (
    <div className="page-wrapper">
      {/* Overlay для затемнення */}
      <div className="overlay"></div>

      {/* Шапка */}
      <header className="header">
        <div className="header-inner">
          <h1 className="logo">🍅 Crop Protection</h1>
          <button className="logout-btn">Вийти</button>
        </div>
      </header>

      {/* Stepper */}
      <div className="stepper-wrapper">
        <Stepper currentStep={currentStep} />
      </div>

      {/* Контент */}
      <main className="main-content">
        <div className="glass-container">{children}</div>
      </main>

      {/* Футер */}
      <footer className="footer">
        © {new Date().getFullYear()} Crop Protection – Всі права захищені
      </footer>
    </div>
  );
}
