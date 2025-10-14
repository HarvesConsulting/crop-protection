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
      // Спробуємо завантажити логотип
      let logoDataUrl = '';
      try {
        const response = await fetch('/images/logo.png');
        if (response.ok) {
          const blob = await response.blob();
          logoDataUrl = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        }
      } catch (error) {
        console.log('Логотип не знайдено, використовуємо запасний варіант');
      }

      // Створюємо контейнер для PDF
      const pdfContainer = document.createElement("div");
      pdfContainer.style.width = "800px";
      pdfContainer.style.padding = "40px";
      pdfContainer.style.backgroundColor = "white";
      pdfContainer.style.color = "#333";
      pdfContainer.style.fontFamily = "Arial, sans-serif";
      pdfContainer.style.boxSizing = "border-box";
      pdfContainer.style.lineHeight = "1.4";

      // Використовуємо data URL для логотипу або створюємо SVG запасний варіант
      const logoHtml = logoDataUrl 
        ? `<img src="${logoDataUrl}" alt="Логотип" style="height: 80px; max-width: 150px; display: block;" />`
        : `<div style="width: 150px; height: 80px; background: #2E7D32; color: white; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-weight: bold; font-size: 18px;">CROP PROTECTION</div>`;

      pdfContainer.innerHTML = `
        <!-- Шапка з логотипом -->
        <div style="border-bottom: 3px solid #2E7D32; padding-bottom: 20px; margin-bottom: 30px;">
          <table width="100%" style="border-collapse: collapse;">
            <tr>
              <td width="20%" style="vertical-align: top;">
                ${logoHtml}
              </td>
              <td width="60%" style="vertical-align: top; text-align: center;">
                <h1 style="margin: 0; color: #2E7D32; font-size: 24px; font-weight: bold;">
                  ІНТЕГРОВАНА СИСТЕМА ЗАХИСТУ РОСЛИН
                </h1>
                <p style="margin: 8px 0 0 0; color: #666; font-size: 14px;">
                  Професійні рекомендації для захисту врожаю картоплі
                </p>
              </td>
              <td width="20%" style="vertical-align: top; text-align: right; font-size: 12px; color: #666;">
                <div style="margin-bottom: 5px;"><strong>Дата:</strong></div>
                <div>${new Date().toLocaleDateString("uk-UA")}</div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Інформація про період -->
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #2E7D32;">
          <table width="100%" style="border-collapse: collapse; font-size: 14px;">
            <tr>
              <td width="25%" style="padding: 5px;"><strong>Період аналізу:</strong></td>
              <td width="25%" style="padding: 5px;">${data[0]?.Дата || '—'} - ${data[data.length - 1]?.Дата || '—'}</td>
              <td width="25%" style="padding: 5px;"><strong>Кількість обробок:</strong></td>
              <td width="25%" style="padding: 5px;">${data.length}</td>
            </tr>
            <tr>
              <td style="padding: 5px;"><strong>Культура:</strong></td>
              <td style="padding: 5px;">Картопля</td>
              <td style="padding: 5px;"><strong>Статус:</strong></td>
              <td style="padding: 5px;"><span style="color: #2E7D32; font-weight: bold;">Рекомендовано</span></td>
            </tr>
          </table>
        </div>

        <!-- Основна таблиця -->
        <div style="margin-bottom: 30px;">
          <h2 style="color: #2E7D32; font-size: 20px; margin-bottom: 15px;">
            План захистних заходів
          </h2>
          <table width="100%" style="border-collapse: collapse; font-size: 12px; border: 1px solid #ddd;">
            <thead>
              <tr style="background: #2E7D32; color: white;">
                <th style="padding: 12px; text-align: left; font-weight: bold; width: 10%;">№</th>
                <th style="padding: 12px; text-align: left; font-weight: bold; width: 15%;">Дата</th>
                <th style="padding: 12px; text-align: left; font-weight: bold; width: 45%;">Препарати</th>
                <th style="padding: 12px; text-align: left; font-weight: bold; width: 30%;">Хвороби</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((entry, index) => {
                const productName = entry.Препарат?.split('(')[0]?.trim() || 'Не вказано';
                const productDosage = entry.Препарат?.match(/\(([^)]+)\)/)?.[1] || 'норма не вказана';
                const diseases = (entry.Хвороби || '').split(', ').filter(d => d.trim());
                
                return `
                  <tr style="${index % 2 === 0 ? 'background-color: #f8f9fa;' : 'background-color: white;'}">
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #2E7D32;">${index + 1}</td>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: 500;">${entry.Дата || ''}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                      <div style="font-weight: 500; margin-bottom: 4px;">${productName}</div>
                      <div style="font-size: 11px; color: #666;">Норма: ${productDosage}</div>
                    </td>
                    <td style="padding: 10px; border: 1px solid #ddd;">
                      ${diseases.length > 0 ? diseases.map(disease => `
                        <div style="background: #e8f5e8; color: #2E7D32; padding: 4px 8px; margin: 2px 0; border-radius: 4px; font-size: 11px;">
                          ${disease.trim()}
                        </div>
                      `).join('') : '<span style="color: #999;">Не вказано</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Примітки -->
        <div style="background: #fff3e0; padding: 15px; border-radius: 8px; border-left: 4px solid #ff9800;">
          <h3 style="margin: 0 0 10px 0; color: #e65100; font-size: 14px;">Примітки:</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #666;">
            <li>Обробки проводять в сприятливі погодні умови</li>
            <li>Дотримуйтесь регламенту чергування препаратів</li>
            <li>Враховуйте період чекання до збору врожаю</li>
            <li>Використовуйте засоби індивідуального захисту</li>
          </ul>
        </div>

        <!-- Футер -->
        <div style="border-top: 2px solid #2E7D32; padding-top: 20px; margin-top: 30px; font-size: 11px; color: #666;">
          <table width="100%" style="border-collapse: collapse;">
            <tr>
              <td width="70%" style="vertical-align: top;">
                <div style="margin-bottom: 8px;"><strong>Юридична інформація:</strong></div>
                <div>Документ сформовано автоматично. Рекомендації базуються на агрономічних моделях.</div>
              </td>
              <td width="30%" style="vertical-align: top; text-align: center;">
                <div style="margin-bottom: 8px;"><strong>Агроном-консультант:</strong></div>
                <div style="border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 8px;">_________________________</div>
                <div>підпис та ПІБ</div>
              </td>
            </tr>
          </table>
          <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
            © ${new Date().getFullYear()} Агрономічна служба. Усі права захищено.
          </div>
        </div>
      `;

      // Додаємо контейнер до DOM
      document.body.appendChild(pdfContainer);

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
          orientation: 'portrait'
        }
      };

      // Чекаємо трохи перед генерацією
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Генеруємо PDF
      await html2pdf()
        .set(opt)
        .from(pdfContainer)
        .save();

      // Видаляємо контейнер
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
      className="toggle-button" 
      style={{
        background: '#2E7D32',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        fontWeight: '600',
        cursor: isGenerating ? 'not-allowed' : 'pointer',
        opacity: isGenerating ? 0.6 : 1
      }}
    >
      {isGenerating ? '⏳ Генерація...' : '📄 Зберегти як PDF'}
    </button>
  );
}