import React from "react";
import "./IntegratedTableView.css";

const DISEASES = ["Фітофтороз", "Сіра гниль", "Альтернаріоз", "Бактеріоз"];

export default function IntegratedTableView({ entries }) {
  const tableData = {};

  entries.forEach((entry) => {
    const date = entry.Дата;
    if (!tableData[date]) tableData[date] = {};

    const products = Array.isArray(entry.Препарат)
      ? entry.Препарат
      : [entry.Препарат];

    products.forEach((product) => {
      if (product.includes("Зорвек") || product.includes("Ридоміл")) {
        tableData[date]["Фітофтороз"] = product;
      } else if (product.includes("Тельдор") || product.includes("Сігнум")) {
        tableData[date]["Сіра гниль"] = product;
      } else if (product.includes("Скор") || product.includes("Натіво")) {
        tableData[date]["Альтернаріоз"] = product;
      } else if (product.includes("Казумін") || product.includes("Медян")) {
        tableData[date]["Бактеріоз"] = product;
      }
    });
  });

  const sortedDates = Object.keys(tableData).sort((a, b) => {
    const [d1, m1, y1] = a.split(".");
    const [d2, m2, y2] = b.split(".");
    return new Date(`${y1}-${m1}-${d1}`) - new Date(`${y2}-${m2}-${d2}`);
  });

  return (
    <div className="integrated-table-wrapper">
      <table className="integrated-table">
        <thead>
          <tr>
            <th>Дата</th>
            {DISEASES.map((disease) => (
              <th key={disease}>{disease}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedDates.map((date) => (
            <tr key={date}>
              <td>{date}</td>
              {DISEASES.map((disease) => (
                <td key={disease}>
                  {tableData[date][disease] || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
