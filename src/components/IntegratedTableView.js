import React from "react";
import "./IntegratedTableView.css";

/**
 * 📊 Таблиця інтегрованої системи захисту
 * Побудована лише на diseaseCardsGrouped, де є точні відповідності хворобам
 */
export default function IntegratedTableView({ diseaseCardsGrouped = [] }) {
  const diseases = ["Фітофтороз", "Сіра гниль", "Альтернаріоз", "Бактеріоз"];

  // 🗓️ Усі унікальні дати
  const allDates = [
    ...new Set(
      diseaseCardsGrouped.flatMap((group) =>
        group.entries?.map((e) => e.Дата)
      )
    ),
  ].sort((a, b) => {
    const [dA, mA, yA] = a.split(".");
    const [dB, mB, yB] = b.split(".");
    return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
  });

  // 🧮 Готуємо таблицю
  const diseaseMap = {};
  for (const date of allDates) {
    diseaseMap[date] = {};
    for (const dis of diseases) diseaseMap[date][dis] = "";
  }

  // 🧩 Заповнюємо таблицю препаратами
  for (const group of diseaseCardsGrouped) {
    const { name, entries } = group;
    if (!diseases.includes(name)) continue;

    for (const entry of entries) {
      const date = entry.Дата;
      const prep = entry.Препарат;
      if (!date || !prep) continue;

      // Якщо в цій даті вже є препарат для цієї хвороби, додаємо через новий рядок
      diseaseMap[date][name] += (diseaseMap[date][name] ? "\n" : "") + prep;
    }
  }

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
          {allDates.map((date) => (
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
