import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useState, useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function ModalWithSummary({
  open,
  onOpenChange,
  startDate,
  endDate,
  diagnostics = [],
  rainDaily = [],
}) {
  const [showHours, setShowHours] = useState(true);
  const [showRain, setShowRain] = useState(true);

  const numDays = differenceInDays(new Date(endDate), new Date(startDate)) + 1;

  const totalHours = diagnostics.reduce((sum, entry) => {
    const h = Number(entry.condHours ?? entry.cond_hours ?? entry.hours);
    return sum + (isNaN(h) ? 0 : h);
  }, 0);

  const totalRain = rainDaily.reduce((sum, entry) => {
    const v = Number(entry.rain ?? entry.precip ?? entry.opad);
    return sum + (isNaN(v) || v < 0 ? 0 : v);
  }, 0);

  const hoursPerDay = +(totalHours / numDays).toFixed(1);

  const riskLevel =
    hoursPerDay <= 1.5
      ? { text: "Низький ризик захворювання", color: "green" }
      : hoursPerDay <= 2.5
      ? { text: "Середній ризик захворювання", color: "orange" }
      : { text: "Високий ризик захворювання", color: "red" };

  const chartData = useMemo(() => {
    return diagnostics.map((d, idx) => {
      const date = d.date || d.day || d.timestamp;
      return {
        date: format(new Date(date), "dd.MM"),
        hours: Number(d.condHours ?? d.cond_hours ?? d.hours) || 0,
        rain:
          Number(
            rainDaily[idx]?.rain ??
              rainDaily[idx]?.precip ??
              rainDaily[idx]?.opad
          ) || 0,
      };
    });
  }, [diagnostics, rainDaily]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ animation: "fadeIn 0.2s ease-out" }}
        >
          <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
              <h2 className="text-lg font-semibold">📊 Агрономічний підсумок</h2>
              <Dialog.Close asChild>
                <button className="text-gray-500 hover:text-red-500">
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </div>

            <div className="p-5 space-y-4 text-base">
              <p>
                <strong>Кількість днів:</strong> {numDays}
              </p>
              <p>
                <strong>Сумарна кількість сприятливих годин:</strong> {totalHours.toFixed(1)}
              </p>
              <p>
                <strong>Сприятливих годин на добу (в середньому):</strong> {hoursPerDay}
              </p>
              <p>
                <strong>Опадів за період:</strong> {totalRain.toFixed(1)} мм
              </p>
              <p>
                <strong>Рівень ризику:</strong>{" "}
                <span style={{ color: riskLevel.color }}>● {riskLevel.text}</span>
              </p>

              <div className="flex gap-6 items-center">
                <label>
                  <input
                    type="checkbox"
                    checked={showHours}
                    onChange={() => setShowHours(!showHours)}
                  />{" "}
                  Сприятливі години
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={showRain}
                    onChange={() => setShowRain(!showRain)}
                  />{" "}
                  Опади
                </label>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    {showRain && <Line type="monotone" dataKey="rain" stroke="#3366cc" dot={{ r: 3 }} name="Опади, мм" />}
                    {showHours && <Line type="monotone" dataKey="hours" stroke="#00cc66" dot={{ r: 3 }} name="Сприятливі години" />}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}