import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useState, useMemo } from "react";
import { differenceInDays, format, parseISO } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

  const riskLevel = hoursPerDay <= 1.5
    ? { label: "Низький ризик захворювання", color: "green" }
    : hoursPerDay <= 2.5
    ? { label: "Середній ризик захворювання", color: "orange" }
    : { label: "Високий ризик захворювання", color: "red" };

  const chartData = useMemo(() => {
    return diagnostics.map((entry, idx) => {
      const date = entry.date || entry.dt || (rainDaily[idx]?.date ?? "");
      const rainVal = Number(rainDaily[idx]?.rain ?? rainDaily[idx]?.precip ?? rainDaily[idx]?.opad);
      const rain = isNaN(rainVal) || rainVal < 0 || rainVal > 500 ? 0 : rainVal;
      const hours = Number(entry.condHours ?? entry.cond_hours ?? entry.hours);
      return {
        date: format(parseISO(date), "dd.MM"),
        hours: isNaN(hours) ? 0 : hours,
        rain,
      };
    });
  }, [diagnostics, rainDaily]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl h-[85vh] bg-white rounded-xl shadow-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-100">
              <h2 className="text-lg font-semibold">📊 Агрономічний підсумок</h2>
              <Dialog.Close asChild>
                <button className="text-gray-500 hover:text-red-500" aria-label="Закрити">
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <p><strong>Кількість днів:</strong> {numDays}</p>
              <p><strong>Сумарна кількість сприятливих годин:</strong> {totalHours.toFixed(1)}</p>
              <p><strong>Сприятливих годин на добу (в середньому):</strong> {hoursPerDay.toFixed(1)}</p>
              <p><strong>Опадів за період:</strong> {totalRain.toFixed(1)} мм</p>
              <p>
                <strong>Рівень ризику:</strong>{" "}
                <span style={{ color: riskLevel.color }}>● {riskLevel.label}</span>
              </p>

              <div>
                <h3 className="font-semibold mb-2">Динаміка ризику по днях</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} unit="" />
                    <Tooltip formatter={(value) => [value, "Годин"]} />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke={riskLevel.color}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Сприятливі години"
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
