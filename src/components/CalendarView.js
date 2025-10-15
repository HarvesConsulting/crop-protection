import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarView.css";

export default function CalendarView({ events = [], startDate, endDate }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeStartDate, setActiveStartDate] = useState(null);
  const [tooltip, setTooltip] = useState({ 
    visible: false, 
    content: "", 
    x: 0, 
    y: 0 
  });

  useEffect(() => {
    console.log('Calendar events:', events);
    if (startDate) {
      const start = new Date(startDate);
      setActiveStartDate(start);
    } else {
      setActiveStartDate(new Date());
    }
  }, [startDate, events]);

  const normalizeDate = (input) => {
    if (input instanceof Date) return input;
    if (typeof input === "string") {
      if (input.includes(".")) {
        const [day, month, year] = input.split(".");
        return new Date(`${year}-${month}-${day}`);
      }
      return new Date(input);
    }
    return null;
  };

  const getEventsForDate = (date) => {
    return events.filter(
      (event) =>
        normalizeDate(event.date)?.toDateString() === date.toDateString()
    );
  };

  const handleDayMouseEnter = (event, date) => {
    console.log('Mouse enter on date:', date);
    const dayEvents = getEventsForDate(date);
    console.log('Day events:', dayEvents);

    if (dayEvents.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      console.log('Rectangle position:', rect);
      
      const content = dayEvents.map(ev => `• ${ev.title}`).join('\n');
      
      setTooltip({
        visible: true,
        content,
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY
      });
    }
  };

  const handleDayMouseLeave = () => {
    console.log('Mouse leave');
    setTooltip({ visible: false, content: "", x: 0, y: 0 });
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 0) return null;

    return (
      <div className="event-dots">
        {dayEvents.map((event, index) => (
          <div 
            key={index}
            className={`event-dot ${event.type || 'info'}`}
          />
        ))}
      </div>
    );
  };

  const tileClassName = ({ date, view }) => {
    const classes = [];
    if (view === "month") {
      const hasEvent = getEventsForDate(date).length > 0;
      if (hasEvent) classes.push("has-event");
      if (date.toDateString() === new Date().toDateString()) classes.push("today");
    }
    return classes.join(" ");
  };

  const tileProps = ({ date, view }) => {
    if (view === "month") {
      return {
        onMouseEnter: (e) => handleDayMouseEnter(e, date),
        onMouseLeave: handleDayMouseLeave,
        onTouchStart: (e) => handleDayMouseEnter(e, date),
        onTouchEnd: handleDayMouseLeave,
      };
    }
    return {};
  };

  return (
    <div className="calendar-wrapper">
      <h2>📅 Календар обробок</h2>
      <p className="calendar-subtitle">
        {startDate && endDate 
          ? `Період: ${new Date(startDate).toLocaleDateString('uk-UA')} - ${new Date(endDate).toLocaleDateString('uk-UA')}`
          : 'Наведіть курсор на дату з крапками, щоб побачити події'
        }
      </p>

      <div className="calendar-container">
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          tileProps={tileProps}
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
          locale="uk-UA"
          showNeighboringMonth={false}
          tileDisabled={({ date, view }) => {
            if (view === 'month' && startDate && endDate) {
              const start = new Date(startDate);
              const end = new Date(endDate);
              return date < start || date > end;
            }
            return false;
          }}
        />
      </div>

      {/* Унікальний тултіп для календаря */}
      {tooltip.visible && (
        <div 
          className="calendar-tooltip-unique"
          style={{
            left: tooltip.x,
            top: tooltip.y - 10,
          }}
        >
          <div className="calendar-tooltip-content">
            {tooltip.content.split('\n').map((line, index) => (
              <div key={index} className="calendar-tooltip-line">{line}</div>
            ))}
          </div>
          <div className="calendar-tooltip-arrow"></div>
        </div>
      )}

      <div className="instagram-container">
        <a
          href="https://www.instagram.com/harvest.consulting/"
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-link"
        >
          📱 Harvest Consulting в Instagram
        </a>
      </div>
    </div>
  );
}