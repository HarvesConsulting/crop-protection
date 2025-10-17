import React from "react";
import "./IntegratedTableView.css";
import * as XLSX from "xlsx";
import PDFExporter from "./PDFExporter";

/**
 * 📊 Модальне вікно з інтегрованою системою захисту
 * Формат: Дата | Препарати
 */
export default function IntegratedTableView({ 
  data = [], 
  isOpen, 
  onClose
}) {
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

  // ✅ ЕКСПОРТ В EXCEL
  const handleExportToExcel = () => {
    const exportData = sortedDates.map((date) => ({
      Дата: date,
      Препарати: mergedByDate[date].join(", "),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Захист");
    XLSX.writeFile(wb, "Інтегрована_система_захисту.xlsx");
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
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

        {/* Футер модального вікна з кнопками експорту */}
        <div className="modal-footer">
          <div className="export-buttons">
            <button 
              className="export-btn excel-btn" 
              onClick={handleExportToExcel}
            >
              📊 Експорт в Excel
            </button>
            
            {/* Використовуємо готовий PDFExporter з фірмовим бланком */}
            <PDFExporter data={data} />
          </div>
          <button className="close-button" onClick={onClose}>
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}