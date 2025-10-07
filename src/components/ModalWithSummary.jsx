import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { format, differenceInDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState, useMemo } from "react";

export default function ModalWithSummary({
  open,
  onOpenChange,
  startDate,
  endDate,
  diagnostics = [],
  rainDaily = [],
}) {
  const [showHours, setShowHours] = useState(true);

  const numDays = differenceInDays(new Date(endDate), new Date(startDate)) + 1;

  const totalHours = diagnostics.reduce((sum, entry) => {
    const h = Number(entry.condHours ?? entry.cond_hours ?? entry.hours);
    return sum + (isNaN(h) ? 0 : h);
  }, 0);

  const totalRain = rainDaily.reduce((sum, entry) => {
    const v = Number(entry.rain ?? entry.precip ?? entry.opad);
    return sum + (isNaN(v) || v < 0 || v > 500 ? 0 : v);
  }, 0);

  const hoursPerDay = totalHours / numDays;

  let riskLevel = "Низький ризик захворювання";
  let riskColor = "text-green-600";
  let riskDot = "🟢";
  let lineColor = "#16a34a"; // зелений

  if (hoursPerDay > 2.5) {
    riskLevel = "Високий ризик захворювання";
    riskColor = "text-red-600";
    riskDot = "🔴";
    lineColor = "#dc2626";
  } else if (hoursPerDay > 1.5) {
    riskLevel = "Середній ризик захворювання";
    riskColor = "text-yellow-500";
    riskDot = "🟡";
    lineColor = "#facc15";
  }

  const chartData = useMemo(() => {
    return diagnostics.map((entry) => {
      const date = format(new Date(entry.date), "dd.MM");
      const h = Number(entry.condHours ?? entry.cond_hours ?? entry.hours);
      return {
        date,
        hours: isNaN(h) ? 0 : h,
      };
    });
  }, [diagnostics]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ animation: "fadeIn 0.2s ease-out" }}
        >
          <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                📊 Агрономічний підсумок
              </h2>
              <Dialog.Close asChild>
                <button
                  className="text-gray-500 hover:text-red-500 transition"
                  aria-label="Закрити"
                >
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-5 bg-white space-y-4 text-base leading-relaxed">
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
                <span className={riskColor}>
                  {riskDot} {riskLevel}
                </span>
              </p>

              {/* Перемикач */}
              <div className="space-x-4">
                <label>
                  <input
                    type="checkbox"
                    className="mr-1"
                    checked={showHours}
                    onChange={() => setShowHours(!showHours)}
                  />
                  Сприятливі години
                </label>
              </div>

              {/* Графік */}
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {showHours && (
                      <Line
                        type="monotone"
                        dataKey="hours"
                        stroke={lineColor}
                        name="Сприятливі години"
                        strokeWidth={2}
                        dot={{ r: 3 }}
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
