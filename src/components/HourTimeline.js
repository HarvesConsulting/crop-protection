import React, { useState, useEffect } from "react";
import "./HourTimeline.css";
import { format, parseISO } from "date-fns";

export default function HourTimeline({ date, hourlyData = [] }) {
  const [activeTooltip, setActiveTooltip] = useState(null);

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

  useEffect(() => {
    const handleScroll = () => {
      // Видаляємо тултіп при скролі
      removeTooltip();
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  const showTooltip = (event, hourData, hour) => {
    removeTooltip();

    const rect = event.target.getBoundingClientRect();
    const tooltip = document.createElement("div");
    tooltip.className = "hour-details-tooltip floating-tooltip";

    tooltip.innerHTML = `
      <strong>${hour}:00</strong><br/>
      🌡 Температура: ${hourData.temperature}°C<br/>
      💧 Вологість: ${hourData.humidity ?? "—"}%<br/>
      💨 Вітер: ${hourData.windspeed ?? "—"} км/год<br/>
      🌧 Опади: ${hourData.precipitation ?? 0} мм<br/>
      ${
        hourData.suitable
          ? '<span style="color:green;font-weight:bold;">✅ Рекомендовано</span>'
          : '<span style="color:red;font-weight:bold;">❌ Не рекомендовано</span>'
      }
    `;

    tooltip.style.position = "fixed";
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 8}px`;
    tooltip.style.transform = "translateX(-50%) translateY(-100%)";
    tooltip.style.pointerEvents = "none";
    tooltip.dataset.tooltip = "true";

    document.body.appendChild(tooltip);
    setActiveTooltip(tooltip);
  };

  const removeTooltip = () => {
    if (activeTooltip) {
      activeTooltip.remove();
      setActiveTooltip(null);
    }
  };

  return (
    <div className="timeline-wrapper">
      <div className="timeline-scroll">
        <div className="timeline-bar">
          {[...Array(24).keys()].map((hour) => {
            const hourData = hoursToday.find((h) => Number(h.hour) === hour);
            const isSuitable = hourData?.suitable === true;

            return (
              <div
                key={hour}
                className="hour-segment-wrapper"
                onMouseEnter={(e) =>
                  hourData && window.innerWidth > 768
                    ? showTooltip(e, hourData, hour)
                    : null
                }
                onMouseLeave={() =>
                  window.innerWidth > 768 ? removeTooltip() : null
                }
                onTouchStart={(e) => {
                  if (!hourData) return;
                  showTooltip(e, hourData, hour);
                  setTimeout(() => removeTooltip(), 3000); // автохов тултіп на мобільному
                }}
              >
                <div
                  className={`hour-segment ${
                    isSuitable ? "suitable" : "not-suitable"
                  }`}
                >
                  {hour}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
