import React from "react";
import "./IntegratedTableView.css";

/**
 * 📊 Таблиця інтегрованої системи захисту
 * Відображає всі дати у рядках та основні хвороби у стовпцях.
 */
export default function IntegratedTableView({ integratedSystem = [], diseaseCardsGrouped = [] }) {
  // 🧭 Список основних хвороб
  const diseases = ["Фітофтороз", "Сіра гниль", "Альтернаріоз", "Бактеріоз"];

  // 🗓️ Формуємо унікальний список дат і сортуємо
  const uniqueDates = [
    ...new Set(integratedSystem.map((item) => item.Дата)),
  ].sort((a, b) => {
    const [dA, mA, yA] = a.split(".");
    const [dB, mB, yB] = b.split(".");
    return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
  });

  // 🧩 Окремі набори препаратів по хворобах
  const sets = {
    "Фітофтороз": [
      "Зорвек", "Ридоміл", "Танос", "Акробат", "Орондіс", "Ревус", "Курзат", "Ранман", "Інфініто"
    ],
    "Сіра гниль": [
      "Луна Експірієнс", "Сігнум", "Скала", "Тельдор", "Скор", "Натіво"
    ],
    "Альтернаріоз": [
      "Альтер", "Сігнум", "Скор", "Натіво", "Луна Експірієнс" // дубльовані, бо ефективні і тут
    ],
    "Бактеріоз": [
      "Медян", "Казумін", "Серенада"
    ]
  };

  // 🧮 Створюємо карту вигляду { дата: { хвороба: препарат } }
  const diseaseMap = {};
  for (const date of uniqueDates) {
    diseaseMap[date] = {};
    for (const dis of diseases) diseaseMap[date][dis] = "";
  }

  // 🧩 Розподіляємо препарати по стовпцях
  for (const entry of integratedSystem) {
    const date = entry.Дата;
    const prepList = (entry.Препарат || "").split(",").map((p) => p.trim());

    for (const prep of prepList) {
      let matched = false;

      for (const disease of diseases) {
        if (sets[disease].some((key) => prep.includes(key))) {
          diseaseMap[date][disease] += (diseaseMap[date][disease] ? ", " : "") + prep;
          matched = true;
          break;
        }
      }

      // якщо не знайшли категорію, підкидаємо у "Фітофтороз" (як дефолт)
      if (!matched) {
        diseaseMap[date]["Фітофтороз"] += (diseaseMap[date]["Фітофтороз"] ? ", " : "") + prep;
      }
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
