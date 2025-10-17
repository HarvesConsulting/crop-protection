import html2pdf from "html2pdf.js";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function PDFExporter({ data }) {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);

  const exportToPDF = async () => {
    console.log("📊 PDF Export started with data:", data);
    
    if (!data || data.length === 0) {
      console.warn("❌ No data for PDF export");
      alert("Немає даних для експорту");
      return;
    }

    setIsGenerating(true);

    try {
      // Базовий URL для логотипу
      const baseUrl = window.location.origin;
      const logoUrl = `${baseUrl}/images/logo.png`;
      console.log("🖼️ Logo URL:", logoUrl);

      // Створюємо контейнер для PDF
      const pdfContainer = document.createElement("div");
      pdfContainer.id = "pdf-export-container";
      pdfContainer.style.width = "800px";
      pdfContainer.style.padding = "30px";
      pdfContainer.style.backgroundColor = "white";
      pdfContainer.style.color = "#000";
      pdfContainer.style.fontFamily = "Arial, sans-serif";
      pdfContainer.style.boxSizing = "border-box";
      pdfContainer.style.lineHeight = "1.3";
      pdfContainer.style.position = "fixed";
      pdfContainer.style.left = "-9999px";
      pdfContainer.style.top = "0";

      // Отримуємо дати для періоду аналізу
      const dates = data.map(entry => entry.Дата).filter(Boolean);
      const startDate = dates[0] || '—';
      const endDate = dates[dates.length - 1] || '—';

      console.log("📅 Dates for PDF:", { startDate, endDate, totalEntries: data.length });

      // HTML для PDF з вашими ключами
      pdfContainer.innerHTML = `
        <div style="border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px;">
          <div style="text-align: center;">
            <h1 style="margin: 0; color: #000; font-size: 22px; font-weight: bold;">
              ${t("step4.integratedSystem")}
            </h1>
            <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
              Індивідуальний план захисту
            </p>
          </div>
          <div style="text-align: right; font-size: 11px; color: #666; margin-top: 10px;">
            <div>Дата: ${new Date().toLocaleDateString("uk-UA")}</div>
            <div>Док. №${Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
          </div>
        </div>

        <!-- Інформація про період -->
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
          <table width="100%" style="border-collapse: collapse; font-size: 13px;">
            <tr>
              <td width="25%" style="padding: 5px;"><strong>Період розрахунку:</strong></td>
              <td width="25%" style="padding: 5px;">${startDate} - ${endDate}</td>
              <td width="25%" style="padding: 5px;"><strong>Кількість обробок:</strong></td>
              <td width="25%" style="padding: 5px;">${data.length}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Культура:</strong></td>
              <td style="padding: 5px;">Томати</td>
              <td style="padding: 5px;"><strong>Статус:</strong></td>
              <td style="padding: 5px;"><strong style="color: #006600;">Рекомендовано</strong></td>
            </tr>
          </table>
        </div>

        <!-- Основна таблиця -->
        <div style="margin-bottom: 25px;">
          <h2 style="color: #000; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 8px;">
            План захистних заходів
          </h2>
          <table width="100%" style="border-collapse: collapse; font-size: 12px; border: 1px solid #333;">
            <thead>
              <tr style="background: #333; color: white;">
                <th style="padding: 10px; border: 1px solid #333; text-align: center; font-weight: bold; width: 8%;">№</th>
                <th style="padding: 10px; border: 1px solid #333; text-align: left; font-weight: bold; width: 15%;">
                  ${t("step4.table.date")}
                </th>
                <th style="padding: 10px; border: 1px solid #333; text-align: left; font-weight: bold; width: 52%;">
                  ${t("step4.table.products")}
                </th>
                <th style="padding: 10px; border: 1px solid #333; text-align: left; font-weight: bold; width: 25%;">
                  ${t("step4.table.diseases")}
                </th>
              </tr>
            </thead>
            <tbody>
              ${data.map((entry, index) => {
                const diseases = (entry.Хвороби || '').split(', ').filter(d => d.trim());
                console.log(`📝 Entry ${index}:`, entry);
                
                return `
                  <tr style="${index % 2 === 0 ? 'background-color: #f5f5f5;' : 'background-color: white;'}">
                    <td style="padding: 8px; border: 1px solid #ccc; text-align: center; font-weight: bold;">${index + 1}</td>
                    <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold;">${entry.Дата || '—'}</td>
                    <td style="padding: 8px; border: 1px solid #ccc;">${entry.Препарат || '—'}</td>
                    <td style="padding: 8px; border: 1px solid #ccc;">
                      ${diseases.length > 0 ? diseases.map(disease => `
                        <div style="background: #e9e9e9; padding: 3px 6px; margin: 1px 0; border-radius: 3px; font-size: 11px;">
                          ${disease.trim()}
                        </div>
                      `).join('') : `<span style="color: #999;">—</span>`}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Примітки -->
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background: #fffde7;">
          <h3 style="margin: 0 0 10px 0; color: #000; font-size: 14px; font-weight: bold;">
            Примітки:
          </h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #666;">
            <li>Обробки проводять в сприятливі погодні умови (дивитись в картках обробок - рекомендовані години)</li>
            <li>Дотримуйтесь регламенту чергування препаратів</li>
            <li>Враховуйте період очікування до збору врожаю згідно рекомендацій виробника</li>
            <li>Використовуйте засоби індивідуального захисту</li>
          </ul>
        </div>

        <!-- Футер -->
        <div style="border-top: 2px solid #333; padding-top: 20px; margin-top: 25px;">
          <div style="font-size: 11px; color: #666;">
            <div style="margin-bottom: 8px;"><strong>Юридична інформація:</strong></div>
            <div>Документ сформовано автоматично. Рекомендації базуються на агрономічних моделях.</div>
          </div>
          <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #999;">
            © ${new Date().getFullYear()} Агрономічна служба. Усі права захищено.
          </div>
        </div>
      `;

      // Додаємо контейнер до DOM
      document.body.appendChild(pdfContainer);
      console.log("✅ PDF container added to DOM");

      // Налаштування для html2pdf
      const opt = {
        margin: 10,
        filename: `Система_захисту_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { 
          type: 'jpeg', 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true,
          width: 800,
          windowWidth: 800,
          backgroundColor: '#FFFFFF'
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };

      // Чекаємо перед генерацією
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log("🔄 Starting PDF generation...");

      // Генеруємо PDF
      const result = await html2pdf()
        .set(opt)
        .from(pdfContainer)
        .save();
      
      console.log("✅ PDF generated successfully:", result);

      // Видаляємо контейнер
      document.body.removeChild(pdfContainer);
      console.log("🗑️ PDF container removed");

    } catch (error) {
      console.error("❌ PDF generation error:", error);
      
      // Видаляємо контейнер у разі помилки
      const container = document.getElementById('pdf-export-container');
      if (container) {
        document.body.removeChild(container);
      }
      
      alert("Помилка при створенні PDF файлу: " + error.message);
    } finally {
      setIsGenerating(false);
      console.log("🏁 PDF export process finished");
    }
  };

  return (
    <button 
      onClick={exportToPDF} 
      disabled={isGenerating || !data || data.length === 0}
      style={{
        background: '#333',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: (isGenerating || !data || data.length === 0) ? 'not-allowed' : 'pointer',
        opacity: (isGenerating || !data || data.length === 0) ? 0.6 : 1,
        fontSize: '14px',
        minWidth: '140px'
      }}
    >
      {isGenerating ? 'Генерація...' : '📄 Зберегти PDF'}
    </button>
  );
}