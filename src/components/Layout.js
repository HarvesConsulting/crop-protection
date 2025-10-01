// src/components/Layout.js
import React, { useState } from "react";
import LogoutButton from "./LogoutButton";

export default function Layout({ children, step, onLogout }) {
  const [showInfo, setShowInfo] = useState(false);

  const steps = ["Місто", "Сезон", "Розрахунок", "Результати"];

  return (
    <div className="page-wrapper">
      {/* 🔹 Шапка */}
      <header className="header">
        <div className="logo">
          🍅 Crop Protection
          <button
            className="info-icon"
            onClick={() => setShowInfo(!showInfo)}
            title={showInfo ? "Сховати інформацію" : "Показати інформацію"}
          >
            ℹ️
          </button>
        </div>
        <LogoutButton onLogout={onLogout} />
      </header>

      {/* 🔹 Інформаційний блок */}
      {showInfo && (
        <div className="info-box" style={{ maxWidth: 700, margin: "20px auto" }}>
          <strong>ℹ️ Інформація</strong>
          <p>
            Цей застосунок допомагає агрономам, фермерам та консультантам ухвалювати рішення
            щодо захисту томатів від фітофтори, сірої гнилі, альтернаріозу та бактеріозу.
          </p>
          <p style={{ fontSize: "0.9em", color: "#555" }}>
            Ми аналізуємо погодні дані, обчислюємо індекси ризику захворювань (DSV)
            та прогнозуємо доцільні дати обробки.
          </p>
        </div>
      )}

      {/* 🔹 Прогрес-бар */}
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

      {/* 🔹 Контент */}
      <main className="main-content">
        <div className="glass-container">{children}</div>
      </main>
    </div>
  );
}
