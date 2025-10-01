import React from "react";
import "../index.css";

export default function Layout({ children, step }) {
  return (
    <div className="page-wrapper">
      {/* Шапка */}
      <header className="header">
        <div className="logo">🍅 Crop Protection</div>
        <button className="logout-btn">Вийти з акаунту</button>
      </header>

      {/* Прогресбар */}
      <ProgressBar step={step} />

      {/* Основний контент */}
      <main className="main-content">
        <div className="glass-container">{children}</div>
      </main>

      {/* Футер */}
      <footer className="footer">
        © {new Date().getFullYear()} Crop Protection
      </footer>
    </div>
  );
}

function ProgressBar({ step }) {
  const steps = ["Місто", "Сезон", "Розрахунок", "Результати"];
  return (
    <div className="progress-bar">
      {steps.map((label, i) => (
        <div
          key={i}
          className={`progress-step ${i + 1 === step ? "active" : ""}`}
        >
          {i + 1}. {label}
        </div>
      ))}
    </div>
  );
}
