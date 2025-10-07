import React from "react";
import "./IntegratedTableView.css";

/**
 * 📊 Таблиця інтегрованої системи захисту
 * Приймає вже зібрану інтегровану систему у вигляді масиву об’єктів:
 * [{ Дата, Препарат, Рекомендація, Хвороби, backData }]
 */
export default function IntegratedTableView({ data = [] }) {
  return (
    <div className="integrated-table-container">
      <h3 className="integrated-table-title">Інтегрована система захисту</h3>

      <table className="integrated-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Хвороби</th>
            <th>Препарати</th>
            <th>Рекомендації</th>
            <th>Опади (мм)</th>
            <th>Сприятливі години</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td className="date-cell">{row.Дата}</td>
              <td>{row.Хвороби || "—"}</td>
              <td>{row.Препарат}</td>
              <td>
                {Array.isArray(row.Рекомендація)
                  ? row.Рекомендація.map((r, j) => (
                      <div key={j}>{r}</div>
                    ))
                  : row.Рекомендація || "—"}
              </td>
              <td>
                {row.backData?.rain !== undefined
                  ? row.backData.rain.toFixed(1)
                  : "—"}
              </td>
              <td>{row.backData?.condHours ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
