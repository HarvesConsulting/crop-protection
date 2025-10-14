import React from "react";
import "./IntegratedTableView.css";

/**
 * 📊 Модальне вікно з інтегрованою системою захисту
 * Формат: Дата | Препарати
 */
export default function IntegratedTableView({ data = [], isOpen, onClose }) {
  const mergedByDate = {};

  data.forEach((entry) => {
    const date = entry.Дата;
    if (!mergedByDate[date]) {
      mergedByDate[date] = [];
    }
    mergedByDate[date].push(entry.Препарат);
  });

  const sortedDates = Object.keys(mergedByDate).sort((a, b) => {
    const [dA, mA, yA] = a.split(".");
    const [dB, mB, yB] = b.split(".");
    return new Date(yA, mA - 1, dA) - new Date(yB, mB - 1, dB);
  });

  // Закриваємо модальне вікно при кліку на фон
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Закриваємо модальне вікно при натисканні Escape
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Блокуємо скрол сторінки
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        {/* Шапка модального вікна */}
        <div className="modal-header">
          <h2 className="modal-title">Інтегрована система захисту</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Закрити">
            ×
          </button>
        </div>

        {/* Контент модального вікна */}
        <div className="modal-body">
          <div className="table-container">
            <table className="integrated-table">
              <thead>
                <tr>
                  <th className="date-header">Дата</th>
                  <th className="preparations-header">Препарати</th>
                </tr>
              </thead>
              <tbody>
                {sortedDates.map((date) => (
                  <tr key={date} className="table-row">
                    <td className="date-cell">{date}</td>
                    <td className="preparations-cell">
                      {mergedByDate[date].map((prep, i) => (
                        <div key={i} className="preparation-item">
                          {prep}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Футер модального вікна */}
        <div className="modal-footer">
          <button className="close-button" onClick={onClose}>
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}