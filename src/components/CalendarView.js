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
              title={event.medication ? `Препарат: ${event.medication}` : event.title}
            />
          ))}
        </div>
      )}
      
      {/* Розгорнутий список */}
      {isExpanded && (
        <div className="events-list">
          {dayEvents.map((event, index) => (
            <div key={index} className={`event-item ${event.type || 'info'}`}>
              <span className="event-title">
                {event.medication ? `💊 ${event.medication}` : `📅 ${event.title}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};