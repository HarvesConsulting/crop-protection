import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { differenceInDays, format, addDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
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

  let riskLevel = "—";
  if (hoursPerDay <= 1.5) riskLevel = "🔵 Низький ризик захворювання";
  else if (hoursPerDay <= 2.5) riskLevel = "🟠 Середній ризик захворювання";
  else riskLevel = "🔴 Високий ризик захворювання";

  // 📊 Побудова масиву для графіка
  const chartData = Array.from({ length: numDays }, (_, i) => {
    const currentDate = addDays(new Date(startDate), i);
    const dateStr = format(currentDate, "yyyy-MM-dd");

    const dayEntries = diagnostics.filter((entry) => {
      const d = entry.date ? new Date(entry.date) : null;
      return d && format(d, "yyyy-MM-dd") === dateStr;
    });

    const condHours = dayEntries.reduce((sum, e) => {
      const h = Number(e.condHours ?? e.cond_hours ?? e.hours);
      return sum + (isNaN(h) ? 0 : h);
    }, 0);

    let risk = "Низький";
    if (condHours > 2.5) risk = "Високий";
    else if (condHours > 1.5) risk = "Середній";

    return {
      date: format(currentDate, "dd.MM"),
      hours: condHours,
      risk,
    };
  });

  // 🎨 Колір залежно від ризику
  const getColor = (risk) => {
    switch (risk) {
      case "Низький":
        return "#22c55e"; // зелений
      case "Середній":
        return "#f97316"; // помаранчевий
      case "Високий":
        return "#ef4444"; // червоний
      default:
        return "#888";
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ animation: "fadeIn 0.2s ease-out" }}
        >
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col">
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
            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="space-y-2 text-base text-gray-800">
                <p>
                  <strong>Період:</strong>{" "}
                  {format(new Date(startDate), "dd.MM.yyyy")} —{" "}
                  {format(new Date(endDate), "dd.MM.yyyy")}
                </p>
                <p>
                  <strong>Кількість днів:</strong> {numDays}
                </p>
                <p>
                  <strong>Сумарна кількість сприятливих годин:</strong>{" "}
                  {totalHours}
                </p>
                <p>
                  <strong>Сприятливих годин на добу (в середньому):</strong>{" "}
                  {hoursPerDayRounded}
                </p>
                <p>
                  <strong>Опадів за період:</strong>{" "}
                  {totalRain.toFixed(1)} мм
                </p>
                <p>
                  <strong>Рівень ризику:</strong> {riskLevel}
                </p>
              </div>

              {/* 📈 Chart */}
              <div className="pt-4">
                <h3 className="text-lg font-semibold mb-2">Динаміка ризику по днях</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis
                      label={{
                        value: "Годин",
                        angle: -90,
                        position: "insideLeft",
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      name="Сприятливі години"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{
                        stroke: "#fff",
                        strokeWidth: 1,
                        fill: (entry) => getColor(entry.payload.risk),
                      }}
                      activeDot={{ r: 6 }}
                    />
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
