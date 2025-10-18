import React, { useState } from "react";
import "./HourTimeline.css";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";

export default function HourTimeline({ date, hourlyData = [] }) {
  const { t } = useTranslation();
  const [activeHour, setActiveHour] = useState(null);

  const formattedDate = format(
    parseISO(date.split(".").reverse().join("-")),
    "yyyy-MM-dd"
  );

  // Знайти записи з потрібного дня
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
                onMouseEnter={() => setActiveHour(hour)}
                onMouseLeave={closeTooltip}
                onTouchStart={() => setActiveHour(hour)}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  const element = document.elementFromPoint(
                    touch.clientX,
                    touch.clientY
                  );
                  if (element && element.dataset.hour) {
                    setActiveHour(Number(element.dataset.hour));
                  }
                }}
              >
                <div
                  className={`hour-segment ${
                    isSuitable ? "suitable" : "not-suitable"
                  }`}
                  data-hour={hour}
                >
                  {hour}
                </div>

                {hourData && isActive && (
                  <div className="hour-details-tooltip mobile">
                    <strong>{hour}:00</strong> <br />
                    🌡 {t("hourly.temperature")}: {hourData.temperature}°C <br />
                    💧 {t("hourly.humidity")}: {hourData.humidity ?? "—"}% <br />
                    💨 {t("hourly.wind")}: {hourData.windspeed} {t("hourly.kmh")} <br />
                    🌧 {t("hourly.precipitation")}: {hourData.precipitation ?? 0} {t("hourly.mm")} <br />
                    {isSuitable ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        ✅ {t("hourly.recommended")}
                      </span>
                    ) : (
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        ❌ {t("hourly.notRecommended")}
                      </span>
                    )}
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