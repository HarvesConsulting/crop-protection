import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarView.css";

export default function CalendarView({ events = [] }) {
  const [selectedDate, setSelectedDate] = useState(null);

  // 🔧 Парсимо дату з формату "дд.мм.рррр"
  const parseStringToDate = (str) => {
    const [day, month, year] = str.split(".");
    return new Date(`${year}-${month}-${day}`);
  };

  // 🔧 Отримуємо список подій на дату
  const getEventsForDate = (date) => {
    return events.filter(
      (event) =>
        parseStringToDate(event.date).toDateString() === date.toDateString()
    );
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2>📅 Календар обробок</h2>
      <p className="text-sm text-gray-600">
        Натисніть на дату, щоб побачити призначені обробки.
      </p>

      <div className="calendar-container">
        <Calendar onClickDay={(value) => setSelectedDate(value)} />
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
    </div>
  );
}
