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

  const rows = useMemo(() => {
    return (hourlyData || [])
      .map((h) => {
        const d = asDate(h.date);
        if (!d) return null;
        return {
          datetime: `${format(d, "dd.MM")} ${String(h.hour ?? d.getHours()).padStart(2, "0")}:00`,
          temperature: Number(h.temperature),
          humidity: Number(h.humidity),
          windspeed: Number(h.windspeed),
          precipitation: Number(h.precipitation),
        };
      })
      .filter((r) => r && (!start || new Date(r.datetime) >= start) && (!end || new Date(r.datetime) <= end));
  }, [hourlyData, start, end]);

  const chartProps = {
    data: rows,
    margin: { top: 10, right: 30, left: 0, bottom: 0 },
  };

  return (
    <div className="space-y-8">
      <h4 className="font-semibold text-lg flex items-center gap-2">
        ⏱️ Погодні умови (графіки)
      </h4>

      {rows.length === 0 ? (
        <div className="text-center text-gray-500 p-4">Немає погодинних даних</div>
      ) : (
        <div className="space-y-10">
          <ChartSection title="🌡️ Температура (°C)" dataKey="temperature" color="#ff6b6b" {...chartProps} />
          <ChartSection title="💧 Вологість (%)" dataKey="humidity" color="#339af0" {...chartProps} />
          <ChartSection title="🌬️ Швидкість вітру (м/с)" dataKey="windspeed" color="#20c997" {...chartProps} />
          <ChartSection title="☔ Опади (мм)" dataKey="precipitation" color="#845ef7" {...chartProps} />
        </div>
      )}
    </div>
  );
}

function ChartSection({ title, dataKey, color, data, margin }) {
  return (
    <div>
      <h5 className="text-md font-medium mb-2">{title}</h5>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={margin}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="datetime" />
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
