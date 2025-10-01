import React, { useState } from "react";
import "../index.css";

export default function Layout({ children, step }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="page-wrapper">
      {/* Хедер */}
      <header className="header">
        <div className="logo" onClick={() => setShowInfo(!showInfo)} style={{ cursor: "pointer" }}>
          🍅 Crop Protection
          <span className="info-icon" title="Натисни для опису">ℹ️</span>
        </div>
        <button className="logout-btn">Вийти з акаунту</button>
      </header>

      {/* Інформація про проєкт (розкривається при кліку на логотип) */}
      {showInfo && (
        <div className="info-box" style={{ margin: "10px 20px" }}>
          <strong>Crop Protection</strong> – порадник обробок.  
          Допомагає аграріям розрахувати захист рослин від хвороб, враховуючи 
          погодні умови, сезон і місцевість.
        </div>
      )}

      {/* Прогресбар */}
      <ProgressBar step={step} />

      {/* Контент */}
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
