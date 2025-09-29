import React, { useState } from "react";
import "./HourTimeline.css";
import { format, parseISO } from "date-fns";

export default function HourTimeline({ date, suitableHours = [], hourlyData = [] }) {
  const [selectedHour, setSelectedHour] = useState(null);

  // ✅ Конвертуємо дату "dd.MM.yyyy" у формат "yyyy-MM-dd"
  const formattedDate = format(
    parseISO(date.split(".").reverse().join("-")),
    "yyyy-MM-dd"
  );

  // ✅ Фільтруємо по днях (годинні дані теж конвертуємо так само)
 const hoursToday = hourlyData.filter((h) => {
  const hDate =
    h.date instanceof Date
      ? format(h.date, "yyyy-MM-dd")
      : format(parseISO(h.date), "yyyy-MM-dd");

  return hDate === formattedDate;
});


  // 🔍 Дебаг-логи
  console.log("🕐 formattedDate (з карти):", formattedDate);
  console.log("📊 hourlyData sample:", hourlyData.slice(0, 5));
  console.log(
    "📅 hoursToday:",
    hoursToday.map((h) => ({
      date: h.date,
      hour: h.hour,
      temp: h.temperature,
    }))
  );

  return (
    <div className="timeline-wrapper">
      <div className="timeline-bar">
        {[...Array(24).keys()].map((hour) => {
          // ✅ Перевірка, чи година підходить
          const isSuitable = suitableHours.includes(
            hour.toString().padStart(2, "0") + ":00"
          );

          // ✅ Знаходимо дані для цієї години
          const hourData = hoursToday.find((h) => Number(h.hour) === hour);

          return (
            <div
              key={hour}
              className={`hour-segment ${
                isSuitable ? "suitable" : "not-suitable"
              }`}
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
              {/* <pre>{JSON.stringify(selectedHour, null, 2)}</pre> */}
            </>
          )}
        </div>
      )}
    </div>
  );
}
