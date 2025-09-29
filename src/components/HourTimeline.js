import React from "react";
import "./HourTimeline.css";
import { format, parseISO } from "date-fns";

export default function HourTimeline({ date, suitableHours = [], hourlyData = [] }) {
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

          // ✅ Знаходимо погодинні дані для цієї години
          const hourData = hoursToday.find((h) => Number(h.hour) === hour);

          return (
            <div key={hour} className="hour-segment-wrapper">
              <div className={`hour-segment ${isSuitable ? "suitable" : "not-suitable"}`}>
                {hour}
              </div>

              {hourData && (
                <div className="hour-details-tooltip">
                  <strong>{hour}:00</strong><br />
                  🌡 Температура: {hourData.temperature}°C <br />
                  💨 Швидкість вітру: {hourData.windspeed} м/с <br />
                  🌧 Кількість опадів: {hourData.precipitation ?? 0} мм
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
