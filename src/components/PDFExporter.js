import html2pdf from "html2pdf.js";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function PDFExporter({ data }) {
  const { t, i18n } = useTranslation(); // Видаляємо namespace та keyPrefix
  const [isGenerating, setIsGenerating] = useState(false);

  const exportToPDF = async () => {
    if (!data || data.length === 0) {
      alert(t("pdfExporter.noDataAlert", "Немає даних для експорту"));
      return;
    }

    setIsGenerating(true);

    try {
      const baseUrl = window.location.origin;
      const logoUrl = `${baseUrl}/images/logo.png`;

      const pdfContainer = document.createElement("div");
      pdfContainer.style.width = "800px";
      pdfContainer.style.padding = "30px";
      pdfContainer.style.backgroundColor = "white";
      pdfContainer.style.color = "#000";
      pdfContainer.style.fontFamily = "Arial, sans-serif";
      pdfContainer.style.boxSizing = "border-box";
      pdfContainer.style.lineHeight = "1.3";

      pdfContainer.innerHTML = `
        <div style="border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 20px;">
          <table width="100%">
            <tr>
              <td width="20%"><img src="${logoUrl}" alt="${t("pdfExporter.logoAlt", "Логотип")}" style="height: 70px;" onerror="this.style.display='none'" /></td>
              <td width="60%" style="text-align: center;">
                <h1 style="margin: 0; font-size: 22px;">${t("pdfExporter.mainTitle", "ІНТЕГРОВАНА СИСТЕМА ЗАХИСТУ РОСЛИН")}</h1>
              </td>
              <td width="20%" style="text-align: right; font-size: 11px; color: #666;">
                <div>${t("pdfExporter.date", "Дата")}: ${new Date().toLocaleDateString(i18n.language)}</div>
                <div>${t("pdfExporter.docNumber", "Док. №")} ${Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
              </td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
          <table width="100%" style="font-size: 13px;">
            <tr>
              <td width="25%"><strong>${t("pdfExporter.analysisPeriod", "Період аналізу")}:</strong></td>
              <td width="25%">${data[0]?.Дата || '—'} - ${data[data.length - 1]?.Дата || '—'}</td>
              <td width="25%"><strong>${t("pdfExporter.treatmentsCount", "Кількість обробок")}:</strong></td>
              <td width="25%">${data.length}</td>
            </tr>
            <tr>
              <td><strong>${t("pdfExporter.crop", "Культура")}:</strong></td>
              <td>${t("pdfExporter.tomatoes", "Томати")}</td>
              <td><strong>${t("pdfExporter.status", "Статус")}:</strong></td>
              <td><strong style="color: #006600;">${t("pdfExporter.recommended", "Рекомендовано")}</strong></td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; border-bottom: 1px solid #333; padding-bottom: 8px;">${t("pdfExporter.protectionPlan", "План захистних заходів")}</h2>
          <table width="100%" style="font-size: 12px; border: 1px solid #333;">
            <thead>
              <tr style="background: #333; color: white;">
                <th style="padding: 10px; width: 8%;">№</th>
                <th style="padding: 10px; width: 15%;">${t("pdfExporter.table.date", "Дата")}</th>
                <th style="padding: 10px; width: 52%;">${t("pdfExporter.table.products", "Препарати")}</th>
                <th style="padding: 10px; width: 25%;">${t("pdfExporter.table.diseases", "Хвороби")}</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((entry, index) => {
                const diseases = (entry.Хвороби || '').split(', ').filter(Boolean);
                return `
                  <tr style="background: ${index % 2 === 0 ? '#f5f5f5' : 'white'};">
                    <td style="padding: 8px; text-align: center;">${index + 1}</td>
                    <td style="padding: 8px;">${entry.Дата || ''}</td>
                    <td style="padding: 8px;">${entry.Препарат || ''}</td>
                    <td style="padding: 8px;">
                      ${diseases.length > 0 ? diseases.map(d => `<div style='background: #e9e9e9; padding: 3px 6px; margin: 1px 0; border-radius: 3px;'>${d}</div>`).join('') : '<span style="color: #999;">—</span>'}
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background: #fffde7;">
          <h3 style="font-size: 14px; margin-bottom: 10px;">${t("pdfExporter.notes", "Примітки")}:</h3>
          <ul style="font-size: 12px; color: #666;">
            <li>${t("pdfExporter.note1", "Обробки проводять в сприятливі погодні умови")}</li>
            <li>${t("pdfExporter.note2", "Дотримуйтесь регламенту чергування препаратів")}</li>
            <li>${t("pdfExporter.note3", "Враховуйте період очікування до збору врожаю")}</li>
            <li>${t("pdfExporter.note4", "Використовуйте засоби індивідуального захисту")}</li>
          </ul>
        </div>

        <div style="border-top: 2px solid #333; padding-top: 20px;">
          <table width="100%" style="font-size: 11px; color: #666;">
            <tr>
              <td width="70%">
                <strong>${t("pdfExporter.legalInfo", "Юридична інформація")}</strong>
                <div>${t("pdfExporter.legalDescription", "Документ сформовано автоматично")}</div>
              </td>
              <td width="30%" style="text-align: center;">
                <strong>${t("pdfExporter.agronomist", "Агроном-консультант")}</strong>
                <div style="border-bottom: 1px solid #999; margin: 8px 0;">${t("pdfExporter.agronomistName", "Лашин Олександр")}</div>
                <div>${t("pdfExporter.signature", "підпис та ПІБ")}</div>
              </td>
            </tr>
          </table>
          <div style="text-align: center; font-size: 10px; margin-top: 20px;">© ${new Date().getFullYear()} ${t("pdfExporter.copyright", "Агрономічна служба")}</div>
        </div>
      `;

      document.body.appendChild(pdfContainer);
      await new Promise(res => setTimeout(res, 500));

      const opt = {
        margin: 10,
        filename: `${t("pdfExporter.filename", "Система_захисту")}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          width: 800,
          windowWidth: 800,
          backgroundColor: '#FFFFFF'
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
      };

      await html2pdf().set(opt).from(pdfContainer).save();
      document.body.removeChild(pdfContainer);

    } catch (err) {
      console.error("PDF error:", err);
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
        fontSize: '14px'
      }}
    >
      {isGenerating ? t("pdfExporter.generating", "Генерація...") : t("pdfExporter.savePdf", "Зберегти PDF")}
    </button>
  );
}