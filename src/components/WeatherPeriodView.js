// WeatherPeriodView.js
import React, { useMemo } from "react";
import { format, isValid } from "date-fns";

function asDate(v) {
  if (v instanceof Date) return isValid(v) ? v : null;
  const d = new Date(v);
  return isValid(d) ? d : null;
}

export default function WeatherPeriodView({
  hourlyData = [],
  startDate,
  endDate,
}) {
  const start = asDate(startDate);
  const end = asDate(endDate);

  // Фільтрація по періоду
  const rows = useMemo(() => {
    return (hourlyData || [])
      .map((h) => {
        const d = asDate(h.date);
        if (!d) return null;
        return {
          date: d,
          hour: h.hour ?? d.getHours(),
          temperature: Number(h.temperature),
          humidity: Number(h.humidity), // якщо є у твоїх даних (OpenMeteo/NASA)
          windspeed: Number(h.windspeed),
          precipitation: Number(h.precipitation),
        };
      })
      .filter((r) => r && (!start || r.date >= start) && (!end || r.date <= end))
      .sort((a, b) => a.date - b.date || a.hour - b.hour);
  }, [hourlyData, start, end]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span role="img" aria-label="weather">⏱️</span>
        <h4 className="font-semibold text-lg">Погодні умови (погодинно)</h4>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="min-w-[720px] w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-gray-100">
            <tr>
              <th className="p-2 border-b text-left">Дата</th>
              <th className="p-2 border-b text-right">Година</th>
              <th className="p-2 border-b text-right">Температура °C</th>
              <th className="p-2 border-b text-right">Вологість %</th>
              <th className="p-2 border-b text-right">Вітер (м/с)</th>
              <th className="p-2 border-b text-right">Опади (мм)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50">
                <td className="p-2 border-b">{format(r.date, "dd.MM.yyyy")}</td>
                <td className="p-2 border-b text-right">{String(r.hour).padStart(2, "0")}:00</td>
                <td className="p-2 border-b text-right">{isFinite(r.temperature) ? r.temperature.toFixed(1) : "—"}</td>
                <td className="p-2 border-b text-right">{isFinite(r.humidity) ? r.humidity.toFixed(0) : "—"}</td>
                <td className="p-2 border-b text-right">{isFinite(r.windspeed) ? r.windspeed.toFixed(1) : "—"}</td>
                <td className="p-2 border-b text-right">{isFinite(r.precipitation) ? r.precipitation.toFixed(1) : "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Немає погодинних даних
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
