import React from "react";
import "./IntegratedTableView.css";

/**
 * 📊 Таблиця інтегрованої системи захисту
 * Розподіляє препарати по хворобах на основі назв.
 */
export default function IntegratedTableView({ integratedSystem = [] }) {
  const diseases = ["Фітофтороз", "Сіра гниль", "Альтернаріоз", "Бактеріоз"];

  // 🧭 Ключові слова для визначення хвороби за препаратом
  const diseaseKeywords = {
    "Фітофтороз": [
      "Зорвек", "Ридоміл", "Танос", "Акробат", "Орондіс", "Ревус",
      "Курзат", "Ранман", "Інфініто"
    ],
    "Сіра гниль": [
      "Луна Експірієнс", "Сігнум", "Скала", "Тельдор"
    ],
    "Альтернаріоз": [
      "Скор", "Натіво", "Луна Експірієнс", "Сігнум"
    ],
    "Бактеріоз": [
      "Медян", "Казумін", "Серенада"
    ]
  };

  // 🗓️ Формуємо унікальні дати
  const uniqueDates = [
    ...new Set(integratedSystem.map((item) => item.Дата)),
  ].sort((a, b) => {
    const [dA, mA, yA] = a.split(".");
    const [dB, mB, yB] = b.split(".");
    return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
  });

  // 🧮 Створюємо структуру таблиці
  const diseaseMap = {};
  for (const date of uniqueDates) {
    diseaseMap[date] = {};
    for (const dis of diseases) diseaseMap[date][dis] = "";
  }

  // 🧩 Розподіляємо препарати по хворобах
  for (const entry of integratedSystem) {
    const date = entry.Дата;
    const prepList = (entry.Препарат || "")
      .split(",")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    for (const prep of prepList) {
      let matchedDisease = null;

      // 🩺 Визначаємо, до якої хвороби належить препарат
      for (const disease of diseases) {
        if (diseaseKeywords[disease].some((word) => prep.includes(word))) {
          matchedDisease = disease;
          break;
        }
      }

      // Якщо не знайдено — залишаємо в колонці "Фітофтороз" як резерв
      const targetDisease = matchedDisease || "Фітофтороз";

      diseaseMap[date][targetDisease] +=
        (diseaseMap[date][targetDisease] ? "\n" : "") + prep;
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
