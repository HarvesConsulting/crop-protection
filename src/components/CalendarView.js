import React, { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import './CalendarView.css';

export default function CalendarView({ events = [] }) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formattedDate = selectedDate.toLocaleDateString("uk-UA");

  const filteredEvents = events.filter(e => e.date === formattedDate);

  const tileContent = ({ date, view }) => {
    const day = date.toLocaleDateString("uk-UA");
    const hasEvent = events.some(e => e.date === day);
    return hasEvent ? <div className="dot" /> : null;
  };

  return (
    <div className="calendar-wrapper">
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileContent={tileContent}
      />

      <div className="event-list">
        <h3>Події на {formattedDate}:</h3>
        {filteredEvents.length > 0 ? (
          filteredEvents.map((e, i) => (
            <div key={i}>
              <strong>{e.title}</strong><br />
              <small>{e.description}</small>
              <hr />
            </div>
          ))
        ) : (
          <p>Немає подій</p>
        )}
      </div>
    </div>
  );
}
