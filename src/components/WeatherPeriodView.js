import React, { useMemo, useEffect } from "react";
import { format, isValid } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Перевірка дати
function asDate(v) {
  if (v instanceof Date) return isValid(v) ? v : null;
  const d = new Date(v);
  return isValid(d) ? d : null;
}

export default function WeatherPeriodView({ startDate, endDate, hourlyData }) {
  const start = asDate(startDate);
  const end = asDate(endDate);

  // Логування для дебагу
  useEffect(() => {
    console.group("📊 WeatherPeriodView Debug");
    console.log("startDate:", startDate, "→", start);
    console.log("endDate:", endDate, "→", end);
    console.log("externalHourlyData:", hourlyData?.length);
    console.groupEnd();
  }, [startDate, endDate, hourlyData]);

  // Обробка погодинних даних
  const rows = useMemo(() => {
    const processed = (hourlyData || [])
      .map((h) => {
        const d = asDate(h.date);
        if (!d) return null;
        return {
          date: d,
          hour: h.hour ?? d.getHours(),
          temperature: Number(h.temperature),
          humidity: Number(h.humidity),
          windspeed: Number(h.windspeed),
          precipitation: Number(h.precipitation),
        };
      })
      .filter((r) => r && (!start || r.date >= start) && (!end || r.date <= end))
      .sort((a, b) => a.date - b.date || a.hour - b.hour);

    // Додаємо рядок datetime для X-осі
    return processed.map((r) => ({
      ...r,
      datetime: `${format(r.date, "dd.MM")} ${String(r.hour).padStart(2, "0")}:00`,
    }));
  }, [hourlyData, start, end]);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span role="img" aria-label="weather">⏱️</span>
        <h4 className="font-semibold text-lg">Погодні умови (графіки)</h4>
      </div>

      {rows.length === 0 ? (
        <div className="text-center text-gray-500 p-4">Немає погодинних даних</div>
      ) : (
        <div className="space-y-10">
          <ChartSection title="🌡️ Температура (°C)" dataKey="temperature" color="#ef4444" data={rows} />
          <ChartSection title="💧 Вологість (%)" dataKey="humidity" color="#3b82f6" data={rows} />
          <ChartSection title="🌬️ Вітер (м/с)" dataKey="windspeed" color="#10b981" data={rows} />
          <ChartSection title="☔ Опади (мм)" dataKey="precipitation" color="#8b5cf6" data={rows} />
        </div>
      )}
    </div>
  );
}

// Відображення одного графіку
function ChartSection({ title, dataKey, color, data }) {
  return (
    <div>
      <h5 className="text-md font-medium mb-2">{title}</h5>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="datetime" minTickGap={20} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
