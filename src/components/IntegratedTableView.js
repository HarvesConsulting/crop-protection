import React from "react";
import "./IntegratedTableView.css";

/**
 * 📊 Таблиця інтегрованої системи захисту
 * Відображає всі дати у рядках та основні хвороби у стовпцях.
 */
export default function IntegratedTableView({
  integratedSystem = [],
  diseaseCardsGrouped = [],
}) {
  // 🧭 Основні хвороби
  const diseases = ["Фітофтороз", "Сіра гниль", "Альтернаріоз", "Бактеріоз"];

  // 🧩 Збираємо всі унікальні дати (з обох джерел)
  const allDates = [
    ...new Set([
      ...integratedSystem.map((item) => item.Дата),
      ...diseaseCardsGrouped.flatMap((group) =>
        group.entries?.map((e) => e.Дата)
      ),
    ]),
  ].sort((a, b) => {
    const [dA, mA, yA] = a.split(".");
    const [dB, mB, yB] = b.split(".");
    return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
  });

  // 🧮 Структура { дата: { хвороба: препарат } }
  const diseaseMap = {};
  for (const date of allDates) {
    diseaseMap[date] = {};
    for (const dis of diseases) diseaseMap[date][dis] = "";
  }

  // 🧩 1️⃣ Заповнюємо фітофтороз ТІЛЬКИ з integratedSystem
  for (const entry of integratedSystem) {
    const date = entry.Дата;
    const prep = entry.Препарат;
    if (!date || !prep) continue;
    diseaseMap[date]["Фітофтороз"] +=
      (diseaseMap[date]["Фітофтороз"] ? ", " : "") + prep;
  }

  // 🧩 2️⃣ Заповнюємо решту хвороб із diseaseCardsGrouped
  for (const diseaseGroup of diseaseCardsGrouped) {
    const { name, entries } = diseaseGroup;
    if (!entries || !diseases.includes(name)) continue;

    for (const item of entries) {
      const date = item.Дата;
      const prep = item.Препарат;
      if (!date || !prep) continue;

      // ❗ Не дублюємо препарат у "Фітофтороз", якщо така дата вже існує там
      if (diseaseMap[date]["Фітофтороз"]?.includes(prep)) continue;

      diseaseMap[date][name] +=
        (diseaseMap[date][name] ? ", " : "") + prep;
    }
  }

  // 🧩 3️⃣ Очищаємо випадки, коли "Фітофтороз" дублює інші препарати
  for (const date of allDates) {
    const phytoText = diseaseMap[date]["Фітофтороз"];
    if (!phytoText) continue;

    // Якщо цей препарат зустрічається в інших хворобах — прибираємо його з Фітофторозу
    for (const dis of diseases.filter((d) => d !== "Фітофтороз")) {
      const other = diseaseMap[date][dis];
      if (other && phytoText.includes(other)) {
        diseaseMap[date]["Фітофтороз"] = phytoText
          .split(", ")
          .filter((t) => !other.includes(t))
          .join(", ");
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
          {allDates.map((date) => (
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
