import React, { useState } from "react";
import "./HourTimeline.css";
import { format, parseISO } from "date-fns";
import TooltipPortal from "./TooltipPortal";

export default function HourTimeline({ date, hourlyData = [] }) {
  const [activeHour, setActiveHour] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

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

  return (
    <div className="timeline-wrapper">
      <div className="timeline-scroll">
        <div className="timeline-bar" onTouchEnd={closeTooltip}>
          {[...Array(24).keys()].map((hour) => {
            const hourData = hoursToday.find((h) => Number(h.hour) === hour);
            const isActive = activeHour === hour;
            const isSuitable = hourData?.suitable === true;

            return (
              <div
                key={hour}
                className="hour-segment-wrapper"
                onMouseEnter={(e) => {
                  if (!hourData) return;
                  const rect = e.target.getBoundingClientRect();
                  setTooltipPos({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 8,
                  });
                  setActiveHour(hour);
                }}
                onMouseLeave={closeTooltip}
                onTouchStart={(e) => {
                  if (!hourData) return;
                  const rect = e.target.getBoundingClientRect();
                  setTooltipPos({
                    x: rect.left + rect.width / 2,
                    y: rect.top - 8,
                  });
                  setActiveHour(hour);
                  setTimeout(() => setActiveHour(null), 3000); // авто-закриття
                }}
              >
                <div
                  className={`hour-segment ${
                    isSuitable ? "suitable" : "not-suitable"
                  }`}
                >
                  {hour}
                </div>

                {isActive && hourData && (
                  <TooltipPortal x={tooltipPos.x} y={tooltipPos.y}>
                    <>
                      <strong>{hour}:00</strong> <br />
                      🌡 Температура: {hourData.temperature}°C <br />
                      💧 Вологість: {hourData.humidity ?? "—"}% <br />
                      💨 Вітер: {hourData.windspeed} км/год <br />
                      🌧 Опади: {hourData.precipitation ?? 0} мм <br />
                      {isSuitable ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          ✅ Рекомендовано
                        </span>
                      ) : (
                        <span style={{ color: "red", fontWeight: "bold" }}>
                          ❌ Не рекомендовано
                        </span>
                      )}
                    </>
                  </TooltipPortal>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
