import React, { useState } from "react";
import {
  fetchForecastHourly,
  fetchForecastDailyRain,
  fetchWeatherFromNASA,
  fetchDailyRainFromNASA,
  computeMultiSpraySchedule,
  computeDSVSchedule,
  makeWeeklyPlan,
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
        [wx, rain] = await Promise.all([
          fetchWeatherFromNASA(region.lat, region.lon, plantingDate, harvestDate),
          fetchDailyRainFromNASA(region.lat, region.lon, plantingDate, harvestDate),
        ]);
      } else {
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

      // ✅ Обчислення рекомендованих годин для кожної дати
      const suitable = {};
      for (const row of wx.daily) {
        const hours = [];
        if (!row?.date || !Array.isArray(row?.hourly)) continue;

        for (let i = 0; i < row.hourly.length; i++) {
          const h = row.hourly[i];
          const t = h?.temp;
          const rh = h?.rh;
          const wind = h?.wind;
          const rain = h?.rain;

          if (
            typeof t === "number" &&
            typeof rh === "number" &&
            typeof wind === "number" &&
            typeof rain === "number" &&
            t >= 10 && t <= 25 &&
            wind <= 4 &&
            rain === 0
          ) {
            hours.push(`${i}:00`);
          }
        }

        const dateStr = format(row.date, "dd.MM.yyyy");
        suitable[dateStr] = hours;
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
