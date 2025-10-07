import React from "react";
import "./IntegratedTableView.css";

/**
 * 📊 Таблиця інтегрованої системи захисту
 * Очікує вже об'єднану систему: масив об'єктів з датами, препаратами, хворобами
 */
export default function IntegratedTableView({ data = [] }) {
  const diseases = ["Фітофтороз", "Сіра гниль", "Альтернаріоз", "Бактеріоз"];

  // 🔁 Формуємо карту: { дата: { "Фітофтороз": "препарат", ... } }
  const diseaseMap = {};

  data.forEach((entry) => {
    const date = entry.Дата;
    if (!diseaseMap[date]) {
      diseaseMap[date] = {};
      for (const d of diseases) diseaseMap[date][d] = "";
    }

    const affected = (entry.Хвороби || "").split(",").map((d) => d.trim());

    affected.forEach((disease) => {
      if (diseases.includes(disease)) {
        diseaseMap[date][disease] += (diseaseMap[date][disease] ? "\n" : "") + entry.Препарат;
      }
    });
  });

  const sortedDates = Object.keys(diseaseMap).sort((a, b) => {
    const [dA, mA, yA] = a.split(".");
    const [dB, mB, yB] = b.split(".");
    return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
  });

  return (
    <div className="integrated-table-container">
      <h3 className="integrated-table-title">Інтегрована система захисту</h3>

      <table className="integrated-table">
        <thead>
          <tr>
            <th>Дата</th>
            {diseases.map((d) => (
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedDates.map((date) => (
            <tr key={date}>
              <td className="date-cell">{date}</td>
              {diseases.map((d) => (
                <td key={d} className="table-cell">
                  {diseaseMap[date][d]
                    ? diseaseMap[date][d].split("\n").map((line, i) => (
                        <div key={i}>{line}</div>
                      ))
                    : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
