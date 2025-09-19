import React, { useState } from "react";

export default function AppIntro() {
  const [showInfo, setShowInfo] = useState(true);

  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#f0f4ff",
        borderRadius: "12px",
        marginBottom: "24px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ marginBottom: "10px", color: "#2d6cdf" }}>
          🌿 Crop Protection – Порадник обробок
        </h2>
        <button
          onClick={() => setShowInfo(!showInfo)}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
          }}
          title={showInfo ? "Сховати опис" : "Показати опис"}
        >
          ℹ️
        </button>
      </div>

      {showInfo && (
        <>
          <p style={{ marginBottom: "6px" }}>
            Цей застосунок допомагає агрономам, фермерам та консультантам ухвалювати рішення
            щодо захисту томатів від фітофтори, сірої гнилі, альтернаріозу та бактеріозу.
            Ми аналізуємо погодні дані, обчислюємо індекси ризику захворювань (DSV)
            та прогнозуємо доцільні дати обробки.
          </p>
          <p style={{ fontSize: "0.9em", color: "#555" }}>
            Усього за кілька кроків ви отримаєте індивідуальні рекомендації з урахуванням погоди у вашій місцевості.
          </p>
        </>
      )}
    </div>
  );
}
