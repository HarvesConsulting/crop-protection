import React, { useState } from "react";
import "./HourTimeline.css";
import { format, parseISO } from "date-fns";

export default function HourTimeline({ date, suitableHours = [], hourlyData = [] }) {
  const [selectedHour, setSelectedHour] = useState(null);

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

  const handleSelect = (hourData, hour) => {
    if (selectedHour?.hour === hour) {
      setSelectedHour(null); // повторний тап закриває
    } else {
      setSelectedHour(hourData || { hour, notFound: true });
    }
  };

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
              onClick={() => handleSelect(hourData, hour)}
              onTouchMove={() => handleSelect(hourData, hour)} // 📱 плавний апдейт при русі
            >
              <div
                className={`hour-segment ${isSuitable ? "suitable" : "not-suitable"}`}
              >
                {hour}
              </div>

              {selectedHour && selectedHour.hour === hour && (
                <div className="hour-details-tooltip">
                  <strong>{hour}:00</strong> <br />
                  {selectedHour.notFound ? (
                    <>📭 Немає даних для цієї години</>
                  ) : (
                    <>
                      🌡 Температура: {selectedHour.temperature}°C <br />
                      💨 Вітер: {selectedHour.windspeed} км/год <br />
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
