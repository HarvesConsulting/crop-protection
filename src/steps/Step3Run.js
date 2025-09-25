import React, { useState } from "react";
import {
  fetchForecastHourly,
  fetchForecastDailyRain,
  fetchWeatherFromNASA,
  fetchDailyRainFromNASA,
  computeMultiSpraySchedule,
  computeDSVSchedule,
  makeWeeklyPlan,
  transformForecastToHourlyData,
  transformOpenMeteoHourly, // ← 🟢 ОЦЕ додай
  extractSuitableSprayHours,
  fetchArchiveHourlyExtras, // ✅ новий імпорт
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
      let hourlyData = []; // ✅ загальний масив: архівні години + прогнозні

      /* ---------------- ⏳ Архівна погода ---------------- */
      if (startDate < today) {
        const historyEnd = endDate < today ? endDate : today;
        const [historyWx, historyRain, historyHourly] = await Promise.all([
          fetchWeatherFromNASA(region.lat, region.lon, startDate, historyEnd),
          fetchDailyRainFromNASA(region.lat, region.lon, startDate, historyEnd),
          fetchArchiveHourlyExtras(region.lat, region.lon, startDate, historyEnd), // ✅ нова функція
        ]);

        weatherDaily.push(...(historyWx.daily || []));
        rainDaily.push(...(historyRain.daily || []));
        if (Array.isArray(historyHourly?.hourly)) {
  hourlyData.push(...historyHourly.hourly);
}
}
      /* ---------------- 📈 Прогноз ---------------- */
      if (endDate >= today) {
        const forecastStart = startDate > today ? startDate : today;
        const [forecastWx, forecastRain] = await Promise.all([
          fetchForecastHourly(region.lat, region.lon, forecastStart),
          fetchForecastDailyRain(region.lat, region.lon, forecastStart),
        ]);

        const forecastTransformed = transformOpenMeteoHourly(forecastWx.raw);
        // 🛠️ Обчислюємо condHours для прогнозних днів
forecastTransformed.forEach((day) => {
  const wet = Number(day.wetHours);
  const temp = Number(day.wetTempAvg);
  if (!isNaN(wet) && !isNaN(temp)) {
    // ✍️ Тут впиши свою логіку або формулу condHours:
    day.condHours = wet >= 6 && temp >= 15 ? wet : 0;
  } else {
    day.condHours = 0; // 🔒 fallback
  }
});

weatherDaily.push(...forecastTransformed);

        rainDaily.push(...(forecastRain.daily || []));

        // ⚙️ Перетворюємо forecast raw → погодинні дані
        if (forecastWx.raw) {
          const hourlyForecastData = transformForecastToHourlyData(forecastWx.raw);
          hourlyData.push(...hourlyForecastData); // ✅ додаємо прогнозні години
        }
      }
console.log("weatherDaily:", weatherDaily);
console.log("rainDaily:", rainDaily);
console.log("hourlyData:", hourlyData);

      /* ---------------- ❌ Якщо немає даних ---------------- */
      if (weatherDaily.length === 0) {
        setError("Не вдалося отримати погодні дані.");
        setLoading(false);
        return;
      }

      /* ---------------- ✂️ Відрізаємо після останньої обробки ---------------- */
      let rowsAfter = weatherDaily;
      let rainAfter = rainDaily;
      if (lastSprayDate) {
        const last = new Date(lastSprayDate);
        last.setHours(0, 0, 0, 0);
        const nextDay = new Date(last.getTime() + 86400000);

        rowsAfter = rowsAfter.filter((r) => r?.date && r.date >= nextDay);
        rainAfter = rainAfter.filter((r) => r?.date && r.date >= nextDay);
      }

      /* ---------------- 📊 Розрахунок захисту ---------------- */
      const comp = computeDSVSchedule(rowsAfter, DEFAULT_DSV_THRESHOLD);
      const sprays = computeMultiSpraySchedule(rowsAfter, rainAfter, plantingDate);

      const weekly = makeWeeklyPlan(
        comp.rows,
        rainAfter,
        plantingDate,
        RAIN_HIGH_THRESHOLD_MM,
        undefined
      );

      /* ---------------- 🕒 Рекомендовані години ---------------- */
      const suitable = extractSuitableSprayHours(hourlyData);

      // 🔁 Перетворення ключів ISO → формат "dd.MM.yyyy"
      const formattedSuitable = {};
      Object.entries(suitable).forEach(([iso, hours]) => {
        const d = new Date(iso);
        if (!isNaN(d)) {
          const formatted = format(d, "dd.MM.yyyy");
          formattedSuitable[formatted] = hours;
        }
      });

      /* ---------------- 🦠 Аналіз ризику хвороб ---------------- */
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
            const rv =
              rainAfter.find((r) =>
  format(r.date, "yyyy-MM-dd") === format(d.date, "yyyy-MM-dd")
)

                ?.rain || 0;
            return isBacterialRisk(d, rv);
          })
          .map((d) => d.date);
        diseaseSummary.push({ name: "Бактеріоз", riskDates });
      }
// Таблиця з денними даними
console.log("📊 WeatherDaily:");
console.table(weatherDaily.map(d => ({
  date: d.date instanceof Date ? d.date.toISOString().split("T")[0] : d.date,
  wetHours: d.wetHours,
  wetTempAvg: d.wetTempAvg?.toFixed(1),
  allTempAvg: d.allTempAvg?.toFixed(1),
  condHours: d.condHours,
})));

// Таблиця з опадами
console.log("🌧️ RainDaily:");
console.table(rainDaily.map(r => ({
  date: r.date instanceof Date ? r.date.toISOString().split("T")[0] : r.date,
  rain: r.rain,
})));

// Таблиця з погодинними даними
console.log("⏱️ HourlyData:");
console.table(hourlyData.map(h => ({
  date: h.date instanceof Date ? h.date.toISOString().split("T")[0] : h.date,
  hour: h.hour,
  temp: h.temperature?.toFixed(1),
  wind: h.windspeed?.toFixed(1),
  rain: h.precipitation,
})));

      /* ---------------- ✅ Готовий результат ---------------- */
      const result = {
        sprayDates: sprays.map((d) => format(d, "dd.MM.yyyy")),
        diagnostics: comp.rows,
        weeklyPlan: weekly,
        diseaseSummary,
        suitableHours: formattedSuitable, // 🕒 тепер є і архів, і прогноз
        lastSprayDate: lastSprayDate
          ? format(new Date(lastSprayDate), "dd.MM.yyyy")
          : null,
        plantingDate,
        harvestDate,
        rainDaily,
      };

      console.log("Diagnostics (DSV rows):", comp.rows);
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
