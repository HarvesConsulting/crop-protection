import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
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
import { useState } from "react";

export default function ModalWithSummary({
  open,
  onOpenChange,
  startDate,
  endDate,
  diagnostics = [],
  rainDaily = [],
}) {
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

  let riskLevel = "";
  let riskColor = "";
  if (hoursPerDay <= 1.5) {
    riskLevel = "Низький ризик захворювання";
    riskColor = "text-green-600";
  } else if (hoursPerDay <= 2.5) {
    riskLevel = "Середній ризик захворювання";
    riskColor = "text-yellow-600";
  } else {
    riskLevel = "Високий ризик захворювання";
    riskColor = "text-red-600";
  }

  const chartData = diagnostics.map((entry) => ({
    date: format(new Date(entry.date), "dd.MM"),
    hours:
      Number(entry.condHours ?? entry.cond_hours ?? entry.hours) || 0,
    rain:
      Number(
        rainDaily.find((r) => r.date === entry.date)?.rain ??
          rainDaily.find((r) => r.date === entry.date)?.precip ??
          rainDaily.find((r) => r.date === entry.date)?.opad
      ) || 0,
  }));

  const [showHours, setShowHours] = useState(true);
  const [showRain, setShowRain] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-300 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-3 border-b bg-gray-100">
              <h2 className="text-lg font-bold">📊 Агрономічний підсумок</h2>
              <Dialog.Close asChild>
                <button className="text-gray-500 hover:text-red-500 transition">
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3 text-base text-gray-800">
              <p>
                <strong>Період:</strong> {format(new Date(startDate), "dd.MM.yyyy")} –{" "}
                {format(new Date(endDate), "dd.MM.yyyy")}
              </p>
              <p>
                <strong>Кількість днів:</strong> {numDays}
              </p>
              <p>
                <strong>Сумарна кількість сприятливих годин:</strong>{" "}
                {totalHours.toFixed(1)}
              </p>
              <p>
                <strong>Сприятливих годин на добу (в середньому):</strong>{" "}
                {hoursPerDay.toFixed(1)}
              </p>
              <p>
                <strong>Опадів за період:</strong> {totalRain.toFixed(1)} мм
              </p>
              <p>
                <strong>Рівень ризику:</strong>{" "}
                <span className={`inline-block ml-1 font-semibold ${riskColor}`}>
                  ● {riskLevel}
                </span>
              </p>

              {/* Перемикачі */}
              <div className="flex gap-4 items-center mt-4">
                <label>
                  <input
                    type="checkbox"
                    checked={showHours}
                    onChange={() => setShowHours(!showHours)}
                    className="mr-2"
                  />
                  Сприятливі години
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={showRain}
                    onChange={() => setShowRain(!showRain)}
                    className="mr-2"
                  />
                  Опади
                </label>
              </div>

              {/* Графік */}
              <div className="h-64 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {showHours && (
                      <Line
                        type="monotone"
                        dataKey="hours"
                        name="Сприятливі години"
                        stroke="#22c55e"
                        strokeWidth={2}
                      />
                    )}
                    {showRain && (
                      <Line
                        type="monotone"
                        dataKey="rain"
                        name="Опади, мм"
                        stroke="#3b82f6"
                        strokeWidth={2}
                      />
                    )}
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
