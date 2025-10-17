import html2pdf from "html2pdf.js";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function PDFExporter({ data }) {
  const { t, i18n } = useTranslation("integratedTable", { keyPrefix: "pdfExporter" });
  const [isGenerating, setIsGenerating] = useState(false);

  const exportToPDF = async () => {
    if (!data || data.length === 0) {
      alert(t("noDataAlert"));
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
              <td width="20%"><img src="${logoUrl}" alt="${t("logoAlt")}" style="height: 70px;" /></td>
              <td width="60%" style="text-align: center;">
                <h1 style="margin: 0; font-size: 22px;">${t("mainTitle")}</h1>
              </td>
              <td width="20%" style="text-align: right; font-size: 11px; color: #666;">
                <div>${t("date")}: ${new Date().toLocaleDateString(i18n.language)}</div>
                <div>${t("docNumber")} ${Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
              </td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
          <table width="100%" style="font-size: 13px;">
            <tr>
              <td width="25%"><strong>${t("analysisPeriod")}:</strong></td>
              <td width="25%">${data[0]?.Дата || '—'} - ${data[data.length - 1]?.Дата || '—'}</td>
              <td width="25%"><strong>${t("treatmentsCount")}:</strong></td>
              <td width="25%">${data.length}</td>
            </tr>
            <tr>
              <td><strong>${t("crop")}:</strong></td>
              <td>${t("tomatoes")}</td>
              <td><strong>${t("status")}:</strong></td>
              <td><strong style="color: #006600;">${t("recommended")}</strong></td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; border-bottom: 1px solid #333; padding-bottom: 8px;">${t("protectionPlan")}</h2>
          <table width="100%" style="font-size: 12px; border: 1px solid #333;">
            <thead>
              <tr style="background: #333; color: white;">
                <th style="padding: 10px; width: 8%;">№</th>
                <th style="padding: 10px; width: 15%;">${t("table.date")}</th>
                <th style="padding: 10px; width: 52%;">${t("table.products")}</th>
                <th style="padding: 10px; width: 25%;">${t("table.diseases")}</th>
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
          <h3 style="font-size: 14px; margin-bottom: 10px;">${t("notes")}:</h3>
          <ul style="font-size: 12px; color: #666;">
            <li>${t("note1")}</li>
            <li>${t("note2")}</li>
            <li>${t("note3")}</li>
            <li>${t("note4")}</li>
          </ul>
        </div>

        <div style="border-top: 2px solid #333; padding-top: 20px;">
          <table width="100%" style="font-size: 11px; color: #666;">
            <tr>
              <td width="70%">
                <strong>${t("legalInfo")}</strong>
                <div>${t("legalDescription")}</div>
              </td>
              <td width="30%" style="text-align: center;">
                <strong>${t("agronomist")}</strong>
                <div style="border-bottom: 1px solid #999; margin: 8px 0;">${t("agronomistName")}</div>
                <div>${t("signature")}</div>
              </td>
            </tr>
          </table>
          <div style="text-align: center; font-size: 10px; margin-top: 20px;">© ${new Date().getFullYear()} ${t("copyright")}</div>
        </div>
      `;

      document.body.appendChild(pdfContainer);
      await new Promise(res => setTimeout(res, 500));

      const opt = {
        margin: 10,
        filename: `${t("filename")}_${new Date().toISOString().split('T')[0]}.pdf`,
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
      alert(t("errorAlert"));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={exportToPDF}
      disabled={isGenerating}
      style={{
        background: '#333',
        color: 'white',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        fontWeight: 'bold',
        cursor: isGenerating ? 'not-allowed' : 'pointer',
        opacity: isGenerating ? 0.6 : 1,
        fontSize: '14px'
      }}
    >
      {isGenerating ? t("generating") : t("savePdf")}
    </button>
  );
}