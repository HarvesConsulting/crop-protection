import React from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

export default function WeatherPeriodView({ hourlyData = [] }) {
  if (!Array.isArray(hourlyData) || hourlyData.length === 0) {
    return <p>Немає погодних даних для візуалізації</p>;
  }

  // 🧠 Групуємо погодинні дані по днях
  const dailyMap = {};

  hourlyData.forEach((entry) => {
    const dateStr = format(new Date(entry.date), "dd.MM");
    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = {
        date: dateStr,
        temperatureSum: 0,
        humiditySum: 0,
        windSum: 0,
        rainSum: 0,
        count: 0,
      };
    }

    const d = dailyMap[dateStr];
    d.temperatureSum += entry.temperature;
    d.humiditySum += entry.humidity;
    d.windSum += entry.windspeed;
    d.rainSum += entry.precipitation;
    d.count += 1;
  });

  const chartData = Object.values(dailyMap).map((d) => ({
    date: d.date,
    temperature: +(d.temperatureSum / d.count).toFixed(1),
    humidity: +(d.humiditySum / d.count).toFixed(1),
    windspeed: +(d.windSum / d.count).toFixed(1),
    precipitation: +d.rainSum.toFixed(1),
  }));

  const chartConfigs = [
    {
      dataKey: "temperature",
      name: "Температура (°C)",
      stroke: "#ff7300",
    },
    {
      dataKey: "humidity",
      name: "Вологість (%)",
      stroke: "#007bff",
    },
    {
      dataKey: "windspeed",
      name: "Швидкість вітру (м/с)",
      stroke: "#8884d8",
    },
    {
      dataKey: "precipitation",
      name: "Опади (мм)",
      stroke: "#00b894",
    },
  ];

  return (
    <div className="space-y-8">
      {chartConfigs.map((config) => (
        <div key={config.dataKey} style={{ width: "100%", height: 300 }}>
          <h3 className="text-md font-semibold mb-2">{config.name}</h3>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey={config.dataKey}
                stroke={config.stroke}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}
