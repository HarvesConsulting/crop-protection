import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { differenceInDays, format } from "date-fns";

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

  const hoursPerDay = (totalHours / numDays).toFixed(1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>📊 Агрономічний підсумок</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-base leading-relaxed">
          <p>
            <strong>Період:</strong>{" "}
            {format(new Date(startDate), "dd.MM.yyyy")} —{" "}
            {format(new Date(endDate), "dd.MM.yyyy")}
          </p>
          <p>
            <strong>Кількість днів:</strong> {numDays}
          </p>
          <p>
            <strong>Сумарна кількість сприятливих годин:</strong> {totalHours}
          </p>
          <p>
            <strong>Сприятливих годин на добу (в середньому):</strong>{" "}
            {hoursPerDay}
          </p>
          <p>
            <strong>Опадів за період:</strong> {totalRain.toFixed(1)} мм
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
