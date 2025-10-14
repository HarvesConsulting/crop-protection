import React from "react";
import "./IntegratedTableView.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * 📊 Модальне вікно з інтегрованою системою захисту
 * Формат: Дата | Препарати
 */
export default function IntegratedTableView({ 
  data = [], 
  isOpen, 
  onClose,
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

  // ✅ ЕКСПОРТ В PDF
  const handleExportToPDF = async () => {
    const modal = document.querySelector(".modal-content");
    if (!modal) return;

    const canvas = await html2canvas(modal);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("Інтегрована_система_захисту.pdf");
  };

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
            <button 
              className="export-btn pdf-btn" 
              onClick={handleExportToPDF}
            >
              📄 Зберегти як PDF
            </button>
          </div>
          <button className="close-button" onClick={onClose}>
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}
