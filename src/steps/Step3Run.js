import React, { useState } from "react";
import {
  fetchForecastHourly,
  fetchForecastDailyRain,
  fetchWeatherFromNASA,
  fetchDailyRainFromNASA,
  computeMultiSpraySchedule,
  computeDSVSchedule,
  makeWeeklyPlan,
  extractSuitableHoursFromHourly,
} from "../engine";

import {
  isGrayMoldRisk,
  isAlternariaRisk,
  isBacterialRisk,
} from "../diseases";

import { format } from "date-fns";

const DEFAULT_DSV_THRESHOLD = 15;
const RAIN_HIGH_THRESHOLD_MM = 12.7;

export default function Step3Run({
  region,
  plantingDate,
  harvestDate,
  diseases,
  lastSprayDate,
  onResult,
  onBack,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runModel = async () => {
    setError("");
    setLoading(true);

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = new Date(plantingDate);
      const endDate = new Date(harvestDate);

      let weatherDaily = [];
      let rainDaily = [];
      let rawHourly = [];

      // ⏳ Архівна погода (до сьогодні)
      if (startDate < today) {
        const historyEnd = endDate < today ? endDate : today;
        const [historyWx, historyRain] = await Promise.all([
          fetchWeatherFromNASA(region.lat, region.lon, startDate, historyEnd),
          fetchDailyRainFromNASA(region.lat, region.lon, startDate, historyEnd),
        ]);
        weatherDaily.push(...(historyWx.daily || []));
        rainDaily.push(...(historyRain.daily || []));
      }

      // 📈 Прогноз (сьогодні і далі)
      if (endDate >= today) {
        const forecastStart = startDate > today ? startDate : today;
        const [forecastWx, forecastRain] = await Promise.all([
          fetchForecastHourly(region.lat, region.lon, forecastStart),
          fetchForecastDailyRain(region.lat, region.lon, forecastStart),
        ]);
        weatherDaily.push(...(forecastWx.daily || []));
        rainDaily.push(...(forecastRain.daily || []));
        rawHourly = forecastWx.daily; // для рекомендованих годин
      }

      if (weatherDaily.length === 0) {
        setError("Не вдалося отримати погодні дані.");
        setLoading(false);
        return;
      }

      // ✂️ Обрізаємо після останньої обробки (якщо вказано)
      let rowsAfter = weatherDaily;
      let rainAfter = rainDaily;
      if (lastSprayDate) {
        const last = new Date(lastSprayDate);
        last.setHours(0, 0, 0, 0);
        const nextDay = new Date(last.getTime() + 86400000);
        rowsAfter = rowsAfter.filter((r) => r?.date && r.date >= nextDay);
        rainAfter = rainAfter.filter((r) => r?.date && r.date >= nextDay);
      }

      // 📊 Розрахунок захисту
      const comp = computeDSVSchedule(rowsAfter, DEFAULT_DSV_THRESHOLD);
      const sprays = computeMultiSpraySchedule(rowsAfter, rainAfter);

      const weekly = makeWeeklyPlan(
        comp.rows,
        rainAfter,
        plantingDate,
        RAIN_HIGH_THRESHOLD_MM,
        undefined
      );

      const suitable = extractSuitableHoursFromHourly(rawHourly);

      // 🦠 Аналіз ризику хвороб
      const diseaseSummary = [];

      if (diseases.includes("grayMold")) {
        const riskDates = rowsAfter.filter(isGrayMoldRisk).map((d) => d.date);
        diseaseSummary.push({ name: "Сіра гниль", riskDates });
      }

      if (diseases.includes("alternaria")) {
        const riskDates = rowsAfter.filter(isAlternariaRisk).map((d) => d.date);
        diseaseSummary.push({ name: "Альтернаріоз", riskDates });
      }

      if (diseases.includes("bacteriosis")) {
        const riskDates = rowsAfter
          .filter((d) => {
            const rv = rainAfter.find((r) => r.date.getTime() === d.date.getTime())?.rain || 0;
            return isBacterialRisk(d, rv);
          })
          .map((d) => d.date);
        diseaseSummary.push({ name: "Бактеріоз", riskDates });
      }

      // ✅ Готовий результат
      const result = {
        sprayDates: sprays.map((d) => format(d, "dd.MM.yyyy")),
        diagnostics: comp.rows,
        weeklyPlan: weekly,
        diseaseSummary,
        suitableHours: suitable,
        lastSprayDate: lastSprayDate
          ? format(new Date(lastSprayDate), "dd.MM.yyyy")
          : null,
      };

      console.log("Step3Run → result:", result);
      onResult(result);
    } catch (e) {
      setError(`Помилка обчислення: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Крок 3: Розрахунок 🧪</h2>

      <p>
        Натисніть кнопку, щоб розрахувати систему захисту на весь сезон: від{" "}
        <strong>{plantingDate}</strong> до <strong>{harvestDate}</strong>.
      </p>

      {error && (
        <div style={{ color: "red", marginBottom: 10 }}>⚠️ {error}</div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button
          onClick={onBack}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            background: "#eee",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Назад
        </button>

        <button
          onClick={runModel}
          disabled={loading}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            background: loading ? "#888" : "#2d6cdf",
            color: "#fff",
            borderRadius: "6px",
            cursor: loading ? "wait" : "pointer",
          }}
        >
          {loading ? "Обчислення..." : "Запустити розрахунок"}
        </button>
      </div>
    </div>
  );
}
