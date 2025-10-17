import html2pdf from "html2pdf.js";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const translations = {
  uk: {
    noDataAlert: "Немає даних для експорту",
    logoAlt: "Логотип",
    mainTitle: "ІНТЕГРОВАНА СИСТЕМА ЗАХИСТУ РОСЛИН",
    subTitle: "Індивідуальний план захисту",
    date: "Дата",
    docNumber: "Док. №",
    analysisPeriod: "Період аналізу",
    treatmentsCount: "Кількість обробок",
    crop: "Культура",
    tomatoes: "Томати",
    status: "Статус",
    recommended: "Рекомендовано",
    protectionPlan: "План захистних заходів",
    table: {
      date: "Дата",
      products: "Препарати",
      diseases: "Хвороби"
    },
    notes: "Примітки",
    note1: "Обробки проводять в сприятливі погодні умови (дивитись в картках обробок - рекомендовані години)",
    note2: "Дотримуйтесь регламенту чергування препаратів",
    note3: "Враховуйте період очікування до збору врожаю згідно рекомендацій виробника",
    note4: "Використовуйте засоби індивідуального захисту",
    legalInfo: "Юридична інформація",
    legalDescription: "Документ сформовано автоматично. Рекомендації базуються на агрономічних моделях.",
    agronomist: "Агроном-консультант",
    agronomistName: "Лашин Олександр",
    signature: "підпис та ПІБ",
    copyright: "Агрономічна служба. Усі права захищено.",
    generating: "Генерація...",
    savePdf: "📄 Зберегти PDF",
    errorAlert: "Помилка при створенні PDF файлу"
  },
  en: {
    noDataAlert: "No data to export",
    logoAlt: "Logo",
    mainTitle: "INTEGRATED PLANT PROTECTION SYSTEM",
    subTitle: "Individual Protection Plan",
    date: "Date",
    docNumber: "Doc. №",
    analysisPeriod: "Analysis period",
    treatmentsCount: "Treatment count",
    crop: "Crop",
    tomatoes: "Tomatoes",
    status: "Status",
    recommended: "Recommended",
    protectionPlan: "Protection Plan",
    table: {
      date: "Date",
      products: "Products",
      diseases: "Diseases"
    },
    notes: "Notes",
    note1: "Treatments should be carried out in favorable weather (see treatment cards - recommended hours)",
    note2: "Follow the rotation rules of the products",
    note3: "Respect the pre-harvest interval according to manufacturer recommendations",
    note4: "Use personal protective equipment",
    legalInfo: "Legal information",
    legalDescription: "This document is generated automatically. Recommendations are based on agronomic models.",
    agronomist: "Consulting agronomist",
    agronomistName: "Oleksandr Lashin",
    signature: "signature and full name",
    copyright: "Agronomic Service. All rights reserved.",
    generating: "Generating...",
    savePdf: "📄 Save PDF",
    errorAlert: "Error creating PDF file"
  },
  de: {
    noDataAlert: "Keine Daten zum Exportieren",
    logoAlt: "Logo",
    mainTitle: "INTEGRIERTES PFLANZENSCHUTZSYSTEM",
    subTitle: "Individueller Schutzplan",
    date: "Datum",
    docNumber: "Dok. Nr.",
    analysisPeriod: "Analysezeitraum",
    treatmentsCount: "Behandlungsanzahl",
    crop: "Kultur",
    tomatoes: "Tomaten",
    status: "Status",
    recommended: "Empfohlen",
    protectionPlan: "Schutzmaßnahmenplan",
    table: {
      date: "Datum",
      products: "Produkte",
      diseases: "Krankheiten"
    },
    notes: "Hinweise",
    note1: "Behandlungen bei günstigen Wetterbedingungen durchführen (siehe Behandlungszeiten)",
    note2: "Beachten Sie den Rotationsplan der Produkte",
    note3: "Beachten Sie die Wartezeit vor der Ernte gemäß den Empfehlungen des Herstellers",
    note4: "Tragen Sie persönliche Schutzausrüstung",
    legalInfo: "Rechtliche Hinweise",
    legalDescription: "Dokument automatisch erstellt. Empfehlungen basieren auf agronomischen Modellen.",
    agronomist: "Beratender Agronom",
    agronomistName: "Oleksandr Lashin",
    signature: "Unterschrift und Name",
    copyright: "Agronomischer Dienst. Alle Rechte vorbehalten.",
    generating: "Erstelle PDF...",
    savePdf: "📄 PDF speichern",
    errorAlert: "Fehler beim Erstellen der PDF-Datei"
  }
};

