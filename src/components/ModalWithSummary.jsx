import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ animation: "fadeIn 0.2s ease-out" }}
        >
          <div className="w-full max-w-md sm:max-w-lg bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
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
            <div className="p-5 space-y-3 text-base leading-relaxed text-gray-800 bg-white">
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
                {hoursPerDay}
              </p>
              <p>
                <strong>Опадів за період:</strong> {totalRain.toFixed(1)} мм
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
