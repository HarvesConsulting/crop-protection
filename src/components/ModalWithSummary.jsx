import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { differenceInDays, format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ModalWithSummary({
  open,
  onOpenChange,
  startDate,
  endDate,
  diagnostics = [],
  rainDaily = [],
}) {
  if (!open) return null;

  const numDays = differenceInDays(new Date(endDate), new Date(startDate)) + 1;

  const totalHours = diagnostics.reduce((sum, entry) => {
    const h = Number(entry.condHours ?? entry.cond_hours ?? entry.hours);
    return sum + (isNaN(h) ? 0 : h);
  }, 0);

  const totalRain = rainDaily.reduce((sum, entry) => {
    const v = Number(entry.rain ?? entry.precip ?? entry.opad);
    return sum + (isNaN(v) || v < 0 ? 0 : v);
  }, 0);

  const hoursPerDay = totalHours / numDays;
  const hoursPerDayRounded = hoursPerDay.toFixed(1);

  const riskLevel =
    hoursPerDay < 1.6
      ? { label: "Низький ризик захворювання", color: "green" }
      : hoursPerDay < 2.6
      ? { label: "Середній ризик захворювання", color: "orange" }
      : { label: "Високий ризик захворювання", color: "red" };

  const data = Array.from({ length: numDays }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = format(date, "yyyy-MM-dd");

    const condEntry = diagnostics.find((d) => d.date?.startsWith?.(dateStr));
    const rainEntry = rainDaily.find((r) => r.date?.startsWith?.(dateStr));

    return {
      date: format(date, "dd.MM"),
      hours: condEntry?.condHours ?? 0,
      rain: rainEntry?.rain ?? 0,
    };
  });

  const [showRain, setShowRain] = useState(true);
  const [showHours, setShowHours] = useState(true);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>📊 Агрономічний підсумок</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-base leading-relaxed">
          <p>
            <strong>Період:</strong> {format(new Date(startDate), "dd.MM.yyyy")} — {format(new Date(endDate), "dd.MM.yyyy")}
          </p>
          <p>
            <strong>Кількість днів:</strong> {numDays}
          </p>
          <p>
            <strong>Сумарна кількість сприятливих годин:</strong> {totalHours}
          </p>
          <p>
            <strong>Сприятливих годин на добу (в середньому):</strong> {hoursPerDayRounded}
          </p>
          <p>
            <strong>Опадів за період:</strong> {totalRain.toFixed(1)} мм
          </p>
          <p>
            <strong>Рівень ризику:</strong>{" "}
            <span style={{ color: riskLevel.color, fontWeight: "bold" }}>
              ● {riskLevel.label}
            </span>
          </p>

          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showHours}
                onChange={() => setShowHours((prev) => !prev)}
              />
              Сприятливі години
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showRain}
                onChange={() => setShowRain((prev) => !prev)}
              />
              Опади
            </label>
          </div>

          <h4 className="text-lg mt-4 font-medium">Динаміка ризику по днях</h4>

          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" label={{ value: "Години", angle: -90, position: "insideLeft" }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: "Опади (мм)", angle: -90, position: "insideRight" }}
                />
                <Tooltip />
                <Legend />
                {showHours && (
                  <Line
                    type="monotone"
                    dataKey="hours"
                    name="Сприятливі години"
                    stroke="#00c853"
                    strokeWidth={2}
                    yAxisId="left"
                    dot={{ r: 2 }}
                  />
                )}
                {showRain && (
                  <Line
                    type="monotone"
                    dataKey="rain"
                    name="Опади (мм)"
                    stroke="#2196f3"
                    strokeWidth={2}
                    yAxisId="right"
                    dot={{ r: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
