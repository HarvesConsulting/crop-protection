import React from "react";
import "./IntegratedTableView.css";

/**
 * Таблиця інтегрованої системи захисту
 * Відображає всі дати у рядках та основні хвороби у стовпцях.
 */
export default function IntegratedTableView({ integratedSystem = [], diseaseCardsGrouped = [] }) {
  // 🧭 Список усіх можливих хвороб
  const diseases = ["Фітофтороз", "Сіра гниль", "Альтернаріоз", "Бактеріоз"];

  // 🗓️ Формуємо список унікальних дат
  const uniqueDates = [
    ...new Set(integratedSystem.map((item) => item.Дата)),
  ].sort((a, b) => {
    const [dA, mA, yA] = a.split(".");
    const [dB, mB, yB] = b.split(".");
    return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
  });

  // 🧮 Створюємо карту: { дата: { хвороба: препарат } }
  const diseaseMap = {};
  for (const date of uniqueDates) {
    diseaseMap[date] = {};
    for (const dis of diseases) diseaseMap[date][dis] = "";
  }

  // 🧩 Заповнюємо таблицю препаратами з integratedSystem
  for (const entry of integratedSystem) {
    const date = entry.Дата;
    const prepText = entry.Препарат || "";
    // Автоматично визначаємо до якої хвороби належить
    if (/Зорвек|Ридоміл|Танос|Акробат|Орондіс|Ревус|Курзат|Ранман|Інфініто/i.test(prepText)) {
      diseaseMap[date]["Фітофтороз"] = prepText;
    } else if (/Луна|Сігнум|Скала|Тельдор|Скор|Натіво/i.test(prepText)) {
      diseaseMap[date]["Сіра гниль"] = prepText;
    } else if (/Альтер/i.test(prepText)) {
      diseaseMap[date]["Альтернаріоз"] = prepText;
    } else if (/Медян|Казумін|Серенада/i.test(prepText)) {
      diseaseMap[date]["Бактеріоз"] = prepText;
    }
  }

  return (
    <div style={{ overflowX: "auto", marginTop: "1rem" }}>
      <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Інтегрована система захисту
      </h3>

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
                <td key={d} className="cell">
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
