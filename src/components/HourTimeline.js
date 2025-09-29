import React, { useState } from "react";
import "./HourTimeline.css";
import { format } from "date-fns";

export default function HourTimeline({ date, suitableHours = [], hourlyData = [] }) {
  const [selectedHour, setSelectedHour] = useState(null);

  // ✅ Конвертуємо дату у формат yyyy-mm-dd
  const formattedDate = new Date(date.split(".").reverse().join("-"))
    .toISOString()
    .slice(0, 10);

  // ✅ Фільтруємо по днях (годинні дані конвертуємо так само)
  const hoursToday = hourlyData.filter((h) => {
    const hDate = format(new Date(h.date), "yyyy-MM-dd");
    return hDate === formattedDate;
  });

  return (
    <div className="timeline-wrapper">
      <div className="timeline-bar">
        {[...Array(24).keys()].map((hour) => {
          // ✅ Перевірка годин
          const isSuitable = suitableHours.includes(
            hour.toString().padStart(2, "0") + ":00"
          );

          // ✅ Пошук даних для цієї години
          const hourData = hoursToday.find((h) => Number(h.hour) === hour);

          return (
            <div
              key={hour}
              className={`hour-segment ${isSuitable ? "suitable" : "not-suitable"}`}
              onClick={(e) => {
                e.stopPropagation(); // 🛑 блокуємо перевертання картки
                setSelectedHour(
                  hourData || { hour, notFound: true } // якщо даних нема — маркер
                );
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
              {/* Тимчасово показуємо весь об’єкт */}
              <pre>{JSON.stringify(selectedHour, null, 2)}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
