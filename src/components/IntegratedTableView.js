import React from "react";
import "./IntegratedTableView.css";

/**
 * 📊 Таблиця інтегрованої системи захисту
 * Формат: Дата | Препарати
 */
export default function IntegratedTableView({ data = [] }) {
  const mergedByDate = {};

  data.forEach((entry) => {
    const date = entry.Дата;
    if (!mergedByDate[date]) {
      mergedByDate[date] = [];
    }
    mergedByDate[date].push(entry.Препарат);
  });

  const sortedDates = Object.keys(mergedByDate).sort((a, b) => {
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
            <th>Препарати</th>
          </tr>
        </thead>
        <tbody>
          {sortedDates.map((date) => (
            <tr key={date}>
              <td className="date-cell">{date}</td>
              <td className="table-cell">
                {mergedByDate[date].map((prep, i) => (
                  <div key={i}>{prep}</div>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}