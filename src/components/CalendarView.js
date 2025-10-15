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

  // Простий тултіп
  const handleDayMouseEnter = (event, date) => {
    const dayEvents = events.filter(ev => {
      const eventDate = new Date(ev.date);
      return eventDate.toDateString() === date.toDateString();
    });

    if (dayEvents.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
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
    setTooltip({ visible: false, content: "", x: 0, y: 0 });
  };

  // Кастомний рендер дня
  const renderTileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dayEvents = events.filter(ev => {
      const eventDate = new Date(ev.date);
      return eventDate.toDateString() === date.toDateString();
    });

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

  // Кастомний рендер дня з обробниками подій
  const renderDay = (props) => {
    const { date } = props;
    
    return (
      <div 
        {...props}
        onMouseEnter={(e) => handleDayMouseEnter(e, date)}
        onMouseLeave={handleDayMouseLeave}
        className={`react-calendar__tile ${props.className || ''}`}
      >
        {date.getDate()}
        {renderTileContent({ date, view: "month" })}
      </div>
    );
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
          tileContent={renderTileContent}
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

      {/* Тултіп */}
      {tooltip.visible && (
        <div 
          className="calendar-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y - 10,
          }}
        >
          <div className="tooltip-content">
            {tooltip.content.split('\n').map((line, index) => (
              <div key={index} className="tooltip-line">{line}</div>
            ))}
          </div>
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