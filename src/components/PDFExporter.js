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
      const baseUrl = window.location.origin;
      const logoUrl = `${baseUrl}/images/logo.png`;

      const pdfContainer = document.createElement("div");
      pdfContainer.style.width = "800px";
      pdfContainer.style.padding = "40px";
      pdfContainer.style.backgroundColor = "white";
      pdfContainer.style.color = "#000";
      pdfContainer.style.fontFamily = "Times New Roman, serif";
      pdfContainer.style.fontSize = "14px";
      pdfContainer.style.lineHeight = "1.5";

      pdfContainer.innerHTML = `
        <div style="border-bottom: 2px solid black; padding-bottom: 10px; margin-bottom: 20px;">
          <table width="100%">
            <tr>
              <td width="15%">
                <img src="${logoUrl}" alt="Логотип" style="height: 60px;" onerror="this.style.display='none'" />
              </td>
              <td style="text-align: center;">
                <h2 style="margin: 0; font-size: 20px; font-weight: bold;">МІНІСТЕРСТВО АГРАРНОЇ ПОЛІТИКИ</h2>
                <h3 style="margin: 0; font-size: 16px; font-weight: normal;">ІНТЕГРОВАНА СИСТЕМА ЗАХИСТУ РОСЛИН</h3>
              </td>
              <td width="20%" style="text-align: right; font-size: 12px;">
                <div>Дата: ${new Date().toLocaleDateString("uk-UA")}</div>
                <div>Документ №${Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
              </td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <strong>Інформація про період:</strong>
          <div>Період: ${data[0]?.Дата || '—'} - ${data[data.length - 1]?.Дата || '—'}</div>
          <div>Культура: Картопля</div>
          <div>Кількість обробок: ${data.length}</div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 10px; font-size: 16px; font-weight: bold;">План захисних заходів</h3>
          <table width="100%" border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align: center;">№</th>
                <th>Дата обробки</th>
                <th>Препарати та норми</th>
                <th>Цільові хвороби</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((entry, index) => {
                const diseases = (entry.Хвороби || '').split(', ').filter(d => d.trim());
                return `
                  <tr>
                    <td style="text-align: center;">${index + 1}</td>
                    <td>${entry.Дата || ''}</td>
                    <td>${entry.Препарат || ''}</td>
                    <td>${diseases.length > 0 ? diseases.join(', ') : 'Не вказано'}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <strong>Примітки:</strong>
          <ul>
            <li>Дотримуйтесь погодних умов перед обробкою</li>
            <li>Слідкуйте за регламентом препаратів</li>
            <li>Враховуйте строки очікування</li>
            <li>Зберігайте тару для подальшої утилізації</li>
          </ul>
        </div>

        <div style="margin-top: 40px;">
          <table width="100%">
            <tr>
              <td width="70%">
                <div style="font-size: 12px;">* Документ сформовано автоматично. Остаточні рішення приймаються замовником.</div>
              </td>
              <td style="text-align: center;">
                <div>Підпис агронома:</div>
                <div style="margin-top: 30px;">_________________________</div>
              </td>
            </tr>
          </table>
        </div>
      `;

      const opt = {
        margin: [15, 15, 15, 15],
        filename: `Захист_рослин_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 1.0 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
      };

      document.body.appendChild(pdfContainer);
      await new Promise(resolve => setTimeout(resolve, 500));
      await html2pdf().set(opt).from(pdfContainer).save();
      document.body.removeChild(pdfContainer);

    } catch (error) {
      console.error("❌ Помилка при створенні PDF:", error);
      alert("Помилка при створенні PDF файлу");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={exportToPDF}
      disabled={isGenerating}
      style={{
        background: '#000',
        color: 'white',
        border: '1px solid #333',
        padding: '12px 24px',
        borderRadius: '6px',
        fontWeight: 'bold',
        fontSize: '14px',
        cursor: isGenerating ? 'not-allowed' : 'pointer',
        opacity: isGenerating ? 0.6 : 1,
        fontFamily: 'Times New Roman, serif'
      }}
    >
      {isGenerating ? 'Формується...' : 'Зберегти PDF'}
    </button>
  );
}
