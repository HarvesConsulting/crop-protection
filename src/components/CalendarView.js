import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarView.css"; // Додай стилі нижче

export default function CalendarView({ events = [] }) {
  const [selectedDate, setSelectedDate] = useState(null);

  const normalizeDate = (input) => {
    if (input instanceof Date) return input;
    if (typeof input === "string") {
      const [day, month, year] = input.split(".");
      return new Date(`${year}-${month}-${day}`);
    }
    return null;
  };

  const getEventsForDate = (date) => {
    return events.filter(
      (event) =>
        normalizeDate(event.date)?.toDateString() === date.toDateString()
    );
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2>📅 Календар обробок</h2>
      <p className="text-sm text-gray-600">
        Натисніть на дату, щоб побачити призначені обробки.
      </p>

      <div className="calendar-container">
        <Calendar
          onClickDay={setSelectedDate}
          tileClassName={({ date, view }) => {
            if (view === "month") {
              const hasEvent = events.some(
                (event) =>
                  normalizeDate(event.date)?.toDateString() ===
                  date.toDateString()
              );
              return hasEvent ? "highlight" : null;
            }
          }}
        />
      </div>

      {selectedDate && (
        <div className="event-list">
          <h3>Обробки на {selectedDate.toLocaleDateString("uk-UA")}:</h3>
          {getEventsForDate(selectedDate).length > 0 ? (
            getEventsForDate(selectedDate).map((event, index) => (
              <div key={index} className="event-card">
                <strong>{event.title}</strong>
                <p>{event.description}</p>
              </div>
            ))
          ) : (
            <p>Немає запланованих обробок</p>
          )}
        </div>
      )}

      {/* ✨ Патріотичне повідомлення + Instagram */}
      <div style={{ marginTop: 40, textAlign: "center" }}>
                <a
          href="https://www.instagram.com/harvest.consulting/"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#007bff", textDecoration: "underline" }}
        >
          Harvest Consulting в Instagram
        </a>
      </div>
    </div>
  );
}
