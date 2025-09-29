import React, { useState } from "react";
import "./HourTimeline.css";
import { format, parseISO } from "date-fns";

export default function HourTimeline({ date, suitableHours = [], hourlyData = [] }) {
  const [selectedHour, setSelectedHour] = useState(null);

  const formattedDate = format(
    parseISO(date.split(".").reverse().join("-")),
    "yyyy-MM-dd"
  );

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
              onClick={(e) => {
                e.stopPropagation(); // блокуємо перевертання
                setSelectedHour(hourData || { hour, notFound: true });
              }}
              onMouseLeave={() => setSelectedHour(null)} // 🧼 прибираємо підказку
            >
              <div className={`hour-segment ${isSuitable ? "suitable" : "not-suitable"}`}>
                {hour}
              </div>

              {/* Підказка (при кліку, зникає при виході миші) */}
              {selectedHour?.hour === hour && (
                <div className="hour-details-tooltip">
                  <strong>{hour}:00</strong><br />
                  {selectedHour.notFound ? (
                    <span>📭 Немає даних для цієї години</span>
                  ) : (
                    <>
                      🌡 Температура: {selectedHour.temperature}°C <br />
                      💨 Швидкість вітру: {selectedHour.windspeed} м/с <br />
                      🌧 Опади: {selectedHour.precipitation ?? 0} мм
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
