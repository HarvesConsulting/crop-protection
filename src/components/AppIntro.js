import React, { useState } from "react";

export default function AppIntro() {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "rgba(255,255,255,0.9)",
        borderLeft: "4px solid #2f7a4f",
        borderRadius: "12px",
        marginBottom: "24px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong style={{ color: "#2d6cdf" }}>ℹ️ Інформація</strong>
        <button
          onClick={() => setShowInfo(!showInfo)}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            lineHeight: "1",
          }}
          title={showInfo ? "Сховати опис" : "Показати опис"}
        >
          {showInfo ? "✖️" : "ℹ️"}
        </button>
      </div>

      {showInfo && (
        <div style={{ marginTop: "12px", color: "#333", fontSize: "15px", lineHeight: "1.5" }}>
          <p>
            Цей застосунок допомагає агрономам, фермерам та консультантам ухвалювати рішення
            щодо захисту томатів від <b>фітофтори</b>, <b>сірої гнилі</b>,
            <b> альтернаріозу</b> та <b>бактеріозу</b>.
          </p>
          <p style={{ fontSize: "0.9em", color: "#555" }}>
            Ми аналізуємо погодні дані, обчислюємо індекси ризику захворювань (DSV)
            та прогнозуємо доцільні дати обробки.
            Усього за кілька кроків ви отримаєте індивідуальні рекомендації.
          </p>
        </div>
      )}
    </div>
  );
}
