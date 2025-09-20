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
  useForecast,
  diseases,
  lastSprayDate, // ✅ нове
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
        // 🔹 історичні дані
        [wx, rain] = await Promise.all([
          fetchWeatherFromNASA(region.lat, region.lon, plantingDate, harvestDate),
          fetchDailyRainFromNASA(region.lat, region.lon, plantingDate, harvestDate),
        ]);
      } else {
        const startDate = new Date(plantingDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (startDate < today) {
          // 🔹 якщо старт минулий → історія до сьогодні + прогноз на 14 днів
          const [historyWx, historyRain] = await Promise.all([
            fetchWeatherFromNASA(region.lat, region.lon, plantingDate, today),
            fetchDailyRainFromNASA(region.lat, region.lon, plantingDate, today),
          ]);

          const [forecastWx, forecastRain] = await Promise.all([
            fetchForecastHourly(region.lat, region.lon, today, 14),
            fetchForecastDailyRain(region.lat, region.lon, today, 14),
          ]);

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
          // 🔹 тільки прогноз
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

      // ✅ відсікання даних після останньої обробки
      const last = lastSprayDate ? new Date(lastSprayDate) : null;
      if (last) last.setHours(0, 0, 0, 0);

      const rowsAfter = last ? wx.daily.filter(r => r?.date && r.date > last) : wx.daily;
      const rainAfter = last
        ? (rain?.daily || []).filter(r => r?.date && r.date > last)
        : (rain?.daily || []);

      // ✅ розрахунки тільки з відсіченими даними
      const comp = computeDSVSchedule(rowsAfter, DEFAULT_DSV_THRESHOLD);
      const sprays = computeMultiSpraySchedule(rowsAfter, rainAfter);

      const startForWeeksISO = lastSprayDate || plantingDate;
      const weekly = makeWeeklyPlan(
        comp.rows,
        rainAfter,
        startForWeeksISO,
        RAIN_HIGH_THRESHOLD_MM,
        useForecast ? undefined : 14
      );

      // ✅ рекомендовані години
      const suitable = extractSuitableHoursFromHourly(wx.raw);

      // 🔍 ризики хвороб тільки після останньої обробки
      const diseaseSummary = [];

      if (diseases?.includes("grayMold")) {
        const riskDates = rowsAfter.filter(isGrayMoldRisk).map(d => d.date);
        diseaseSummary.push({ name: "Сіра гниль", riskDates });
      }

      if (diseases?.includes("alternaria")) {
        const riskDates = rowsAfter.filter(isAlternariaRisk).map(d => d.date);
        diseaseSummary.push({ name: "Альтернаріоз", riskDates });
      }

      if (diseases?.includes("bacteriosis")) {
        const riskDates = rowsAfter
          .filter(d => {
            const rv = rainAfter.find(r => r.date.getTime() === d.date.getTime())?.rain || 0;
            return isBacterialRisk(d, rv);
          })
          .map(d => d.date);
        diseaseSummary.push({ name: "Бактеріоз", riskDates });
      }

      // ✅ результат
      const result = {
        sprayDates: sprays.map(d => format(d, "dd.MM.yyyy")),
        diagnostics: comp.rows,
        weeklyPlan: weekly,
        diseaseSummary,
        suitableHours: suitable,
        lastSprayDate: lastSprayDate ? format(new Date(lastSprayDate), "dd.MM.yyyy") : null,
      };

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
