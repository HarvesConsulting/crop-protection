// src/components/WeatherPeriodView.js
import React, { useState } from "react";
import { format, parseISO, isWithinInterval } from "date-fns";

export default function WeatherPeriodView({ hourlyData = [] }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filtered =
    startDate && endDate
      ? hourlyData.filter((entry) => {
          const date = parseISO(entry.date);
          return isWithinInterval(date, {
            start: new Date(startDate),
            end: new Date(endDate),
          });
        })
      : [];

  const wetHours = filtered.filter((h) => Number(h.humidity) >= 90).length;
  const avgTemp =
    filtered.reduce((sum, h) => sum + (Number(h.temp) || 0), 0) /
      (filtered.length || 1);
  const avgWind =
    filtered.reduce((sum, h) => sum + (Number(h.wind) || 0), 0) /
      (filtered.length || 1);
  const rainSum = filtered.reduce(
    (sum, h) => sum + (Number(h.rain) || 0),
    0
  );

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4 mt-4">
      <h3 className="font-bold text-lg">🌦 Погодні умови за період</h3>

      {/* Вибір періоду */}
      <div className="flex gap-3 items-center">
        <div>
          <label className="block text-sm">Початок:</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm">Кінець:</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>

      {/* Статистика */}
      {filtered.length > 0 ? (
        <>
          <ul className="list-disc pl-6 space-y-1 text-gray-700">
            <li>
              🌫 Вологі години (RH ≥ 90%): <strong>{wetHours}</strong>
            </li>
            <li>
              🌡 Середня температура:{" "}
              <strong>{avgTemp.toFixed(1)} °C</strong>
            </li>
            <li>
              💨 Середня швидкість вітру:{" "}
              <strong>{avgWind.toFixed(1)} м/с</strong>
            </li>
            <li>
              🌧 Загальна кількість опадів:{" "}
              <strong>{rainSum.toFixed(1)} мм</strong>
            </li>
          </ul>

          {/* Таблиця */}
          <table className="w-full text-sm border border-gray-200 mt-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-2 py-1">Дата</th>
                <th className="border px-2 py-1">Година</th>
                <th className="border px-2 py-1">Вологість %</th>
                <th className="border px-2 py-1">Темп. °C</th>
                <th className="border px-2 py-1">Вітер м/с</th>
                <th className="border px-2 py-1">Опади мм</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => (
                <tr key={i} className="text-center">
                  <td className="border px-2 py-1">
                    {h.date.split("T")[0]}
                  </td>
                  <td className="border px-2 py-1">
                    {h.date.split("T")[1]}
                  </td>
                  <td className="border px-2 py-1">{h.humidity}</td>
                  <td className="border px-2 py-1">{h.temp}</td>
                  <td className="border px-2 py-1">{h.wind}</td>
                  <td className="border px-2 py-1">{h.rain}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p className="text-gray-500">
          Оберіть період, щоб побачити дані 🌍
        </p>
      )}
    </div>
  );
}
