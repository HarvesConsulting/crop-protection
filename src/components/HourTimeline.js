import React, { useState } from "react";
import "./HourTimeline.css";

export default function HourTimeline({ date, suitableHours = [], hourlyData = [] }) {
  const [selectedHour, setSelectedHour] = useState(null);

  // ✅ Надійне перетворення дати у формат yyyy-MM-dd
  const parsedDate = new Date(date.split(".").reverse().join("-"));
  const formattedDate = parsedDate.toISOString().slice(0, 10);

  // ✅ Фільтруємо погодинні дані лише для цієї дати
  const hoursToday = hourlyData.filter((h) => {
    if (!h?.date) return false;
    const hDate = new Date(h.date).toISOString().slice(0, 10);
    return hDate === formattedDate;
  });

  return (
    <div className="timeline-wrapper">
      <div className="timeline-bar">
        {[...Array(24).keys()].map((hour) => {
          const hourStr = hour.toString().padStart(2, "0") + ":00";
          const isSuitable = suitableHours.includes(hourStr);
          const hourData = hoursToday.find((h) => Number(h.hour) === hour);

          return (
            <div
              key={hour}
              className={`hour-segment ${isSuitable ? "suitable" : "not-suitable"}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHour(hourData || { hour, notFound: true });
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
              💨 Вітер: {selectedHour.windspeed} м/с <br />
              🌧 Опади: {selectedHour.precipitation ?? 0} мм <br />
              {/* 🔧 Тимчасовий JSON для діагностики */}
              <pre>{JSON.stringify(selectedHour, null, 2)}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
