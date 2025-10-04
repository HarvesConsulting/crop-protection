import React, { useState } from "react";
import "./HourTimeline.css";
import { format, parseISO } from "date-fns";

export default function HourTimeline({ date, suitableHours = [], hourlyData = [] }) {
  const [activeHour, setActiveHour] = useState(null);

  // Форматуємо дату, щоб зіставляти з hourlyData
  const formattedDate = format(
    parseISO(date.split(".").reverse().join("-")),
    "yyyy-MM-dd"
  );
  console.log("🟡 hourlyData:", hourlyData);
  console.log("📅 formattedDate:", formattedDate);

  // Вибираємо лише дані для потрібного дня
  const hoursToday = hourlyData.filter((h) => {
    const hDate =
      h.date instanceof Date
        ? format(h.date, "yyyy-MM-dd")
        : format(parseISO(h.date), "yyyy-MM-dd");

    return hDate === formattedDate;
  });

  const closeTooltip = () => setActiveHour(null);

  return (
    <div className="timeline-wrapper">
      <div className="timeline-scroll">
        <div className="timeline-bar" onTouchEnd={closeTooltip}>
          {[...Array(24).keys()].map((hour) => {
            // Шукаємо дані для конкретної години
            const hourData = hoursToday.find((h) => Number(h.hour) === hour);
            const isActive = activeHour === hour;

            // 🟢 Виправлено: формуємо строку для порівняння
            const hourStr = hour.toString().padStart(2, "0") + ":00";

            // 🟢 Виправлено: перевірка вологості
            const isHumidityTooHigh = hourData?.humidity >= 90;

            // 🟢 Виправлено: визначаємо чи підходить година
            const isSuitable = suitableHours.includes(hourStr) && !isHumidityTooHigh;

            return (
              <div
                key={hour}
                className="hour-segment-wrapper"
                onMouseEnter={() => setActiveHour(hour)}
                onMouseLeave={closeTooltip}
                onTouchStart={() => setActiveHour(hour)}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  const element = document.elementFromPoint(
                    touch.clientX,
                    touch.clientY
                  );
                  if (element && element.dataset.hour) {
                    setActiveHour(Number(element.dataset.hour));
                  }
                }}
              >
                <div
                  className={`hour-segment ${
                    isSuitable ? "suitable" : "not-suitable"
                  }`}
                  data-hour={hour}
                >
                  {hour}
                </div>

                {/* Тултіп з даними */}
                {hourData && isActive && (
                  <div className="hour-details-tooltip mobile">
                    <strong>{hour}:00</strong> <br />
                    🌡 Температура: {hourData.temperature}°C <br />
                    💧 Вологість: {hourData.humidity ?? "—"}% <br />
                    💨 Вітер: {hourData.windspeed} км/год <br />
                    🌧 Опади: {hourData.precipitation ?? 0} мм <br />
                    {!isSuitable && (
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        ❌ Не рекомендовано
                        {isHumidityTooHigh && " (надто висока вологість)"}
                      </span>
                    )}
                    {isSuitable && (
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        ✅ Рекомендовано
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