export default function PDFExporter({ data }) {
  const { i18n } = useTranslation();
  const language = i18n.language || 'uk';
  const t = translations[language] && translations[language].savePdf
    ? translations[language]
    : translations.uk;
  const [isGenerating, setIsGenerating] = useState(false);

  const exportToPDF = async () => {
    if (!data || data.length === 0) {
      alert(t.noDataAlert);
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
              <td width="20%"><img src="${logoUrl}" alt="${t.logoAlt}" style="height: 70px;" /></td>
              <td width="60%" style="text-align: center;">
                <h1 style="margin: 0; font-size: 22px;">${t.mainTitle}</h1>
              </td>
              <td width="20%" style="text-align: right; font-size: 11px; color: #666;">
                <div>${t.date}: ${new Date().toLocaleDateString()}</div>
                <div>${t.docNumber} ${Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
              </td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;">
          <table width="100%" style="font-size: 13px;">
            <tr>
              <td width="25%"><strong>${t.analysisPeriod}:</strong></td>
              <td width="25%">${data[0]?.Дата || '—'} - ${data[data.length - 1]?.Дата || '—'}</td>
              <td width="25%"><strong>${t.treatmentsCount}:</strong></td>
              <td width="25%">${data.length}</td>
            </tr>
            <tr>
              <td><strong>${t.crop}:</strong></td>
              <td>${t.tomatoes}</td>
              <td><strong>${t.status}:</strong></td>
              <td><strong style="color: #006600;">${t.recommended}</strong></td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 25px;">
          <h2 style="font-size: 18px; border-bottom: 1px solid #333; padding-bottom: 8px;">${t.protectionPlan}</h2>
          <table width="100%" style="font-size: 12px; border: 1px solid #333;">
            <thead>
              <tr style="background: #333; color: white;">
                <th style="padding: 10px; width: 8%;">№</th>
                <th style="padding: 10px; width: 15%;">${t.table.date}</th>
                <th style="padding: 10px; width: 52%;">${t.table.products}</th>
                <th style="padding: 10px; width: 25%;">${t.table.diseases}</th>
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
          <h3 style="font-size: 14px; margin-bottom: 10px;">${t.notes}:</h3>
          <ul style="font-size: 12px; color: #666;">
            <li>${t.note1}</li>
            <li>${t.note2}</li>
            <li>${t.note3}</li>
            <li>${t.note4}</li>
          </ul>
        </div>

        <div style="border-top: 2px solid #333; padding-top: 20px;">
          <table width="100%" style="font-size: 11px; color: #666;">
            <tr>
              <td width="70%">
                <strong>${t.legalInfo}:</strong>
                <div>${t.legalDescription}</div>
              </td>
              <td width="30%" style="text-align: center;">
                <strong>${t.agronomist}:</strong>
                <div style="border-bottom: 1px solid #999; margin: 8px 0;">${t.agronomistName}</div>
                <div>${t.signature}</div>
              </td>
            </tr>
          </table>
          <div style="text-align: center; font-size: 10px; margin-top: 20px;">© ${new Date().getFullYear()} ${t.copyright}</div>
        </div>
      `;

      document.body.appendChild(pdfContainer);
      await new Promise(res => setTimeout(res, 500));

      const opt = {
        margin: 10,
        filename: `System_Protection_${new Date().toISOString().split('T')[0]}.pdf`,
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
      alert(t.errorAlert);
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
      {isGenerating ? (t?.generating || 'Generating...') : (t?.savePdf || 'Save PDF')}
    </button>
  );
}