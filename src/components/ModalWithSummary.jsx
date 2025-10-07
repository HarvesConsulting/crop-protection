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
  ReferenceLine,
  Label,
  ResponsiveContainer,
} from "recharts";
import { useState, useMemo } from "react";

const CustomLabelWithTooltip = ({ label, text }) => {
  const [show, setShow] = useState(false);

  return (
    <foreignObject x={-10} y={-25} width={50} height={30}>
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onTouchStart={() => setShow(!show)}
        style={{
          textAlign: "center",
          fontSize: "10px",
          fontWeight: "bold",
          color: "#3b82f6",
          cursor: "pointer",
          position: "relative",
        }}
      >
        {label}
        {show && (
          <div
            style={{
              position: "absolute",
              top: "-50px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#fff",
              border: "1px solid #ccc",
              padding: "6px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              zIndex: 100,
              whiteSpace: "nowrap",
            }}
          >
            {text}
          </div>
        )}
      </div>
    </foreignObject>
  );
};

export default function ModalWithSummary({
  open,
  onOpenChange,
  startDate,
  endDate,
  diagnostics = [],
  sprayData = [],
  diseaseCardsGrouped = [],
}) {
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

  const allSprays = useMemo(() => {
    const phytophthora = (sprayData || []).map((entry, index) => ({
      ...entry,
      disease: "Фітофтороз",
      number: index + 1,
    }));

    const others = (diseaseCardsGrouped || []).flatMap((group) =>
      group.entries.map((entry, i) => ({
        ...entry,
        disease: group.name,
        number: phytophthora.length + i + 1,
      }))
    );

    return [...phytophthora, ...others];
  }, [sprayData, diseaseCardsGrouped]);

  const sprayLines = useMemo(() => {
    return allSprays.map((entry, i) => {
      const parsedDate = parse(entry.Дата, "dd.MM.yyyy", new Date());
      const formatted = format(parsedDate, "dd.MM");
      return {
        date: formatted,
        number: i + 1,
        label: `#${i + 1}`,
        tooltip: `${entry.Препарат} (${entry.disease})`,
      };
    });
  }, [allSprays]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-100">
              <h2 className="text-xl font-bold text-gray-800">📊 Агрономічний підсумок</h2>
              <Dialog.Close asChild>
                <button className="text-gray-500 hover:text-red-500 transition" aria-label="Закрити">
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </div>

            <div className="flex-1 overflow-auto p-5 bg-gray-50 space-y-5 text-base">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><strong>Кількість днів:</strong> {numDays}</div>
              </div>
              <div>
                <strong>Рівень ризику:</strong>{" "}
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${riskColor}`}>
                  {riskDot} {riskLevel}
                </span>
              </div>

              <div className="h-96 w-full bg-white rounded-md p-4 shadow-sm border relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: "Години", angle: -90, position: "insideLeft" }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#f9fafb", borderColor: "#d1d5db", color: "#000" }}
                      labelStyle={{ color: "#000", fontWeight: "bold" }}
                      itemStyle={{ color: "#000" }}
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
                        strokeWidth={2}
                      >
                        <Label
                          position="top"
                          content={<CustomLabelWithTooltip label={spray.label} text={spray.tooltip} />}
                        />
                      </ReferenceLine>
                    ))}
                  </LineChart>
                </ResponsiveContainer>

                {/* Кастомна легенда по центру */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm flex items-center gap-6">
                  <span className="inline-flex items-center gap-1 text-gray-600">
                    <span className="w-4 h-1 rounded-full bg-current" style={{ color: lineColor }}></span>
                    Сприятливі години
                  </span>
                  <span className="inline-flex items-center gap-1 text-gray-600">
                    <span className="w-2 h-2 bg-blue-600 rounded-sm"></span>
                    Дати внесення фунгіцидів
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}