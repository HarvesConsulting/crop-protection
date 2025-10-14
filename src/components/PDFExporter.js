import html2pdf from "html2pdf.js";
import React, { useState } from "react";

export default function PDFExporter({ data }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const exportToPDF = async () => {
    if (!data || data.length === 0) {
      alert("Немає даних для експорту");
      return;
    }

    setIsGenerating(true);

    try {
      // Створюємо HTML на основі даних, які точно такі ж як в IntegratedTableView
      const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <!-- Заголовок -->
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2E7D32; padding-bottom: 20px;">
            <h1 style="color: #2E7D32; margin: 0; font-size: 24px;">ІНТЕГРОВАНА СИСТЕМА ЗАХИСТУ РОСЛИН</h1>
            <p style="color: #666; margin: 5px 0 0 0;">Картопля | ${new Date().toLocaleDateString("uk-UA")}</p>
          </div>

          <!-- Таблиця ТОЧНО така ж як на сторінці -->
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px;">
            <thead>
              <tr style="background: #2E7D32; color: white;">
                <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Дата</th>
                <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Препарати</th>
                <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Хвороби</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((entry, index) => `
                <tr style="${index % 2 === 0 ? 'background: #f8f9fa;' : ''}">
                  <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${entry.Дата || ''}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${entry.Препарат || ''}</td>
                  <td style="padding: 10px; border: 1px solid #ddd;">${entry.Хвороби || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Підпис -->
          <div style="margin-top: 40px; text-align: right;">
            <div style="border-top: 1px solid #ccc; padding-top: 10px; display: inline-block;">
              <div>Агроном-консультант: _________________________</div>
              <div style="font-size: 11px; color: #666; margin-top: 5px;">${new Date().toLocaleDateString("uk-UA")}</div>
            </div>
          </div>
        </div>
      `;

      const element = document.createElement('div');
      element.innerHTML = content;
      document.body.appendChild(element);

      const opt = {
        margin: 10,
        filename: `Інтегрована_система_захисту_${new Date().toISOString().split('T')[0]}.pdf`,
        html2canvas: { 
          scale: 2,
          useCORS: true 
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        }
      };

      await html2pdf().set(opt).from(element).save();
      document.body.removeChild(element);

    } catch (error) {
      console.error("Помилка:", error);
      alert("Помилка при створенні PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button onClick={exportToPDF} disabled={isGenerating} className="toggle-button">
      {isGenerating ? '⏳ Генерація...' : '📄 Зберегти PDF'}
    </button>
  );
}