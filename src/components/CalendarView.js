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
    if (startDate) {
      const start = new Date(startDate);
      setActiveStartDate(start);
    } else {
      setActiveStartDate(new Date());
    }
  }, [startDate]);

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

  // Проста функція для тултіпу
  const handleMouseEnter = (e, date) => {
    const eventsForDate = getEventsForDate(date);
    
    if (eventsForDate.length > 0) {
      const rect = e.target.getBoundingClientRect();
      const content = eventsForDate.map(event => `• ${event.title}`).join('\n');
      
      setTooltip({
        visible: true,
        content,
        x: rect.left + rect.width / 2,
        y: rect.top
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, content: "", x: 0, y: 0 });
  };

  // Простий вміст для клітинок
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

  // Додаємо класи для клітинок з подіями
  const tileClassName = ({ date, view }) => {
    const classes = [];
    if (view === "month") {
      const hasEvent = getEventsForDate(date).length > 0;
      if (hasEvent) classes.push("has-event");
      if (date.toDateString() === new Date().toDateString()) classes.push("today");
    }
    return classes.join(" ");
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
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
          locale="uk-UA"
          showNeighboringMonth={false}
        />
      </div>

      {/* Простий тултіп */}
      {tooltip.visible && (
        <div 
          className="simple-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y - 10,
          }}
        >
          {tooltip.content}
          <div className="tooltip-arrow"></div>
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