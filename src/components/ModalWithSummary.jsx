import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { differenceInDays, format } from "date-fns";
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

  const hoursPerDay = Number(totalHours / numDays).toFixed(1);

  let riskLevel = "";
  let riskColor = "";
  const hpd = parseFloat(hoursPerDay);

  if (hpd <= 1.5) {
    riskLevel = "Низький ризик захворювання";
    riskColor = "green";
  } else if (hpd <= 2.5) {
    riskLevel = "Середній ризик захворювання";
    riskColor = "orange";
  } else {
    riskLevel = "Високий ризик захворювання";
    riskColor = "red";
  }

  const chartData = diagnostics.map((entry) => {
    const formattedEntryDate = format(new Date(entry.date), "yyyy-MM-dd");

    const rainEntry = rainDaily.find((r) =>
      format(new Date(r.date), "yyyy-MM-dd") === formattedEntryDate
    );

    return {
      date: format(new Date(entry.date), "dd.MM"),
      hours: Number(entry.condHours ?? entry.cond_hours ?? entry.hours) || 0,
      rain: Number(rainEntry?.rain ?? rainEntry?.precip ?? rainEntry?.opad) || 0,
    };
  });

  const [showHours, setShowHours] = useState(true);
  const [showRain, setShowRain] = useState(true);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="w-full max-w-4xl bg-white rounded-xl shadow-xl flex flex-col p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">📊 Агрономічний підсумок</h2>
              <Dialog.Close asChild>
                <button
                  className="text-gray-500 hover:text-red-500 transition"
                  aria-label="Закрити"
                >
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-2 text-base leading-relaxed">
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
                <strong>Рівень ризику:</strong> <span style={{ color: riskColor }}>● {riskLevel}</span>
              </p>
            </div>

            <div className="mt-4 space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={showHours}
                  onChange={() => setShowHours((prev) => !prev)}
                  className="mr-2"
                />
                Сприятливі години
              </label>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={showRain}
                  onChange={() => setShowRain((prev) => !prev)}
                  className="mr-2"
                />
                Опади
              </label>
            </div>

            <div className="mt-4 h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" label={{ value: "Годин", angle: -90, position: "insideLeft" }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: "мм", angle: -90, position: "insideRight" }} />
                  <Tooltip />
                  <Legend />
                  {showHours && (
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="hours"
                      stroke="#22c55e"
                      name="Сприятливі години"
                      dot={{ r: 3 }}
                    />
                  )}
                  {showRain && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="rain"
                      stroke="#3b82f6"
                      name="Опади, мм"
                      dot={{ r: 2 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
