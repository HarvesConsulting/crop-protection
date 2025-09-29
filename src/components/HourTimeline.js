import React, { useState, useEffect, useRef } from "react";
import "./HourTimeline.css";
import { format, parseISO } from "date-fns";

export default function HourTimeline({ date, suitableHours = [], hourlyData = [] }) {
  const [selectedHour, setSelectedHour] = useState(null);
  const wrapperRef = useRef(null);

  // Конвертація дати "dd.MM.yyyy" → "yyyy-MM-dd"
  const formattedDate = format(
    parseISO(date.split(".").reverse().join("-")),
    "yyyy-MM-dd"
  );

  // Фільтруємо погодинні дані по цій даті
  const hoursToday = hourlyData.filter((h) => {
    const hDate =
      h.date instanceof Date
        ? format(h.date, "yyyy-MM-dd")
        : format(parseISO(h.date), "yyyy-MM-dd");

    return hDate === formattedDate;
  });

  // Закриття вікна при кліку поза компонентом
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSelectedHour(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="timeline-wrapper" ref={wrapperRef}>
      <div className="timeline-bar">
        {[...Array(24).keys()].map((hour) => {
          const isSuitable = suitableHours.includes(
            hour.toString().padStart(2, "0") + ":00"
          );
          const hourData = hoursToday.find((h) => Number(h.hour) === hour);

          return (
            <div
              key={hour}
              className={`hour-segment ${isSuitable ? "suitable" : "not-suitable"}`}
              onClick={(e) => {
                e.stopPropagation();
                // Повторне натискання — закрити
                if (selectedHour?.hour === hour) {
                  setSelectedHour(null);
                } else {
                  setSelectedHour(hourData || { hour, notFound: true });
                }
              }}
              title={`Натисніть для деталей (${hour}:00)`}
            >
              {hour}
            </div>
          );
        })}
      </div>

      {selectedHour && (
        <div className="hour-details">
          <strong>{selectedHour.hour}:00</strong>
          <br />
          {selectedHour.notFound ? (
            <span>📭 Немає даних для цієї години</span>
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
}
