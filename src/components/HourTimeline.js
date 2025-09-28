import React, { useState } from "react";
import "./HourTimeline.css";

export default function HourTimeline({ date, suitableHours = [], hourlyData = [] }) {
  const [selectedHour, setSelectedHour] = useState(null);

  const formattedDate = date.split(".").reverse().join("-");

  const hoursToday = hourlyData.filter((h) =>
    h.date?.startsWith(formattedDate)
  );

  return (
    <div className="timeline-wrapper">
      <div className="timeline-bar">
        {[...Array(24).keys()].map((hour) => {
          const isSuitable = suitableHours.includes(hour.toString().padStart(2, "0") + ":00");
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
          <strong>{selectedHour.hour}:00</strong><br />
          {selectedHour.notFound ? (
            <span>📭 Немає даних для цієї години</span>
          ) : (
            <>
              🌡 Температура: {selectedHour.temperature}°C <br />
              💨 Вітер: {selectedHour.windspeed} м/с <br />
              🌧 Опади: {selectedHour.precipitation ?? 0} мм <br />
              <pre>{JSON.stringify(selectedHour, null, 2)}</pre> {/* тимчасово для перевірки */}
            </>
          )}
        </div>
      )}
    </div>
  );
}
