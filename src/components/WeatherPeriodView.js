import React, { useMemo } from "react";
import { format, parseISO, isWithinInterval } from "date-fns";

export default function WeatherPeriodModal({
  open,
  onClose,
  hourlyData = [],
  startDate,   // Date або ISO-строка
  endDate,     // Date або ISO-строка
  humidThreshold = 90, // поріг "вологих годин"
}) {
  if (!open) return null;

  // Нормалізуємо до Date
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end   = endDate   instanceof Date ? endDate   : new Date(endDate);

  // Допоміжники
  const toDate = (h) => {
    // h.date може бути Date або 'YYYY-MM-DD' або 'YYYY-MM-DDTHH:mm'
    if (h.date instanceof Date) return h.date;
    if (typeof h.date === "string") {
      if (h.date.includes("T")) return parseISO(h.date);
      // якщо окремо date + hour -> зберемо 'YYYY-MM-DDTHH:00:00'
      if (h.hour !== undefined && h.hour !== null) {
        const hh = String(h.hour).padStart(2, "0");
        return parseISO(`${h.date}T${hh}:00:00`);
      }
      try { return parseISO(h.date); } catch { return null; }
    }
    return null;
  };

  const num = (v) => Number(v ?? 0);
  const pick = (h, ...keys) => {
    for (const k of keys) if (h[k] !== undefined) return h[k];
    return undefined;
  };

  // Підготуємо дані
  const rows = useMemo(() => {
    const filtered = hourlyData
      .map((h) => {
        const dt = toDate(h);
        if (!dt || isNaN(dt)) return null;

        // нормалізація полів з різними назвами
        const temperature = num(pick(h, "temperature", "temp", "t"));
        const wind = num(pick(h, "windspeed", "wind", "wind_speed"));
        const rain = num(pick(h, "precipitation", "rain", "opad", "precip"));
        const humidity = num(pick(h, "humidity", "rh", "rel_humidity"));
        return { dt, temperature, wind, rain, humidity };
      })
      .filter(Boolean)
      .filter(({ dt }) =>
        isWithinInterval(dt, { start, end })
      )
      .sort((a, b) => a.dt - b.dt);

    return filtered;
  }, [hourlyData, start, end]);

  // Підсумки
  const totals = useMemo(() => {
    if (rows.length === 0) {
      return { wet: 0, avgTemp: 0, avgWind: 0, sumRain: 0 };
    }
    const wet = rows.filter((r) => r.humidity >= humidThreshold).length;
    const avgTemp = rows.reduce((s, r) => s + r.temperature, 0) / rows.length;
    const avgWind = rows.reduce((s, r) => s + r.wind, 0) / rows.length;
    const sumRain = rows.reduce((s, r) => s + r.rain, 0);
    return { wet, avgTemp, avgWind, sumRain };
  }, [rows, humidThreshold]);

  const exportCSV = () => {
    const head = ["Дата", "Година", "Вологість %", "Температура °C", "Вітер м/с", "Опади мм"];
    const lines = rows.map((r) => [
      format(r.dt, "dd.MM.yyyy"),
      format(r.dt, "HH:mm"),
      r.humidity,
      r.temperature,
      r.wind,
      r.rain,
    ]);
    const csv = [head, ...lines].map((arr) => arr.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weather_period.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[92%] max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">🌦 Погодні умови за період</h3>
            <p className="text-sm text-gray-600">
              {format(start, "dd.MM.yyyy")} — {format(end, "dd.MM.yyyy")}
              {"  "}• Вологі години ≥ {humidThreshold}% RH
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50">
              ⬇️ Експорт CSV
            </button>
            <button onClick={onClose} className="px-3 py-1.5 rounded-md bg-gray-800 text-white text-sm">
              Закрити
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5">
          <div className="rounded-lg border p-3">
            <div className="text-xs text-gray-500">🌫 Вологі години</div>
            <div className="text-xl font-semibold">{totals.wet}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-gray-500">🌡 Середня темп.</div>
            <div className="text-xl font-semibold">{totals.avgTemp.toFixed(1)} °C</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-gray-500">💨 Середній вітер</div>
            <div className="text-xl font-semibold">{totals.avgWind.toFixed(1)} м/с</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-xs text-gray-500">🌧 Опади, сумарно</div>
            <div className="text-xl font-semibold">{totals.sumRain.toFixed(1)} мм</div>
          </div>
        </div>

        {/* Table */}
        <div className="px-5 pb-5 overflow-auto">
          {rows.length === 0 ? (
            <div className="p-6 text-gray-600">Немає даних за вибраний період.</div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 border-b">Дата</th>
                    <th className="text-left px-3 py-2 border-b">Година</th>
                    <th className="text-right px-3 py-2 border-b">Вологість %</th>
                    <th className="text-right px-3 py-2 border-b">Температура °C</th>
                    <th className="text-right px-3 py-2 border-b">Вітер м/с</th>
                    <th className="text-right px-3 py-2 border-b">Опади мм</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} className="odd:bg-white even:bg-gray-50">
                      <td className="px-3 py-2 border-b">{format(r.dt, "dd.MM.yyyy")}</td>
                      <td className="px-3 py-2 border-b">{format(r.dt, "HH:mm")}</td>
                      <td className="px-3 py-2 border-b text-right">{r.humidity}</td>
                      <td className="px-3 py-2 border-b text-right">{r.temperature}</td>
                      <td className="px-3 py-2 border-b text-right">{r.wind}</td>
                      <td className="px-3 py-2 border-b text-right">{r.rain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
