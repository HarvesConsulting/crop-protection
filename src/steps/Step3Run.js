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
    <main className="flex justify-center items-start min-h-[70vh] px-3 sm:px-4">
      <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="px-4 sm:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
          
          {/* Заголовок */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
            Крок 3: Розрахунок <span role="img" aria-label="lab"></span>
          </h2>
          
          {/* Обране користувачем */}  
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg"></span>
              <div>
                <div className="text-xs text-gray-600 font-medium">Обране місто</div>
                <div className="text-sm font-semibold text-gray-800">
                  {region?.name || "—"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg"></span>
              <div>
                <div className="text-xs text-gray-600 font-medium">Період розрахунку</div>
                <div className="text-sm font-semibold text-gray-800">
                  {plantingDate} — {harvestDate}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg"></span>
              <div>
                <div className="text-xs text-gray-600 font-medium">Обрані хвороби</div>
                <div className="text-sm font-semibold text-gray-800">
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
                </div>
              </div>
            </div>
          </div>

          {/* Інформація про процес */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5">💡</span>
              <div>
                <div className="font-semibold text-blue-800 text-sm mb-1">
                  Що буде зроблено:
                </div>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Аналіз погодних даних за обраний період</li>
                  <li>Розрахунок ризиків для обраних хвороб</li>
                  <li>Формування графіку обробок</li>
                  <li>Визначення оптимального часу для обприскування</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Повідомлення про помилку */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                <div>
                  <div className="font-semibold text-red-800 text-sm">Помилка</div>
                  <div className="text-red-700 text-sm mt-1">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Анімація або кнопки */}
          {loading ? (
            <div className="text-center py-8">
              <LoadingTractor />                          
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-semibold text-gray-800 text-sm sm:text-base order-2 sm:order-1"
              >
                ← Назад
              </button>
              <button
                onClick={runModel}
                className="px-6 py-3 rounded-xl text-white font-semibold transition flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2 bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl"
              >
                Розрахувати
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}