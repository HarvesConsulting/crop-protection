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

  // Встановлення початкової дати для календаря
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

  const getEventTypeCount = (type) => {
    return events.filter(event => event.type === type).length;
  };

  // Покращені функції для тултіпу
  const showTooltip = (e, date) => {
    const eventsForDate = getEventsForDate(date);
    
    if (eventsForDate.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const tooltipContent = eventsForDate.map(event => 
        `• ${event.title} (${getEventTypeLabel(event.type)})`
      ).join('\n');
      
      setTooltip({
        visible: true,
        content: tooltipContent,
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY - 10
      });
    }
  };

  const getEventTypeLabel = (type) => {
    const labels = {
      'spray': 'Обробка',
      'risk': 'Ризик', 
      'info': 'Інфо'
    };
    return labels[type] || type;
  };

  const hideTooltip = () => {
    setTooltip({ visible: false, content: "", x: 0, y: 0 });
  };

  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const dayEvents = getEventsForDate(date);
      
      if (dayEvents.length > 0) {
        const eventTypes = [...new Set(dayEvents.map(event => event.type))];
        
        return (
          <div className="event-indicator">
            {eventTypes.map(type => (
              <div 
                key={type} 
                className={`event-dot ${type}`}
                title={`${getEventTypeLabel(type)}: ${dayEvents.filter(e => e.type === type).length} подій`}
              />
            ))}
            {dayEvents.length > 1 && (
              <div className="event-count">
                {dayEvents.length}
              </div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const classes = [];
      const dayEvents = getEventsForDate(date);
      
      if (dayEvents.length > 0) classes.push("has-event");
      if (date.toDateString() === new Date().toDateString()) classes.push("react-calendar__tile--now");
      
      // Додаткові класи за типом подій
      dayEvents.forEach(event => {
        if (event.type) classes.push(`has-${event.type}`);
      });

      // Підсвічування днів у вибраному періоді
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (date >= start && date <= end) {
          classes.push("in-period");
        }
      }
      
      return classes.join(" ");
    }
    return null;
  };

  // Покращені обробники подій для тултіпу
  const tileProps = ({ date, view }) => {
    if (view === "month") {
      const eventsForDate = getEventsForDate(date);
      
      if (eventsForDate.length > 0) {
        return {
          onMouseEnter: (e) => showTooltip(e, date),
          onMouseLeave: hideTooltip,
          onFocus: (e) => showTooltip(e, date),
          onBlur: hideTooltip,
          onTouchStart: (e) => showTooltip(e, date),
          onTouchEnd: hideTooltip,
        };
      }
    }
    return {};
  };

  // Функція для блокування дат поза вибраним періодом
  const tileDisabled = ({ date, view }) => {
    if (view === 'month' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return date < start || date > end;
    }
    return false;
  };

  const formatEvents = (events) => {
    return events.map(event => ({
      ...event,
      type: event.type || 'info'
    }));
  };

  const formattedEvents = formatEvents(events);

  return (
    <div className="calendar-wrapper">
      <h2 style={{ textAlign: 'center', marginBottom: '8px', color: '#2c3e50' }}>
        📅 Календар обробок
      </h2>
      <p className="text-sm text-gray-600" style={{ textAlign: 'center', marginBottom: '24px' }}>
        {startDate && endDate ? (
          `Період: ${new Date(startDate).toLocaleDateString('uk-UA')} - ${new Date(endDate).toLocaleDateString('uk-UA')}`
        ) : (
          'Наведіть курсор на дату з крапками, щоб побачити події'
        )}
      </p>

      {/* Статистика */}
      <div className="calendar-stats">
        <div className="stat-card">
          <div className="stat-number">{formattedEvents.length}</div>
          <div className="stat-label">Всього подій</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{getEventTypeCount('spray')}</div>
          <div className="stat-label">Обробки</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{getEventTypeCount('risk')}</div>
          <div className="stat-label">Ризики</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{getEventTypeCount('info')}</div>
          <div className="stat-label">Інфо</div>
        </div>
      </div>

      {/* Легенда */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-dot spray"></div>
          <span>Обробки</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot risk"></div>
          <span>Ризики</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot info"></div>
          <span>Інформація</span>
        </div>
      </div>

      {/* Календар */}
      <div className="calendar-container">
        <Calendar
          onClickDay={setSelectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          tileDisabled={tileDisabled}
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
          locale="uk-UA"
          showNeighboringMonth={false}
          minDetail="month"
          maxDetail="month"
          tileProps={tileProps}
        />
      </div>

      {/* Покращений тултіп */}
      {tooltip.visible && (
        <div 
          className="calendar-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="tooltip-content">
            {tooltip.content.split('\n').map((line, index) => (
              <div key={index} className="tooltip-line">
                {line}
              </div>
            ))}
          </div>
          <div className="tooltip-arrow"></div>
        </div>
      )}

      {/* Instagram посилання */}
      <div style={{ textAlign: 'center', marginTop: '32px' }}>
        <a
          href="https://www.instagram.com/harvest.consulting/"
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-link"
        >
          <span>📱 Harvest Consulting в Instagram</span>
        </a>
      </div>
    </div>
  );
}