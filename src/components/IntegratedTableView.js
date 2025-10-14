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

  // ✅ ЕКСПОРТ В PDF - виправлена версія
  const handleExportToPDF = async () => {
    // Створюємо тимчасовий контейнер тільки для таблиці
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "0";
    tempContainer.style.width = "800px";
    tempContainer.style.backgroundColor = "white";
    tempContainer.style.padding = "20px";
    tempContainer.style.fontFamily = "Arial, sans-serif";
    tempContainer.style.zIndex = "9999";

    // Створюємо чисту HTML структуру для PDF
    const tableHtml = `
      <div style="width: 100%; font-family: Arial, sans-serif;">
        <h2 style="text-align: center; margin-bottom: 20px; color: #333; font-size: 24px;">
          Інтегрована система захисту
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #4a7cb6;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; color: white; width: 25%;">
                Дата
              </th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left; color: white; width: 75%;">
                Препарати
              </th>
            </tr>
          </thead>
          <tbody>
            ${sortedDates.map((date, index) => `
              <tr style="${index % 2 === 0 ? 'background-color: #f8f9fa;' : 'background-color: white;'}">
                <td style="border: 1px solid #ddd; padding: 10px; font-weight: bold;">
                  ${date}
                </td>
                <td style="border: 1px solid #ddd; padding: 10px;">
                  ${mergedByDate[date].map((prep, i) => 
                    `<div style="margin-bottom: 8px; ${i > 0 ? 'margin-top: 8px;' : ''}">${prep}</div>`
                  ).join('')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 20px; font-size: 12px; color: #666; text-align: center;">
          Згенеровано ${new Date().toLocaleDateString("uk-UA")} | Кількість обробок: ${sortedDates.length}
        </div>
      </div>
    `;

    tempContainer.innerHTML = tableHtml;
    document.body.appendChild(tempContainer);

    try {
      const canvas = await html2canvas(tempContainer, {
        scale: 3, // Збільшуємо якість
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        removeContainer: true
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Додаємо зображення в PDF
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Інтегрована_система_захисту.pdf");
      
    } catch (error) {
      console.error("Помилка при створенні PDF:", error);
      alert("Сталася помилка при створенні PDF файлу");
    } finally {
      // Видаляємо тимчасовий контейнер
      if (document.body.contains(tempContainer)) {
        document.body.removeChild(tempContainer);
      }
    }
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