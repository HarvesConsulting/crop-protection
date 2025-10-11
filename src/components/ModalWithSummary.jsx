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
  ResponsiveContainer,
  ReferenceArea,
  Legend,
} from "recharts";
import { useState, useMemo } from "react";

export default function ModalWithSummary({
  open,
  onOpenChange,
  startDate,
  endDate,
  diagnostics = [],
  integratedTreatments = [],
}) {
  const [tooltipData, setTooltipData] = useState(null);

  const numDays =
    differenceInDays(new Date(endDate), new Date(startDate)) + 1;

  const totalHours = diagnostics.reduce((sum, entry) => {
    const h = Number(entry.condHours ?? entry.cond_hours ?? entry.hours);
    return sum + (isNaN(h) ? 0 : h);
  }, 0);

  const hoursPerDay = totalHours / numDays;

  let riskLevel = "Низький";
  let riskColor = "text-green-700 bg-green-100";
  let riskDot = "🟢";
  let lineColor = "#22c55e";

  if (hoursPerDay > 2.5) {
    riskLevel = "Високий";
    riskColor = "text-red-700 bg-red-100";
    riskDot = "🔴";
    lineColor = "#ef4444";
  } else if (hoursPerDay > 1.5) {
    riskLevel = "Середній";
    riskColor = "text-yellow-700 bg-yellow-100";
    riskDot = "🟡";
    lineColor = "#facc15";
  }

  // Графік: основні погодинні дані
  const chartData = useMemo(() => {
    return diagnostics.map((entry) => ({
      date: format(new Date(entry.date), "dd.MM"),
      hours: Number(entry.condHours) || 0,
    }));
  }, [diagnostics]);

  // Масив зон обприскування
  const sprayAreas = useMemo(() => {
    return integratedTreatments.map((entry, i) => {
      const start = parse(entry.Дата, "dd.MM.yyyy", new Date());
      const end = new Date(start);
      end.setDate(start.getDate() + 1); // наступна доба

      const x1 = format(start, "dd.MM");
      const x2 = format(end, "dd.MM");
      const tooltip = `${x1}: ${entry.Препарат}`;
      return {
        x1,
        x2,
        tooltip,
      };
    });
  }, [integratedTreatments]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ animation: "fadeIn 0.2s ease-out" }}
        >
          <div className="w-full max-w-5xl h-[85vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                🌾 Графік обприскування
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
            <div className="flex-1 overflow-auto p-5 bg-white space-y-5 text-base">
              <div>
                <strong>Рівень ризику захворювання:</strong>{" "}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${riskColor}`}
                >
                  {riskDot} {riskLevel}
                </span>
              </div>

              <div className="h-96 w-full bg-white rounded-md p-4 shadow-sm border relative min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 50, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#f9fafb",
                        borderColor: "#d1d5db",
                        color: "#000",
                      }}
                      labelStyle={{ color: "#000", fontWeight: "bold" }}
                      itemStyle={{ color: "#000" }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      align="center"
                      height={36}
                      payload={[
                        {
                          value: "Сприятливі години",
                          type: "line",
                          id: "hours",
                          color: lineColor,
                        },
                        {
                          value: "Дні обробки",
                          type: "rect",
                          id: "treatment-zones",
                          color: "#3b82f6",
                        },
                      ]}
                    />

                    {/* Зони обприскування */}
                    {sprayAreas.map((area, index) => (
                      <ReferenceArea
                        key={index}
                        x1={area.x1}
                        x2={area.x2}
                        stroke="transparent"
                        fill="#3b82f6"
                        fillOpacity={0.15}
                        ifOverflow="visible"
                      />
                    ))}

                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke={lineColor}
                      name="Сприятливі години"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* Якщо потім захочеш – можна повернути tooltipData сюди */}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
