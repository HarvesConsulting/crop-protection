import React from "react";
import "./ResultsSection.css";

const ResultsSection = () => {
  return (
    <div className="page-wrapper">
      <div className="glass-card">
        <h2>Крок 4: Результати</h2>
        <p><strong>Період розрахунку:</strong> 01.09.2025 — 12.10.2025</p>
        <p>Нижче показано рекомендовані дати обробки.</p>

        <button className="glass-button">🍅 Сформувати інтегровану систему захисту</button>

        <div className="recommendation-card">
          <h3>#1</h3>
          <p><strong>Дата:</strong> 07.09.2025</p>
          <p><strong>Препарат:</strong> Зорвек Інкантія (0,5л/га)</p>
          <p><strong>Інтервал:</strong> 5 діб після попередньої</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;
