import React, { useState } from "react";
import "./HourTimeline.css";
import { format, parseISO } from "date-fns";

export default function HourTimeline({ date, suitableHours = [], hourlyData = [] }) {
  const [selectedHour, setSelectedHour] = useState(null);

  // ✅ Перетворюємо дату у формат "yyyy-MM-dd"
  const formattedDate = format(
    parseISO(date.split(".").reverse().join("-")),
    "yyyy-MM-dd"
  );

  // ✅ Відбираємо погодинні дані тільки для цього дня
  const hoursToday = hourlyData.filter((h) => {
    const hDate =
      h.date instanceof Date
        ? format(h.date, "yyyy-MM-dd")
        : format(parseISO(h.date), "yyyy-MM-dd");
    return hDate === formattedDate;
  });

  const handleClick = (hourData, hour) => {
    if (selectedHour?.hour === hour) {
      setSelectedHour(null); // другий тап закриває
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
              onClick={() => handleClick(hourData, hour)} // 📱 мобільний тап
            >
              <div
                className={`hour-segment ${isSuitable ? "suitable" : "not-suitable"}`}
              >
                {hour}
              </div>

              {/* 🖱️ ПК: показуємо tooltip при hover */}
              {hourData && (
                <div className="hour-details-tooltip">
                  <strong>{hour}:00</strong> <br />
                  🌡 Температура: {hourData.temperature}°C <br />
                  💨 Вітер: {hourData.windspeed} км/год <br />
                  🌧 Опади: {hourData.precipitation ?? 0} мм
                </div>
              )}

              {/* 📱 мобільний: тільки при кліку */}
              {selectedHour && selectedHour.hour === hour && (
                <div className="hour-details-tooltip mobile">
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
