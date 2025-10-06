import React from "react";
import { getAccumulatedStats } from "../steps/Step4Results";
import { format } from "date-fns";

export default function WeatherSummary({ diagnostics, rainDaily, startDate, endDate }) {
  const { condHours, rain } = getAccumulatedStats(diagnostics, startDate, endDate);

  let recommendation = "—";
  let products = [];

  if (condHours <= 10) {
    recommendation = "Не потребує бакових сумішей.";
    products = ["Контакт 1", "Контакт 2"];
  } else if (condHours <= 20) {
    recommendation = "Потребує бакової суміші з контактними препаратами.";
    products = ["Контакт 1", "Контакт 2", "Контакт 3"];
  } else {
    recommendation = "Потребує бакової суміші з двох системних і контактного препарату.";
    products = ["Системний 1", "Системний 2", "Контактний"];
  }

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold mb-2">🌾 Агрономічний підсумок за період</h3>
      <p>
        <strong>Період:</strong>{" "}
        {format(new Date(startDate), "dd.MM.yyyy")} — {format(new Date(endDate), "dd.MM.yyyy")}
      </p>
      <p><strong>Сприятливі години:</strong> {condHours}</p>
      <p><strong>Опади:</strong> {rain.toFixed(1)} мм</p>
      <p className="mt-2"><strong>Рекомендація:</strong> {recommendation}</p>

      <div className="mt-2">
        <strong>Препарати:</strong>
        <ul className="list-disc list-inside">
          {products.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
