import React, { useState } from "react";
import {
  fetchForecastHourly,
  fetchForecastDailyRain,
  fetchWeatherFromNASA,
  fetchDailyRainFromNASA,
  computeMultiSpraySchedule,
  computeDSVSchedule,
  makeWeeklyPlan,
  extractSuitableHoursFromHourly, // ✅ додано тут
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
  useForecast,
  diseases,
  onResult,
  onBack,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runModel = async () => {
    setError("");
    setLoading(true);

    try {
      let wx, rain;

      if (useForecast) {
  // 🔹 ІСТОРІЯ: все як є
  [wx, rain] = await Promise.all([
    fetchWeatherFromNASA(region.lat, region.lon, plantingDate, harvestDate),
    fetchDailyRainFromNASA(region.lat, region.lon, plantingDate, harvestDate),
  ]);
} else {
  const startDate = new Date(plantingDate);
  const today = new Date();
  today.setHours(0,0,0,0);

  if (startDate < today) {
    // 🔹 МИНУЛЕ: беремо історію до сьогодні + прогноз від сьогодні +14 днів
    const [historyWx, historyRain] = await Promise.all([
      fetchWeatherFromNASA(region.lat, region.lon, plantingDate, today),
      fetchDailyRainFromNASA(region.lat, region.lon, plantingDate, today),
    ]);

    const [forecastWx, forecastRain] = await Promise.all([
      fetchForecastHourly(region.lat, region.lon, today, 14),
      fetchForecastDailyRain(region.lat, region.lon, today, 14),
    ]);

    // об’єднуємо історичні і прогнозні дані
    wx = {
      daily: [...(historyWx.daily || []), ...(forecastWx.daily || [])],
      raw: forecastWx.raw,
      error: historyWx.error || forecastWx.error,
      url: forecastWx.url,
    };

    rain = {
      daily: [...(historyRain.daily || []), ...(forecastRain.daily || [])],
      error: historyRain.error || forecastRain.error,
      url: forecastRain.url,
    };
  } else {
    // 🔹 СЬОГОДНІ/МАЙБУТНЄ: стандартний прогноз
    wx = await fetchForecastHourly(region.lat, region.lon, plantingDate, 14);
    rain = await fetchForecastDailyRain(region.lat, region.lon, plantingDate, 14);
  }
}

      if (wx.error) {
        setError(`Помилка погоди: ${wx.error}`);
        setLoading(false);
        return;
      }

      if (!Array.isArray(wx.daily) || wx.daily.length === 0) {
        setError("Не отримано погодних даних.");
        setLoading(false);
        return;
      }

      const rows = wx.daily;
      const comp = computeDSVSchedule(rows, DEFAULT_DSV_THRESHOLD);
      const sprays = computeMultiSpraySchedule(rows, rain?.daily || []);

      const startForWeeksISO = plantingDate;
      const weekly = makeWeeklyPlan(
        comp.rows,
        rain?.daily || [],
        startForWeeksISO,
        RAIN_HIGH_THRESHOLD_MM,
        useForecast ? undefined : 14
      );
      console.log("🌐 wx.raw = ", wx.raw);
      // ✅ Обчислення рекомендованих годин для кожної дати
      const suitable = extractSuitableHoursFromHourly(wx.raw);
      console.log("Step3Run → suitableHours keys:", Object.keys(suitable));
for (const [date, hours] of Object.entries(suitable)) {
  console.log(`→ ${date}: ${hours.join(", ")}`);
}

      // 🔍 Ризики хвороб
      const diseaseSummary = [];

      if (diseases?.includes("grayMold")) {
        const riskDates = rows.filter(isGrayMoldRisk).map((d) => d.date);
        diseaseSummary.push({ name: "Сіра гниль", riskDates });
      }

      if (diseases?.includes("alternaria")) {
        const riskDates = rows.filter(isAlternariaRisk).map((d) => d.date);
        diseaseSummary.push({ name: "Альтернаріоз", riskDates });
      }

      if (diseases?.includes("bacteriosis")) {
        const riskDates = rows
          .filter((d) => {
            const rainVal = (rain?.daily || []).find(
              (r) => r.date.getTime() === d.date.getTime()
            )?.rain || 0;
            return isBacterialRisk(d, rainVal);
          })
          .map((d) => d.date);
        diseaseSummary.push({ name: "Бактеріоз", riskDates });
      }

      const result = {
        sprayDates: sprays.map((d) => format(d, "dd.MM.yyyy")),
        diagnostics: comp.rows,
        weeklyPlan: weekly,
        diseaseSummary,
        suitableHours: suitable, // ✅ додаємо години
      };
      // 👇 лог тут
console.log("Step3Run → result:", result);
      onResult(result);
    } catch (e) {
      setError(`Помилка обчислення: ${e?.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Крок 3: Розрахунок</h2>

      <p>
        Натисніть кнопку, щоб отримати{" "}
        {useForecast ? "модель захисту за історичними даними" : "14-денний прогноз"}.
      </p>

      {error && (
        <div style={{ color: "red", marginBottom: 10 }}>
          ⚠️ {error}
        </div>
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
