import React, { useMemo, useEffect } from "react";
import { format, isValid } from "date-fns";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";

function asDate(v) {
  if (v instanceof Date) return isValid(v) ? v : null;
  const d = new Date(v);
  return isValid(d) ? d : null;
}

export default function WeatherPeriodView({ startDate, endDate, hourlyData }) {
  const start = asDate(startDate);
  const end = asDate(endDate);

  useEffect(() => {
    console.group("📊 WeatherPeriodView Debug");
    console.log("✅ Вхідні параметри:");
    console.log("startDate:", startDate, "→", start);
    console.log("endDate:", endDate, "→", end);
    console.log("externalHourlyData:", hourlyData?.length);
    console.groupEnd();
  }, [startDate, endDate, hourlyData]);

  const data = useMemo(() => {
    return (hourlyData || [])
      .map((h) => {
        const d = asDate(h.date);
        if (!d) return null;
        return {
          datetime: `${format(d, "dd.MM")} ${String(h.hour).padStart(2, "0")}:00`,
          temperature: Number(h.temperature),
          humidity: Number(h.humidity),
          windspeed: Number(h.windspeed),
          precipitation: Number(h.precipitation),
        };
      })
      .filter((r) => r && (!start || asDate(r.date) >= start) && (!end || asDate(r.date) <= end));
  }, [hourlyData, start, end]);

  const chartStyle = {
    marginBottom: "2rem",
    width: "100%",
    height: 300,
  };

  const renderChart = (dataKey, label, color) => (
    <div style={chartStyle}>
      <h4 className="font-semibold text-base mb-2">{label}</h4>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="datetime" tick={{ fontSize: 10 }} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  if (!data.length) {
    return (
      <div className="text-center text-gray-500 p-4">Немає погодинних даних</div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4 shadow-sm space-y-6">
      <div className="flex items-center gap-2 mb-3">
        <span role="img" aria-label="weather">📈</span>
        <h4 className="font-semibold text-lg">Погодні умови (графіки)</h4>
      </div>

      {renderChart("temperature", "Температура (°C)", "#ff7300")}
      {renderChart("humidity", "Вологість (%)", "#8884d8")}
      {renderChart("windspeed", "Швидкість вітру (м/с)", "#00bcd4")}
      {renderChart("precipitation", "Опади (мм)", "#82ca9d")}
    </div>
  );
}
