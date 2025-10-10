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
  ReferenceLine,
  Label,
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
  const [hoveredLabel, setHoveredLabel] = useState(null);

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
    return integratedTreatments.map((entry, i) => {
      const parsedDate = parse(entry.Дата, "dd.MM.yyyy", new Date());
      const formatted = format(parsedDate, "dd.MM");
      const tooltip = `${formatted}: ${entry.Препарат}`;
      return {
        date: formatted,
        label: `#${i + 1}`,
        tooltip,
      };
    });
  }, [integratedTreatments]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-auto">
          <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-xl flex flex-col border border-gray-200">
            
            {/* Кнопка закриття */}
            <Dialog.Close asChild>
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition"
                aria-label="Закрити"
              >
                <Cross2Icon width={20} height={20} />
              </button>
            </Dialog.Close>

            <div className="flex-1 overflow-auto p-5 bg-gray-50 space-y-5 text-base">
              <div>
                <strong>Рівень ризику захворювання:</strong>{" "}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${riskColor}`}
                >
                  {riskDot} {riskLevel}
                </span>
              </div>

              <div className="h-96 w-full bg-white rounded-md p-4 shadow-sm border relative">
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
                          value: "Дати внесення фунгіцидів",
                          type: "line",
                          color: "#3b82f6",
                          id: "fungicide-dates",
                          strokeDasharray: "4 4",
                        },
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke={lineColor}
                      name="Сприятливі години"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />

                    {sprayLines.map((spray, index) => (
                      <ReferenceLine
                        key={index}
                        x={spray.date}
                        stroke="#3b82f6"
                        strokeDasharray="4 4"
                      >
                        <Label
                          value={spray.label}
                          position="top"
                          fill="#3b82f6"
                          fontSize={10}
                          style={{ cursor: "pointer" }}
                          onMouseEnter={() => setHoveredLabel(index)}
                          onMouseLeave={() => setHoveredLabel(null)}
                          onTouchStart={() => setHoveredLabel(index)}
                          onTouchEnd={() => setHoveredLabel(null)}
                        />
                      </ReferenceLine>
                    ))}
                  </LineChart>
                </ResponsiveContainer>

                {hoveredLabel !== null && (
                  <div
                    className="absolute z-50 px-3 py-2 bg-white border border-gray-300 rounded shadow text-sm text-gray-700"
                    style={{
                      top: 0,
                      left: `calc(${(hoveredLabel + 1) * 6}% - 60px)`,
                    }}
                  >
                    {sprayLines[hoveredLabel]?.tooltip}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
