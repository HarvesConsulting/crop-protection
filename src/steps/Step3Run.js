import React, { useState } from "react";
import {
  fetchForecastHourly,
  fetchForecastDailyRain,
  fetchWeatherFromNASA,
  fetchDailyRainFromNASA,
  computeMultiSpraySchedule,
  computeDSVSchedule,
  makeWeeklyPlan,
  dsvFromWet,
} from "../engine"; // ТУТ: заміни на свій файл з логікою (можливо, потрібно перенести всі функції в engine.js або utils.js)

import { format, parseISO } from "date-fns";

const DEFAULT_DSV_THRESHOLD = 15;
const RAIN_HIGH_THRESHOLD_MM = 12.7;

export default function Step3Run({
  region,
  plantingDate,
  harvestDate,
  useForecast,
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
  // ІСТОРИЧНА МОДЕЛЬ
  [wx, rain] = await Promise.all([
    fetchWeatherFromNASA(region.lat, region.lon, plantingDate, harvestDate),
    fetchDailyRainFromNASA(region.lat, region.lon, plantingDate, harvestDate),
  ]);
} else {
  // ПРОГНОЗ НА 14 ДНІВ
  wx = await fetchForecastHourly(region.lat, region.lon, plantingDate, 14);
  rain = await fetchForecastDailyRain(region.lat, region.lon, plantingDate, 14);
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

      const result = {
        sprayDates: sprays.map((d) => format(d, "dd.MM.yyyy")),
        diagnostics: comp.rows,
        weeklyPlan: weekly,
      };

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
        Натисніть кнопку, щоб отримати {useForecast ? "модель захисту за історичними даними" : "14-денний прогноз"}.
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
