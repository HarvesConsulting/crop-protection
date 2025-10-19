// CalendarView.js
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarView.css";
import { useMedications } from "../hooks/useMedications";
import MedicationModal from "../components/MedicationModal";
import MedicationNotebook from "../components/MedicationNotebook";

export default function CalendarView({ events = [], startDate, endDate }) {
  const { t, i18n } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeStartDate, setActiveStartDate] = useState(null);
  const [expandedDate, setExpandedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);

  const {
    medications,
    addMedication,
    updateMedication,
    deleteMedication,
    getMedicationsByDate,
    getAllMedications
  } = useMedications();

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
    
    // Відкриваємо модальне вікно при кліку на дату
    setIsModalOpen(true);
  };

  const handleAddMedication = (date, medication, id = null) => {
    if (id) {
      updateMedication(id, medication);
    } else {
      addMedication(date, medication);
    }
  };

  const handleOpenNotebook = () => {
    setIsNotebookOpen(true);
  };

  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dayEvents = getEventsForDate(date);
    const dayMedications = getMedicationsByDate(date);
    const isExpanded = expandedDate && expandedDate.toDateString() === date.toDateString();

    return (
      <div className="tile-content">
        {/* Індикатори подій */}
        {(dayEvents.length > 0 || dayMedications.length > 0) && !isExpanded && (
          <div className="event-dots">
            {dayEvents.map((event, index) => (
              <div 
                key={`event-${index}`}
                className={`event-dot ${event.type || 'info'}`}
                title={event.title}
              />
            ))}
            {dayMedications.map((med, index) => (
              <div 
                key={`med-${index}`}
                className="event-dot medication"
                title={med.medication}
              />
            ))}
          </div>
        )}
        
        {/* Розгорнутий список */}
        {isExpanded && (
          <div className="events-list">
            {dayEvents.map((event, index) => (
              <div key={`event-${index}`} className={`event-item ${event.type || 'info'}`}>
                <span className="event-title">{event.title}</span>
              </div>
            ))}
            {dayMedications.map((med, index) => (
              <div key={`med-${index}`} className="event-item medication">
                <span className="event-title">{med.medication}</span>
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
      const hasMedication = getMedicationsByDate(date).length > 0;
      const isExpanded = expandedDate && expandedDate.toDateString() === date.toDateString();
      
      if (hasEvent || hasMedication) classes.push("has-event");
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
      <div className="calendar-header">
        <h2>{t("calendar.title")}</h2>
        <button 
          className="notebook-button"
          onClick={handleOpenNotebook}
        >
          {t("calendar.notebook")}
        </button>
      </div>
      
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
          locale={getCalendarLocale()}
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

      {/* Модальне вікно для препаратів */}
      <MedicationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
        onAddMedication={handleAddMedication}
        medications={selectedDate ? getMedicationsByDate(selectedDate) : []}
      />

      {/* Модальне вікно записника */}
      <MedicationNotebook
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        medications={getAllMedications()}
        onEditMedication={(medication) => {
          setSelectedDate(new Date(medication.date));
          setIsNotebookOpen(false);
          setIsModalOpen(true);
        }}
      />

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