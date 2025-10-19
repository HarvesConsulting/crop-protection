import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarView.css";

export default function CalendarView({ events = [], startDate, endDate }) {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeStartDate, setActiveStartDate] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);

  // Функція для отримання локалі для react-calendar
  const getCalendarLocale = () => {
    switch (i18n.language) {
      case 'es': return 'es-ES';
      case 'en': return 'en-US';
      case 'uk': return 'uk-UA';
      default: return 'en-US';
    }
  };

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

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const dayEvents = getEventsForDate(date);
    
    if (dayEvents.length > 0) {
      if (expandedDate && expandedDate.toDateString() === date.toDateString()) {
        setExpandedDate(null);
      } else {
        setExpandedDate(date);
      }
    } else {
      setExpandedDate(null);
    }
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dayEvents = getEventsForDate(date);
    const isExpanded = expandedDate && expandedDate.toDateString() === date.toDateString();

    return (
      <div className="tile-content">
        {/* Індикатори подій */}
        {dayEvents.length > 0 && !isExpanded && (
          <div className="event-dots">
            {dayEvents.map((event, index) => (
              <div 
                key={index}
                className={`event-dot ${event.type || 'info'}`}
                title={event.title}
              />
            ))}
          </div>
        )}
        
        {/* Розгорнутий список препаратів */}
        {isExpanded && (
          <div className="events-list">
            {dayEvents.map((event, index) => (
              <div key={index} className={`event-item ${event.type || 'info'}`}>
                <span className="event-title">{event.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const tileClassName = ({ date, view }) => {
    const classes = [];
    if (view === "month") {
      const hasEvent = getEventsForDate(date).length > 0;
      const isExpanded = expandedDate && expandedDate.toDateString() === date.toDateString();
      
      if (hasEvent) classes.push("has-event");
      if (isExpanded) classes.push("expanded");
      if (date.toDateString() === new Date().toDateString()) classes.push("today");
    }
    return classes.join(" ");
  };

  const formatPeriodText = () => {
    if (startDate && endDate) {
      return t("calendar.period", {
        start: new Date(startDate).toLocaleDateString(getCalendarLocale()),
        end: new Date(endDate).toLocaleDateString(getCalendarLocale())
      });
    }
    return t("calendar.clickHint");
  };

  return (
    <div className="calendar-wrapper">
      <h2>{t("calendar.title")}</h2>
      <p className="calendar-subtitle">
        {formatPeriodText()}
      </p>

      <div className="calendar-container">
        <Calendar
          onChange={handleDateClick}
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          activeStartDate={activeStartDate}
          onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
          locale={getCalendarLocale()} // Динамічна зміна локалі
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

      <div className="instagram-container">
        <a
          href="https://www.instagram.com/harvest.consulting/"
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-link"
        >
          {t("calendar.instagramLink")}
        </a>
      </div>
    </div>
  );
}