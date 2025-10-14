import html2pdf from "html2pdf.js";
import React from "react";

export default function PDFExporter({ data }) {
  const exportToPDF = () => {
    // Створюємо тимчасовий контейнер для PDF
    const pdfContainer = document.createElement("div");
    pdfContainer.style.position = "fixed";
    pdfContainer.style.left = "0";
    pdfContainer.style.top = "0";
    pdfContainer.style.width = "800px";
    pdfContainer.style.padding = "40px";
    pdfContainer.style.backgroundColor = "white";
    pdfContainer.style.color = "black";
    pdfContainer.style.fontFamily = "Arial, sans-serif";
    pdfContainer.style.zIndex = "9999";
    pdfContainer.style.boxSizing = "border-box";

    // Додаємо логотип з обробкою помилок
    const logoHtml = `
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <img 
          src="/images/logo.png" 
          alt="Логотип" 
          style="height: 60px; margin-right: 20px;" 
          onerror="this.style.display='none'"
        />
        <div>
          <h2 style="margin: 0;">Інтегрована система захисту рослин</h2>
          <p style="margin: 0; font-size: 14px; color: #555;">
            Сформовано ${new Date().toLocaleDateString("uk-UA")}
          </p>
        </div>
      </div>
    `;

    // Формуємо таблицю з даними
    const tableHtml = `
      <table 
        border="1" 
        cellpadding="8" 
        cellspacing="0" 
        width="100%" 
        style="border-collapse: collapse; font-size: 14px; text-align: left;"
      >
        <thead>
          <tr style="background-color: #e0e0e0;">
            <th>Дата</th>
            <th>Препарати</th>
            <th>Хвороби</th>
          </tr>
        </thead>
        <tbody>
          ${
            data && data.length > 0 
              ? data.map((entry, index) => `
                  <tr key="${index}">
                    <td>${entry.Дата || ''}</td>
                    <td>${entry.Препарат || ''}</td>
                    <td>${entry.Хвороби || ''}</td>
                  </tr>
                `).join('')
              : `
                <tr>
                  <td colspan="3" style="text-align: center; padding: 20px;">
                    Дані відсутні
                  </td>
                </tr>
              `
          }
        </tbody>
      </table>
    `;

    const footerHtml = `
      <p style="margin-top: 40px; font-size: 13px; color: #666;">
        ⚠️ Документ сформовано автоматично на базі агрономічної моделі. 
        Для прийняття остаточних рішень проконсультуйтесь з агрономом.
      </p>
    `;

    // Додаємо весь контент до контейнера
    pdfContainer.innerHTML = logoHtml + tableHtml + footerHtml;
    document.body.appendChild(pdfContainer);

    // Налаштування для PDF
    const opt = {
      margin: 0.5,
      filename: "Інтегрована_система_захисту.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        logging: true,
        allowTaint: true
      },
      jsPDF: { 
        unit: "mm", 
        format: "a4", 
        orientation: "portrait" 
      },
    };

    // Генеруємо PDF
    html2pdf()
      .set(opt)
      .from(pdfContainer)
      .save()
      .then(() => {
        // Видаляємо тимчасовий контейнер після створення PDF
        document.body.removeChild(pdfContainer);
      })
      .catch((error) => {
        console.error("Помилка при створенні PDF:", error);
        document.body.removeChild(pdfContainer);
      });
  };

  return (
    <button onClick={exportToPDF} className="toggle-button">
      📄 Зберегти як PDF
    </button>
  );
}
