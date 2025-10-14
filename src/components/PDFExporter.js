import html2pdf from "html2pdf.js";
import React from "react";

export default function PDFExporter({ data }) {
  const exportToPDF = () => {
    if (!data || data.length === 0) {
      alert("Немає даних для експорту");
      return;
    }

    // Створюємо контейнер для PDF
    const pdfContainer = document.createElement("div");
    pdfContainer.style.width = "800px";
    pdfContainer.style.padding = "40px";
    pdfContainer.style.backgroundColor = "white";
    pdfContainer.style.color = "black";
    pdfContainer.style.fontFamily = "Arial, sans-serif";
    pdfContainer.style.boxSizing = "border-box";

    // Створюємо HTML вміст
    pdfContainer.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 20px;">
        <div style="flex: 1;">
          <h2 style="margin: 0; color: #333;">Інтегрована система захисту рослин</h2>
          <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
            Сформовано ${new Date().toLocaleDateString("uk-UA")}
          </p>
        </div>
      </div>

      <table border="1" cellpadding="8" cellspacing="0" width="100%" style="border-collapse: collapse; font-size: 14px; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #f5f5f5;">
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Дата</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Препарати</th>
            <th style="border: 1px solid #ddd; padding: 12px; text-align: left; font-weight: bold;">Хвороби</th>
          </tr>
        </thead>
        <tbody>
          ${data.map((entry, index) => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 10px; vertical-align: top;">${entry.Дата || ''}</td>
              <td style="border: 1px solid #ddd; padding: 10px; vertical-align: top;">${entry.Препарат || ''}</td>
              <td style="border: 1px solid #ddd; padding: 10px; vertical-align: top;">${entry.Хвороби || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div style="padding: 15px; background-color: #f9f9f9; border-left: 4px solid #ff9800;">
        <p style="margin: 0; font-size: 12px; color: #666;">
          ⚠️ Документ сформовано автоматично на базі агрономічної моделі. 
          Для прийняття остаточних рішень проконсультуйтесь з агрономом.
        </p>
      </div>
    `;

    // Налаштування для html2pdf
    const opt = {
      margin: 10,
      filename: `Інтегрована_система_захисту_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.98 
      },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: true,
        width: 800,
        windowWidth: 800
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };

    console.log("🔄 Початок генерації PDF...");

    // Використовуємо Promise для кращого контролю
    html2pdf()
      .set(opt)
      .from(pdfContainer)
      .save()
      .then(() => {
        console.log("✅ PDF успішно збережено");
      })
      .catch((error) => {
        console.error("❌ Помилка при створенні PDF:", error);
        alert("Помилка при створенні PDF файлу");
      });
  };

  return (
    <button onClick={exportToPDF} className="toggle-button">
      📄 Зберегти як PDF
    </button>
  );
}