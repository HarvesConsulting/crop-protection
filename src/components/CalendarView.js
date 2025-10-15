import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarView.css";

export default function CalendarView({ events = [], startDate, endDate }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeStartDate, setActiveStartDate] = useState(null);

  // Встановлення початкової дати для календаря
  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate);
      setActiveStartDate(start);
    } else {
      // Якщо startDate не передано, встановлюємо поточний місяць
      setActiveStartDate(new Date());
    }
  }, [startDate]);

  const normalizeDate = (input) => {
    if (input instanceof Date) return input;
    if (typeof input === "string") {
      // Обробка формату dd.MM.yyyy
      if (input.includes(".")) {
        const [day, month, year] = input.split(".");
        return new Date(`${year}-${month}-${day}`);
      }
      // Обробка формату yyyy-MM-dd
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
                title={`${type}: ${dayEvents.filter(e => e.type === type).length} подій`}
              />
            ))}
            {dayEvents.length > 1 && (
              <div className="event-count" title={`${dayEvents.length} подій`}>
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
      const hasEvent = events.some(
        (event) =>
          normalizeDate(event.date)?.toDateString() === date.toDateString()
      );
      
      if (hasEvent) classes.push("highlight");
      if (date.toDateString() === new Date().toDateString()) classes.push("react-calendar__tile--now");
      
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
          'Натисніть на дату, щоб побачити призначені обробки та ризики'
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
        />
      </div>

      {/* Деталі вибраної дати */}
      {selectedDate && (
        <div className="event-list">
          <h3>Події на {selectedDate.toLocaleDateString("uk-UA")}:</h3>
          {getEventsForDate(selectedDate).length > 0 ? (
            getEventsForDate(selectedDate).map((event, index) => (
              <div key={index} className="event-card">
                <div className="event-header">
                  <div className="event-title">{event.title}</div>
                  <div className={`event-type ${event.type || 'info'}`}>
                    {event.type === 'spray' ? 'Обробка' : 
                     event.type === 'risk' ? 'Ризик' : 'Інфо'}
                  </div>
                </div>
                <p className="event-description">{event.description}</p>
                {event.time && (
                  <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                    ⏰ {event.time}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="no-events">
              Немає запланованих подій на цей день
            </div>
          )}
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