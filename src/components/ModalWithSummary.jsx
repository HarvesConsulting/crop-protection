import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { format, differenceInDays, parse } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Label,
} from "recharts";
import { useState, useMemo } from "react";

export default function ModalWithSummary({
  open,
  onOpenChange,
  startDate,
  endDate,
  diagnostics = [],
  sprayData = [],
}) {
  const [showHours, setShowHours] = useState(true);
  const [showTreatments, setShowTreatments] = useState(true);

  const numDays = differenceInDays(new Date(endDate), new Date(startDate)) + 1;

  const totalHours = diagnostics.reduce((sum, entry) => {
    const h = Number(entry.condHours ?? entry.cond_hours ?? entry.hours);
    return sum + (isNaN(h) ? 0 : h);
  }, 0);

  const hoursPerDay = totalHours / numDays;

  let riskLevel = "Низький ризик захворювання";
  let riskColor = "text-green-700 bg-green-100";
  let riskDot = "🟢";
  let lineColor = "#22c55e";

  if (hoursPerDay > 2.5) {
    riskLevel = "Високий ризик захворювання";
    riskColor = "text-red-700 bg-red-100";
    riskDot = "🔴";
    lineColor = "#ef4444";
  } else if (hoursPerDay > 1.5) {
    riskLevel = "Середній ризик захворювання";
    riskColor = "text-yellow-700 bg-yellow-100";
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

  const sprayLines = useMemo(() => {
    return (sprayData || []).map((entry, index) => {
      const parsedDate = parse(entry.Дата, "dd.MM.yyyy", new Date());
      const formatted = format(parsedDate, "dd.MM");
      return {
        date: formatted,
        label: entry.Препарат,
        number: index + 1,
      };
    });
  }, [sprayData]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-100">
              <h2 className="text-xl font-bold text-gray-800">📊 Агрономічний підсумок</h2>
              <Dialog.Close asChild>
                <button className="text-gray-500 hover:text-red-500 transition" aria-label="Закрити">
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-5 bg-gray-50 space-y-5 text-base">
              {/* Метрики */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><strong>Кількість днів:</strong> {numDays}</div>
                <div><strong>Сприятливих годин на добу:</strong> {hoursPerDay.toFixed(1)}</div>
              </div>

              <div>
                <strong>Рівень ризику:</strong>{" "}
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${riskColor}`}>
                  {riskDot} {riskLevel}
                </span>
              </div>

              {/* Перемикачі */}
              <div className="space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-green-600"
                    checked={showHours}
                    onChange={() => setShowHours(!showHours)}
                  />
                  <span className="ml-2">Сприятливі години</span>
                </label>

                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                    checked={showTreatments}
                    onChange={() => setShowTreatments(!showTreatments)}
                  />
                  <span className="ml-2">Обробки</span>
                </label>
              </div>

              {/* Графік */}
              <div className="h-96 w-full bg-white rounded-md p-4 shadow-sm border">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: "Години", angle: -90, position: "insideLeft" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#f9fafb", borderColor: "#d1d5db", color: "#000" }}
                      labelStyle={{ color: "#000", fontWeight: "bold" }}
                      itemStyle={{ color: "#000" }}
                    />
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

                    {showTreatments &&
                      sprayLines.map((spray, index) => (
                        <ReferenceLine
                          key={index}
                          x={spray.date}
                          stroke="#3b82f6"
                          strokeDasharray="3 3"
                        >
                          <Label
                            value={`#${spray.number}`}
                            position="top"
                            fill="#3b82f6"
                            fontSize={12}
                          />
                        </ReferenceLine>
                      ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Легенда до обробок */}
              {showTreatments && sprayLines.length > 0 && (
                <div className="text-sm text-gray-700 border-t pt-3">
                  <strong>Обробки:</strong>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {sprayLines.map((s, i) => (
                      <li key={i}>
                        <strong>#{s.number}</strong> — {s.date}, {s.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
