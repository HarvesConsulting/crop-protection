import React, { useState } from "react";
import "./HourTimeline.css";
import { format, parseISO } from "date-fns";

export default function HourTimeline({ date, suitableHours = [], hourlyData = [] }) {
  const [hoveredHour, setHoveredHour] = useState(null);

  // ✅ Конвертація дати у формат "yyyy-MM-dd"
  const formattedDate = format(
    parseISO(date.split(".").reverse().join("-")),
    "yyyy-MM-dd"
  );

  // ✅ Фільтрація даних за конкретний день
  const hoursToday = hourlyData.filter((h) => {
    const hDate =
      h.date instanceof Date
        ? format(h.date, "yyyy-MM-dd")
        : format(parseISO(h.date), "yyyy-MM-dd");
    return hDate === formattedDate;
  });

  return (
    <div className="timeline-wrapper">
      <div className="timeline-bar">
        {[...Array(24).keys()].map((hour) => {
          const isSuitable = suitableHours.includes(
            hour.toString().padStart(2, "0") + ":00"
          );

          const hourData = hoursToday.find((h) => Number(h.hour) === hour);

          return (
            <div
              key={hour}
              className="hour-segment-wrapper"
              onMouseEnter={() => setHoveredHour(hourData || null)}
              onMouseLeave={() => setHoveredHour(null)}
              onTouchStart={() => setHoveredHour(hourData || null)}
              onTouchEnd={() => setHoveredHour(null)}
            >
              <div className={`hour-segment ${isSuitable ? "suitable" : "not-suitable"}`}>
                {hour}
              </div>

              {hoveredHour && hoveredHour.hour === hour && (
                <div className="hour-details-tooltip">
                  <strong>{hour}:00</strong> <br />
                  🌡 Температура: {hoveredHour.temperature}°C <br />
                  💨 Вітер: {hoveredHour.windspeed} км/год <br />
                  🌧 Опади: {hoveredHour.precipitation ?? 0} мм
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
