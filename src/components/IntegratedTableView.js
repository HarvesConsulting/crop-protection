import React from "react";
import "./IntegratedTableView.css";

/**
 * 📊 Таблиця інтегрованої системи захисту
 * Дані розподіляються за хворобами відповідно до джерела diseaseCardsGrouped.
 */
export default function IntegratedTableView({ integratedSystem = [], diseaseCardsGrouped = [] }) {
  const diseases = ["Фітофтороз", "Сіра гниль", "Альтернаріоз", "Бактеріоз"];

  // 🗓️ Формуємо список унікальних дат
  const uniqueDates = [
    ...new Set(integratedSystem.map((item) => item.Дата)),
  ].sort((a, b) => {
    const [dA, mA, yA] = a.split(".");
    const [dB, mB, yB] = b.split(".");
    return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
  });

  // 🧮 Підготовка карти: { дата: { хвороба: препарат } }
  const diseaseMap = {};
  for (const date of uniqueDates) {
    diseaseMap[date] = {};
    for (const dis of diseases) diseaseMap[date][dis] = "";
  }

  // 🧩 1️⃣ Заповнюємо препарати проти фітофторозу з integratedSystem
  for (const entry of integratedSystem) {
    const date = entry.Дата;
    const prep = entry.Препарат;
    if (!date || !prep) continue;
    diseaseMap[date]["Фітофтороз"] +=
      (diseaseMap[date]["Фітофтороз"] ? ", " : "") + prep;
  }

  // 🧩 2️⃣ Заповнюємо з diseaseCardsGrouped (інші хвороби)
  for (const diseaseGroup of diseaseCardsGrouped) {
    const { name, entries } = diseaseGroup;
    if (!entries || !diseases.includes(name)) continue;

    for (const item of entries) {
      const date = item.Дата;
      const prep = item.Препарат;
      if (!date || !prep) continue;

      diseaseMap[date][name] +=
        (diseaseMap[date][name] ? ", " : "") + prep;
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
          {uniqueDates.map((date) => (
            <tr key={date}>
              <td className="date-cell">{date}</td>
              {diseases.map((d) => (
                <td key={d} className="table-cell">
                  {diseaseMap[date][d] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
