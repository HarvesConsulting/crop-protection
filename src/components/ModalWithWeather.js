import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import WeatherPeriodView from "./WeatherPeriodView";
import { useTranslation } from "react-i18next";

export default function ModalWithWeather({
  open,
  onOpenChange,
  startDate,
  endDate,
  lat,
  lon,
  hourlyData,
}) {
  const { t } = useTranslation();

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
                ⛅ {t("weatherModal.title")}
              </h2>
              <Dialog.Close asChild>
                <button
                  className="text-gray-500 hover:text-red-500 transition"
                  aria-label={t("weatherModal.close")}
                >
                  <Cross2Icon />
                </button>
              </Dialog.Close>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-auto p-5 bg-white">
              <WeatherPeriodView
                startDate={startDate}
                endDate={endDate}
                lat={lat}
                lon={lon}
                hourlyData={hourlyData}
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}