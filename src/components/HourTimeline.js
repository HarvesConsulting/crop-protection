import React, { useState } from "react";
import "./HourTimeline.css";
import { format, parseISO } from "date-fns";

export default function HourTimeline({ date, suitableHours = [], hourlyData = [] }) {
  const [activeHour, setActiveHour] = useState(null);

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

  const closeTooltip = () => setActiveHour(null);

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el && el.dataset.hour) {
      setActiveHour(Number(el.dataset.hour));
    }
  };

  return (
    <div className="timeline-wrapper">
      <div className="timeline-scroll">
        <div
          className="timeline-bar"
          onTouchEnd={closeTooltip}
        >
          {[...Array(24).keys()].map((hour) => {
            const isSuitable = suitableHours.includes(
              hour.toString().padStart(2, "0") + ":00"
            );
            const hourData = hoursToday.find((h) => Number(h.hour) === hour);
            const isActive = activeHour === hour;

            return (
              <div
                key={hour}
                className="hour-segment-wrapper"
                onMouseEnter={() => setActiveHour(hour)}
                onMouseLeave={closeTooltip}
                onTouchStart={() => setActiveHour(hour)}
                onTouchMove={handleTouchMove}
              >
                <div
                  className={`hour-segment ${isSuitable ? "suitable" : "not-suitable"}`}
                  data-hour={hour}
                >
                  {hour}
                </div>

                {hourData && isActive && (
                  <div className="hour-details-tooltip">
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
    </div>
  );
}
