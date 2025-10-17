import html2pdf from "html2pdf.js";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function PDFExporter({ data }) {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);

  const exportToPDF = async () => {
    if (!data || data.length === 0) {
      alert(t("pdfExporter.noDataAlert", "Немає даних для експорту"));
      return;
    }

    setIsGenerating(true);

    try {
      // Базовий URL для логотипу
      const baseUrl = window.location.origin;
      const logoUrl = `${baseUrl}/images/logo.png`;

      // Створюємо контейнер для PDF
      const pdfContainer = document.createElement("div");
      pdfContainer.style.width = "800px";
      pdfContainer.style.padding = "30px";
      pdfContainer.style.backgroundColor = "white";
      pdfContainer.style.color = "#000";
      pdfContainer.style.fontFamily = "Arial, sans-serif";
      pdfContainer.style.boxSizing = "border-box";
      pdfContainer.style.lineHeight = "1.3";

      // Отримуємо дати для періоду аналізу
      const dates = data.map(entry => entry.Дата).filter(Boolean);
      const startDate = dates[0] || '—';
      const endDate = dates[dates.length - 1] || '—';

      // Класичний фірмовий бланк з локалізацією
      pdfContainer.innerHTML = `
        <!-- Шапка з логотипом -->
        <div style="border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px;">
          <table width="100%" style="border-collapse: collapse;">
            <tr>
              <td width="20%" style="vertical-align: top;">
                <img 
                  src="${logoUrl}" 
                  alt="${t("pdfExporter.logoAlt", "Логотип")}" 
                  style="height: 70px; display: block;"
                  onerror="this.style.display='none'"
                />
              </td>
              <td width="60%" style="vertical-align: top; text-align: center;">
                <h1 style="margin: 0; color: #000; font-size: 22px; font-weight: bold;">
                  ${t("pdfExporter.mainTitle", "ІНТЕГРОВАНА СИСТЕМА ЗАХИСТУ РОСЛИН")}
                </h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">
                  ${t("pdfExporter.subTitle", "Індивідуальний план захисту")}
                </p>
              </td>
              <td width="20%" style="vertical-align: top; text-align: right; font-size: 11px; color: #666;">
                <div style="margin-bottom: 3px;">${t("pdfExporter.date", "Дата")}: ${new Date().toLocaleDateString("uk-UA")}</div>
                <div>${t("pdfExporter.docNumber", "Док. №")}${Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Інформація про період -->
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
          <table width="100%" style="border-collapse: collapse; font-size: 13px;">
            <tr>
              <td width="25%" style="padding: 5px;"><strong>${t("pdfExporter.analysisPeriod", "Період аналізу")}:</strong></td>
              <td width="25%" style="padding: 5px;">${startDate} - ${endDate}</td>
              <td width="25%" style="padding: 5px;"><strong>${t("pdfExporter.treatmentsCount", "Кількість обробок")}:</strong></td>
              <td width="25%" style="padding: 5px;">${data.length}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>${t("pdfExporter.crop", "Культура")}:</strong></td>
              <td style="padding: 5px;">${t("pdfExporter.tomatoes", "Томати")}</td>
              <td style="padding: 5px;"><strong>${t("pdfExporter.status", "Статус")}:</strong></td>
              <td style="padding: 5px;"><strong style="color: #006600;">${t("pdfExporter.recommended", "Рекомендовано")}</strong></td>
            </tr>
          </table>
        </div>

        <!-- Основна таблиця -->
        <div style="margin-bottom: 25px;">
          <h2 style="color: #000; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 8px;">
            ${t("pdfExporter.protectionPlan", "План захистних заходів")}
          </h2>
          <table width="100%" style="border-collapse: collapse; font-size: 12px; border: 1px solid #333;">
            <thead>
              <tr style="background: #333; color: white;">
                <th style="padding: 10px; border: 1px solid #333; text-align: center; font-weight: bold; width: 8%;">№</th>
                <th style="padding: 10px; border: 1px solid #333; text-align: left; font-weight: bold; width: 15%;">
                  ${t("pdfExporter.table.date", "Дата")}
                </th>
                <th style="padding: 10px; border: 1px solid #333; text-align: left; font-weight: bold; width: 52%;">
                  ${t("pdfExporter.table.products", "Препарати")}
                </th>
                <th style="padding: 10px; border: 1px solid #333; text-align: left; font-weight: bold; width: 25%;">
                  ${t("pdfExporter.table.diseases", "Хвороби")}
                </th>
              </tr>
            </thead>
            <tbody>
              ${data.map((entry, index) => {
                const diseases = (entry.Хвороби || '').split(', ').filter(d => d.trim());
                
                return `
                  <tr style="${index % 2 === 0 ? 'background-color: #f5f5f5;' : 'background-color: white;'}">
                    <td style="padding: 8px; border: 1px solid #ccc; text-align: center; font-weight: bold;">${index + 1}</td>
                    <td style="padding: 8px; border: 1px solid #ccc; font-weight: bold;">${entry.Дата || ''}</td>
                    <td style="padding: 8px; border: 1px solid #ccc;">${entry.Препарат || ''}</td>
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
            ${t("pdfExporter.notes", "Примітки")}:
          </h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #666;">
            <li>${t("pdfExporter.note1", "Обробки проводять в сприятливі погодні умови (дивитись в картках обробок - рекомендовані години)")}</li>
            <li>${t("pdfExporter.note2", "Дотримуйтесь регламенту чергування препаратів")}</li>
            <li>${t("pdfExporter.note3", "Враховуйте період очікування до збору врожаю згідно рекомендацій виробника")}</li>
            <li>${t("pdfExporter.note4", "Використовуйте засоби індивідуального захисту")}</li>
          </ul>
        </div>

        <!-- Футер -->
        <div style="border-top: 2px solid #333; padding-top: 20px; margin-top: 25px;">
          <table width="100%" style="border-collapse: collapse; font-size: 11px; color: #666;">
            <tr>
              <td width="70%" style="vertical-align: top;">
                <div style="margin-bottom: 8px;"><strong>${t("pdfExporter.legalInfo", "Юридична інформація")}:</strong></div>
                <div>${t("pdfExporter.legalDescription", "Документ сформовано автоматично. Рекомендації базуються на агрономічних моделях.")}</div>
              </td>
              <td width="30%" style="vertical-align: top; text-align: center;">
                <div style="margin-bottom: 8px;"><strong>${t("pdfExporter.agronomist", "Агроном-консультант")}:</strong></div>
                <div style="border-bottom: 1px solid #999; padding-bottom: 8px; margin-bottom: 8px;">
                  ${t("pdfExporter.agronomistName", "Лашин Олександр")}
                </div>
                <div>${t("pdfExporter.signature", "підпис та ПІБ")}</div>
              </td>
            </tr>
          </table>
          <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #999;">
            © ${new Date().getFullYear()} ${t("pdfExporter.copyright", "Агрономічна служба. Усі права захищено.")}
          </div>
        </div>
      `;

      // Налаштування для html2pdf
      const opt = {
        margin: 10,
        filename: `${t("pdfExporter.filename", "Система_захисту")}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { 
          type: 'jpeg', 
          quality: 0.98 
        },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
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

      // Додаємо контейнер до DOM
      document.body.appendChild(pdfContainer);

      // Чекаємо перед генерацією
      await new Promise(resolve => setTimeout(resolve, 500));

      // Генеруємо PDF
      await html2pdf()
        .set(opt)
        .from(pdfContainer)
        .save();

      // Видаляємо контейнер
      document.body.removeChild(pdfContainer);

    } catch (error) {
      console.error("PDF generation error:", error);
      alert(t("pdfExporter.errorAlert", "Помилка при створенні PDF файлу"));
    } finally {
      setIsGenerating(false);
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
      title={!data || data.length === 0 ? t("pdfExporter.noDataTooltip", "Немає даних для експорту") : ""}
    >
      {isGenerating ? t("pdfExporter.generating", "Генерація...") : '📄 ' + t("pdfExporter.savePdf", "Зберегти PDF")}
    </button>
  );
}