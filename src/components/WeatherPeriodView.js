// src/components/WeatherPeriodView.js
import React from "react";
import { format, isAfter, isBefore } from "date-fns";

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
function pick(obj, keys) {
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  return undefined;
}

export default function WeatherPeriodView({
  hourlyData = [],
  startDate,
  endDate,
  humidThreshold = 90,
}) {
  if (!hourlyData.length || !startDate || !endDate) {
    return <p className="mt-2 text-sm text-gray-500">Дані для періоду відсутні.</p>;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  const filtered = hourlyData.filter((e) => {
    const d = new Date(e.date);
    return !isBefore(d, start) && !isAfter(d, end);
  });

  const daily = {};
  filtered.forEach((e) => {
    const day = format(new Date(e.date), "dd.MM.yyyy");
    if (!daily[day]) {
      daily[day] = { temps: [], winds: [], rain: 0, humidHours: 0 };
    }

    // температура (поля: temperature | temp)
    const t = num(pick(e, ["temperature", "temp"]));
    if (t !== null) daily[day].temps.push(t);

    // вітер (поля: windspeed | wind | wind_speed)
    const w = num(pick(e, ["windspeed", "wind", "wind_speed"]));
    if (w !== null) daily[day].winds.push(w);

    // опади (поля: precipitation | rain | precip | opad)
    const r = num(pick(e, ["precipitation", "rain", "precip", "opad"]));
    if (r !== null) daily[day].rain += r;

    // вологість (поля: humidity | relativehumidity_2m)
    const h = num(pick(e, ["humidity", "relativehumidity_2m"]));
    if (h !== null && h >= humidThreshold) daily[day].humidHours += 1;
  });

  const rows = Object.entries(daily).map(([day, v]) => {
    const avgTemp =
      v.temps.length ? (v.temps.reduce((a, b) => a + b, 0) / v.temps.length).toFixed(1) : "—";
    const avgWind =
      v.winds.length ? (v.winds.reduce((a, b) => a + b, 0) / v.winds.length).toFixed(1) : "—";
    return { day, avgTemp, avgWind, rain: v.rain.toFixed(1), humidHours: v.humidHours };
  });

  if (!rows.length) {
    return <p className="mt-2 text-sm text-gray-500">За обраний період не знайдено годинних даних.</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-5">
      <h3 className="text-lg font-semibold mb-3">Погодні умови за період</h3>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Дата</th>
            <th className="border px-2 py-1">Середня t°C</th>
            <th className="border px-2 py-1">Середній вітер</th>
            <th className="border px-2 py-1">Опади (мм)</th>
            <th className="border px-2 py-1">Вологі години ≥ {humidThreshold}%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.day} className="text-center">
              <td className="border px-2 py-1">{r.day}</td>
              <td className="border px-2 py-1">{r.avgTemp}</td>
              <td className="border px-2 py-1">{r.avgWind}</td>
              <td className="border px-2 py-1">{r.rain}</td>
              <td className="border px-2 py-1">{r.humidHours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
