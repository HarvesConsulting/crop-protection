import React from "react";
import "./IntegratedTableView.css";
import { parse, differenceInCalendarDays } from "date-fns";

/**
 * 📊 Таблиця інтегрованої системи захисту
 * Об’єднує препарати проти фітофторозу (sprayData) та інших хвороб (diseaseCardsGrouped)
 */
export default function IntegratedTableView({ sprayData = [], diseaseCardsGrouped = [] }) {
  const diseases = ["Фітофтороз", "Сіра гниль", "Альтернаріоз", "Бактеріоз"];

  const parseDate = (d) => parse(d, "dd.MM.yyyy", new Date());

  const integratedMap = {};

  // Створюємо базу по фітофторозу
  sprayData.forEach((entry) => {
    integratedMap[entry.Дата] = {
      Дата: entry.Дата,
      "Фітофтороз": [entry.Препарат],
      "Сіра гниль": [],
      "Альтернаріоз": [],
      "Бактеріоз": [],
    };
  });

  // Об'єднуємо інші хвороби до дат фітофторозу (±3 дні)
  diseaseCardsGrouped.forEach(({ name, entries }) => {
    entries.forEach((entry) => {
      const entryDate = parseDate(entry.Дата);

      let matched = false;
      for (const phytoDate in integratedMap) {
        const phytoParsed = parseDate(phytoDate);
        const delta = Math.abs(differenceInCalendarDays(entryDate, phytoParsed));

        if (delta <= 3) {
          integratedMap[phytoDate][name].push(entry.Препарат);
          matched = true;
          break;
        }
      }

      if (!matched) {
        // якщо не знайдено близької дати — створюємо окремий рядок
        if (!integratedMap[entry.Дата]) {
          integratedMap[entry.Дата] = {
            Дата: entry.Дата,
            "Фітофтороз": [],
            "Сіра гниль": [],
            "Альтернаріоз": [],
            "Бактеріоз": [],
          };
        }
        integratedMap[entry.Дата][name].push(entry.Препарат);
      }
    });
  });

  const rows = Object.values(integratedMap).sort((a, b) => parseDate(a.Дата) - parseDate(b.Дата));

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
          {rows.map((row) => (
            <tr key={row.Дата}>
              <td className="date-cell">{row.Дата}</td>
              {diseases.map((disease) => (
                <td key={disease} className="table-cell">
                  {row[disease]?.length
                    ? row[disease].map((prep, i) => <div key={i}>{prep}</div>)
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
