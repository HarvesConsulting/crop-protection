import React, { useState } from "react";
import LoadingTractor from "../components/LoadingTractor";
import {
  fetchForecastHourly,
  fetchForecastDailyRain,
  fetchWeatherFromNASA,
  fetchDailyRainFromNASA,
  computeMultiSpraySchedule,
  computeDSVSchedule,
  makeWeeklyPlan,
  transformForecastToHourlyData,
  transformOpenMeteoHourly,
  extractSuitableSprayHours,
  fetchArchiveHourlyExtras,
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
      let hourlyData = [];

      if (startDate < today) {
        const historyEnd = endDate < today ? endDate : today;
        const [historyWx, historyRain, historyHourly] = await Promise.all([
          fetchWeatherFromNASA(region.lat, region.lon, startDate, historyEnd),
          fetchDailyRainFromNASA(region.lat, region.lon, startDate, historyEnd),
          fetchArchiveHourlyExtras(region.lat, region.lon, startDate, historyEnd),
        ]);

        weatherDaily.push(...(historyWx.daily || []));
        rainDaily.push(...(historyRain.daily || []));
        if (Array.isArray(historyHourly?.hourly)) {
          hourlyData.push(...historyHourly.hourly);
        }
      }

      if (endDate >= today) {
        const forecastStart = startDate > today ? startDate : today;
        const [forecastWx, forecastRain] = await Promise.all([
          fetchForecastHourly(region.lat, region.lon, forecastStart),
          fetchForecastDailyRain(region.lat, region.lon, forecastStart),
        ]);

        const forecastTransformed = transformOpenMeteoHourly(forecastWx.raw);
        forecastTransformed.forEach((day) => {
          const wet = Number(day.wetHours);
          const temp = Number(day.wetTempAvg);
          if (!isNaN(wet) && !isNaN(temp)) {
            day.condHours = wet >= 6 && temp >= 15 ? wet : 0;
          } else {
            day.condHours = 0;
          }
        });

        weatherDaily.push(...forecastTransformed);
        rainDaily.push(...(forecastRain.daily || []));

        if (forecastWx.raw) {
          const hourlyForecastData = transformForecastToHourlyData(forecastWx.raw);
          hourlyData.push(...hourlyForecastData);
        }
      }

      if (weatherDaily.length === 0) {
        setError("Не вдалося отримати погодні дані.");
        setLoading(false);
        return;
      }

      let rowsAfter = weatherDaily;
      let rainAfter = rainDaily;
      if (lastSprayDate) {
        const last = new Date(lastSprayDate);
        last.setHours(0, 0, 0, 0);
        const nextDay = new Date(last.getTime() + 86400000);

        rowsAfter = rowsAfter.filter((r) => r?.date && r.date >= nextDay);
        rainAfter = rainAfter.filter((r) => r?.date && r.date >= nextDay);
      }

      const comp = computeDSVSchedule(rowsAfter, DEFAULT_DSV_THRESHOLD);
      const sprays = computeMultiSpraySchedule(rowsAfter, rainAfter, plantingDate);

      const weekly = makeWeeklyPlan(
        comp.rows,
        rainAfter,
        plantingDate,
        RAIN_HIGH_THRESHOLD_MM,
        undefined
      );

      const suitable = extractSuitableSprayHours(hourlyData);

      const formattedSuitable = {};
      Object.entries(suitable).forEach(([iso, hours]) => {
        const d = new Date(iso);
        if (!isNaN(d)) {
          const formatted = format(d, "dd.MM.yyyy");
          formattedSuitable[formatted] = hours;
        }
      });

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
              )?.rain || 0;
            return isBacterialRisk(d, rv);
          })
          .map((d) => d.date);
        diseaseSummary.push({ name: "Бактеріоз", riskDates });
      }

      const result = {
        sprayDates: sprays.map((d) => format(d, "dd.MM.yyyy")),
        diagnostics: comp.rows,
        weeklyPlan: weekly,
        diseaseSummary,
        suitableHours: formattedSuitable,
        lastSprayDate: lastSprayDate
          ? format(new Date(lastSprayDate), "dd.MM.yyyy")
          : null,
        plantingDate,
        harvestDate,
        rainDaily,
        hourlyData,
      };

      onResult(result);
    } catch (e) {
      setError(`Помилка обчислення: ${e.message || e}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex justify-center items-start min-h-[70vh] px-4">
      <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-md px-6 sm:px-10 py-6 space-y-6">
        
        {/* Заголовок */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Крок 3: Розрахунок <span role="img" aria-label="lab">🧪</span>
        </h2>
        
        {/* Обране користувачем */}  
        <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg space-y-2 text-sm">
          <div>
            <strong>Обране місто:</strong>{" "}
            <span className="text-gray-800">
              {region?.name || "—"}
            </span>
          </div>

          <div>
            <strong>Період:</strong>{" "}
            <span className="text-gray-800">
              {plantingDate} — {harvestDate}
            </span>
          </div>

          <div>
            <strong>Обрані хвороби:</strong>{" "}
            <span className="text-gray-800">
              {diseases.length === 0
                ? "Жодної"
                : diseases
                    .map((id) => {
                      switch (id) {
                        case "lateBlight":
                          return "Фітофтороз";
                        case "grayMold":
                          return "Сіра гниль";
                        case "alternaria":
                          return "Альтернаріоз";
                        case "bacteriosis":
                          return "Бактеріоз";
                        default:
                          return id;
                      }
                    })
                    .join(", ")}
            </span>
          </div>
        </div>

        {/* Повідомлення про помилку */}
        {error && (
          <div className="text-red-600 font-medium mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Анімація або кнопки */}
        {loading ? (
          <LoadingTractor />
        ) : (
          <div className="flex gap-4 mt-4">
            <button
              onClick={onBack}
              className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition text-sm"
            >
              Назад
            </button>

            <button
              onClick={runModel}
              className="px-6 py-2 rounded-md text-white font-medium transition bg-green-600 hover:bg-green-700 text-sm"
            >
              Розрахувати
            </button>
          </div>
        )}
      </div>
    </main>
  );
}