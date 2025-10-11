// WeatherPeriodView.js
import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  BarChart,
  ComposedChart,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

export default function WeatherPeriodView({ hourlyData = [] }) {
  if (!Array.isArray(hourlyData) || hourlyData.length === 0) {
    return <p>Немає погодних даних для візуалізації</p>;
  }

  // 🔄 Агрегуємо погодинні дані в щоденні
  const dailyMap = {};

  hourlyData.forEach((entry) => {
    const dateStr = format(new Date(entry.date), "dd.MM");
    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = {
        date: dateStr,
        tempSum: 0,
        humiditySum: 0,
        precipSum: 0,
        condHours: 0,
        count: 0,
      };
    }

    const d = dailyMap[dateStr];
    d.tempSum += entry.temperature;
    d.humiditySum += entry.humidity;
    d.condHours += entry.suitable ? 1 : 0;
    d.precipSum += entry.precipitation;
    d.count += 1;
  });

  const chartData = Object.values(dailyMap).map((d) => ({
    date: d.date,
    temperature: +(d.tempSum / d.count).toFixed(1),
    humidity: +(d.humiditySum / d.count).toFixed(1),
    precipitation: +d.precipSum.toFixed(1),
    condHours: d.condHours,
  }));

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" domain={[0, 100]} />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />

          {/* 🔵 Вологість */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="humidity"
            stroke="#1e90ff"
            name="Вологість (%)"
            dot={false}
          />

          {/* 🟠 Температура */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temperature"
            stroke="#ff7300"
            name="Температура (°C)"
            dot={false}
          />

          {/* 🌧️ Опади */}
          <Bar
            yAxisId="right"
            dataKey="precipitation"
            fill="#90caf9"
            name="Опади (мм)"
          />

          {/* ✅ Сприятливі години */}
          <Bar
            yAxisId="right"
            dataKey="condHours"
            fill="#66bb6a"
            name="Сприятливі години"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
