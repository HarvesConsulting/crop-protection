import React, { useState } from "react";
import "./HourTimeline.css";
import { format, parseISO } from "date-fns";

export default function HourTimeline({ date, suitableHours = [], hourlyData = [] }) {
  const [activeHour, setActiveHour] = useState(null);

  // Конвертація дати "dd.MM.yyyy" у формат "yyyy-MM-dd"
  const formattedDate = format(
    parseISO(date.split(".").reverse().join("-")),
    "yyyy-MM-dd"
  );

  // Фільтрація погодинних даних по поточному дню
  const hoursToday = hourlyData.filter((h) => {
    const hDate =
      h.date instanceof Date
        ? format(h.date, "yyyy-MM-dd")
        : format(parseISO(h.date), "yyyy-MM-dd");

    return hDate === formattedDate;
  });

  // Закриваємо тултіп
  const closeTooltip = () => setActiveHour(null);

  return (
    <div className="timeline-wrapper">
      <div
        className="timeline-bar"
        onTouchEnd={closeTooltip} // закриваємо при відриві пальця
      >
        {[...Array(24).keys()].map((hour) => {
          const isSuitable = suitableHours.includes(
            hour.toString().padStart(2, "0") + ":00"
          );

          const hourData = hoursToday.find((h) => Number(h.hour) === hour);

          const isActive = activeHour === hour;

          return (
            <div
              key={hour}
              className="hour-segment-wrapper"
              onMouseEnter={() => setActiveHour(hour)} // 🖱️ для ПК
              onMouseLeave={closeTooltip}
              onTouchStart={() => setActiveHour(hour)} // 📱 для мобільних
              onTouchMove={(e) => {
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                if (element && element.dataset.hour) {
                  setActiveHour(Number(element.dataset.hour));
                }
              }}
            >
              <div
                className={`hour-segment ${isSuitable ? "suitable" : "not-suitable"}`}
                data-hour={hour}
              >
                {hour}
              </div>

              {hourData && isActive && (
                <div className="hour-details-tooltip mobile">
                  <strong>{hour}:00</strong> <br />
                  🌡 Температура: {hourData.temperature}°C <br />
                  💨 Вітер: {hourData.windspeed} км/год <br />
                  🌧 Опади: {hourData.precipitation ?? 0} мм
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
