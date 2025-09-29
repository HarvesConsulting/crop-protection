import React from "react";
import "./HourTimeline.css";
import { format, parseISO } from "date-fns";

export default function HourTimeline({ date, suitableHours = [], hourlyData = [] }) {
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
            <div key={hour} className="hour-segment-wrapper">
              <div className={`hour-segment ${isSuitable ? "suitable" : "not-suitable"}`}>
                {hour}
              </div>

              {hourData && (
                <div className="hour-tooltip">
                  <strong>{hour}:00</strong> <br />
                  🌡 Температура: {hourData.temperature}°C <br />
                  💨 Вітер: {hourData.windspeed} км/год <br />
                  🌧 Опади: {hourData.precipitation ?? 0} мм
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
