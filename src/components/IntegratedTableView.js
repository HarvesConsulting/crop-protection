import React from "react";
import "./IntegratedTableView.css";

/**
 * 📊 Таблиця інтегрованої системи захисту
 * Використовує diseaseCardsGrouped для коректного відображення всіх хвороб
 */
export default function IntegratedTableView({ integratedSystem = [], diseaseCardsGrouped = [] }) {
  const diseases = ["Фітофтороз", "Сіра гниль", "Альтернаріоз", "Бактеріоз"];

  // 🗓️ Збираємо всі дати (з усіх груп)
  const allDates = [
    ...new Set([
      ...integratedSystem.map((i) => i.Дата),
      ...diseaseCardsGrouped.flatMap((g) => g.entries?.map((e) => e.Дата)),
    ]),
  ].sort((a, b) => {
    const [dA, mA, yA] = a.split(".");
    const [dB, mB, yB] = b.split(".");
    return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
  });

  // 🧮 Підготовка таблиці
  const diseaseMap = {};
  for (const date of allDates) {
    diseaseMap[date] = {};
    for (const d of diseases) diseaseMap[date][d] = "";
  }

  // 🧩 Заповнюємо дані з diseaseCardsGrouped (бо там є назви хвороб)
  for (const group of diseaseCardsGrouped) {
    const { name, entries } = group;
    if (!diseases.includes(name)) continue;

    for (const entry of entries) {
      const date = entry.Дата;
      const prep = entry.Препарат;
      if (!date || !prep) continue;

      diseaseMap[date][name] += (diseaseMap[date][name] ? "\n" : "") + prep;
    }
  }

  // 🧩 Додаємо дані з integratedSystem лише якщо вони не дублюються
  for (const entry of integratedSystem) {
    const date = entry.Дата;
    const prep = entry.Препарат;
    if (!date || !prep) continue;

    // Якщо цей препарат ще не потрапив у жодну колонку — додаємо у фітофтороз
    const exists = diseases.some((d) => diseaseMap[date][d]?.includes(prep));
    if (!exists) {
      diseaseMap[date]["Фітофтороз"] +=
        (diseaseMap[date]["Фітофтороз"] ? "\n" : "") + prep;
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
