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
    // 1️⃣ Спочатку бактеріоз (унікальні)
    if (/Медян|Казумін|Серенада/i.test(prep)) {
      diseaseMap[date]["Бактеріоз"] +=
        (diseaseMap[date]["Бактеріоз"] ? ", " : "") + prep;

    // 2️⃣ Потім альтернаріоз (має пріоритет над сірою гниллю)
    } else if (/Альтер|Луна|Сігнум|Скала|Тельдор|Скор|Натіво/i.test(prep)) {
      diseaseMap[date]["Альтернаріоз"] +=
        (diseaseMap[date]["Альтернаріоз"] ? ", " : "") + prep;

    // 3️⃣ Потім сіра гниль (але без повторів альтернаріозу)
    } else if (/Луна|Сігнум|Скала|Тельдор|Скор|Натіво/i.test(prep)) {
      if (!diseaseMap[date]["Альтернаріоз"].includes(prep)) {
        diseaseMap[date]["Сіра гниль"] +=
          (diseaseMap[date]["Сіра гниль"] ? ", " : "") + prep;
      }

    // 4️⃣ Нарешті фітофтороз
    } else if (/Зорвек|Ридоміл|Танос|Акробат|Орондіс|Ревус|Курзат|Ранман|Інфініто/i.test(prep)) {
      diseaseMap[date]["Фітофтороз"] +=
        (diseaseMap[date]["Фітофтороз"] ? ", " : "") + prep;
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
