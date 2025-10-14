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
      // Базовий URL для логотипу
      const baseUrl = window.location.origin;
      const logoUrl = `${baseUrl}/images/logo.png`;

      // Створюємо контейнер для PDF
      const pdfContainer = document.createElement("div");
      pdfContainer.style.width = "800px";
      pdfContainer.style.padding = "40px";
      pdfContainer.style.backgroundColor = "white";
      pdfContainer.style.color = "#333";
      pdfContainer.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
      pdfContainer.style.boxSizing = "border-box";
      pdfContainer.style.lineHeight = "1.4";

      // Фірмовий бланк з логотипом
      pdfContainer.innerHTML = `
        <!-- Шапка з логотипом -->
        <div style="border-bottom: 3px solid #2E7D32; padding-bottom: 20px; margin-bottom: 30px;">
          <table width="100%" style="border-collapse: collapse;">
            <tr>
              <td width="20%" style="vertical-align: top;">
                <img 
                  src="${logoUrl}" 
                  alt="Логотип" 
                  style="height: 80px; max-width: 150px; display: block; border: 2px solid #2E7D32; border-radius: 10px; padding: 5px; background: white;"
                  onerror="this.style.display='none'"
                />
              </td>
              <td width="60%" style="vertical-align: top; text-align: center;">
                <h1 style="margin: 0; color: #2E7D32; font-size: 28px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                  ІНТЕГРОВАНА СИСТЕМА ЗАХИСТУ РОСЛИН
                </h1>
                <p style="margin: 10px 0 0 0; color: #4CAF50; font-size: 16px; font-weight: 500;">
                  Професійні рекомендації для захисту врожаю картоплі
                </p>
              </td>
              <td width="20%" style="vertical-align: top; text-align: right; font-size: 12px; color: #666;">
                <div style="margin-bottom: 8px; font-weight: 600;">Дата формування:</div>
                <div style="color: #2E7D32; font-weight: 700; font-size: 14px;">${new Date().toLocaleDateString("uk-UA")}</div>
                <div style="margin-top: 15px; background: #2E7D32; color: white; padding: 6px 10px; border-radius: 5px; font-size: 10px; font-weight: 600;">
                  Документ №${Math.random().toString(36).substr(2, 6).toUpperCase()}
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Інформація про період -->
        <div style="background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%); padding: 25px; border-radius: 12px; margin-bottom: 30px; color: white; box-shadow: 0 4px 15px rgba(46, 125, 50, 0.3);">
          <h3 style="margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center; gap: 10px;">
            <span style="background: white; color: #2E7D32; padding: 8px 12px; border-radius: 8px; font-size: 14px;">📊</span>
            ЗВЕДЕНА ІНФОРМАЦІЯ
          </h3>
          <table width="100%" style="border-collapse: collapse; font-size: 15px; font-weight: 500;">
            <tr>
              <td width="25%" style="padding: 10px; border-right: 1px solid rgba(255,255,255,0.3);">
                <div style="opacity: 0.9; margin-bottom: 5px;">📅 Період аналізу:</div>
                <div style="font-weight: 700; font-size: 16px;">${data[0]?.Дата || '—'} - ${data[data.length - 1]?.Дата || '—'}</div>
              </td>
              <td width="25%" style="padding: 10px; border-right: 1px solid rgba(255,255,255,0.3);">
                <div style="opacity: 0.9; margin-bottom: 5px;">🛡️ Кількість обробок:</div>
                <div style="font-weight: 700; font-size: 16px;">${data.length}</div>
              </td>
              <td width="25%" style="padding: 10px; border-right: 1px solid rgba(255,255,255,0.3);">
                <div style="opacity: 0.9; margin-bottom: 5px;">🌱 Культура:</div>
                <div style="font-weight: 700; font-size: 16px;">Картопля</div>
              </td>
              <td width="25%" style="padding: 10px;">
                <div style="opacity: 0.9; margin-bottom: 5px;">📈 Статус:</div>
                <div style="font-weight: 700; font-size: 16px; background: rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 20px; display: inline-block;">
                  ✅ Рекомендовано
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Основна таблиця -->
        <div style="margin-bottom: 35px;">
          <h2 style="color: #2E7D32; font-size: 24px; margin-bottom: 25px; border-bottom: 3px solid #2E7D32; padding-bottom: 12px; display: flex; align-items: center; gap: 15px;">
            <span style="background: #2E7D32; color: white; padding: 10px 15px; border-radius: 8px; font-size: 18px;">📋</span>
            ПЛАН ЗАХИСТНИХ ЗАХОДІВ
          </h2>
          <table width="100%" style="border-collapse: collapse; font-size: 14px; box-shadow: 0 6px 20px rgba(0,0,0,0.15); border-radius: 12px; overflow: hidden; border: 2px solid #2E7D32;">
            <thead>
              <tr style="background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%); color: white;">
                <th style="padding: 18px; text-align: center; font-weight: 700; width: 8%; border-right: 1px solid #45a049; font-size: 15px;">№</th>
                <th style="padding: 18px; text-align: left; font-weight: 700; width: 15%; border-right: 1px solid #45a049; font-size: 15px;">Дата обробки</th>
                <th style="padding: 18px; text-align: left; font-weight: 700; width: 52%; border-right: 1px solid #45a049; font-size: 15px;">Препарати та норми</th>
                <th style="padding: 18px; text-align: left; font-weight: 700; width: 25%; font-size: 15px;">Цільові хвороби</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((entry, index) => {
                const diseases = (entry.Хвороби || '').split(', ').filter(d => d.trim());
                
                return `
                  <tr style="${index % 2 === 0 ? 'background-color: #F8F9FA;' : 'background-color: white;'} border-bottom: 1px solid #E0E0E0;">
                    <td style="padding: 16px; text-align: center; font-weight: 700; color: #2E7D32; border-right: 1px solid #E0E0E0; font-size: 16px;">
                      ${index + 1}
                    </td>
                    <td style="padding: 16px; font-weight: 600; color: #1B5E20; border-right: 1px solid #E0E0E0; font-size: 14px;">
                      <div style="font-weight: 700;">${entry.Дата || ''}</div>
                    </td>
                    <td style="padding: 16px; border-right: 1px solid #E0E0E0;">
                      <div style="font-weight: 600; color: #2E7D32; line-height: 1.6; font-size: 14px;">${entry.Препарат || ''}</div>
                    </td>
                    <td style="padding: 16px;">
                      ${diseases.length > 0 ? diseases.map(disease => `
                        <div style="display: inline-block; background: linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%); color: #1B5E20; padding: 8px 14px; margin: 3px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid #A5D6A7; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                          🛡️ ${disease.trim()}
                        </div>
                      `).join('') : '<span style="color: #999; font-style: italic; font-size: 13px;">Не вказано</span>'}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <!-- Інформаційні блоки -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 35px;">
          <div style="background: linear-gradient(135deg, #FFF3E0 0%, #FFECB3 100%); padding: 25px; border-radius: 12px; border-left: 5px solid #FF9800; box-shadow: 0 4px 12px rgba(255,152,0,0.2);">
            <h3 style="margin: 0 0 15px 0; color: #E65100; font-size: 18px; display: flex; align-items: center; gap: 12px;">
              <span style="background: #FF9800; color: white; padding: 6px 10px; border-radius: 6px; font-size: 14px;">📝</span>
              ВАЖЛИВІ ПРИМІТКИ
            </h3>
            <ul style="margin: 0; padding-left: 25px; font-size: 14px; color: #5D4037; line-height: 1.7;">
              <li>Обробки проводять в сприятливі погодні умови</li>
              <li>Дотримуйтесь регламенту чергування препаратів</li>
              <li>Враховуйте період чекання до збору врожаю</li>
              <li>Зберігайте тару від препаратів для утилізації</li>
            </ul>
          </div>
          <div style="background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%); padding: 25px; border-radius: 12px; border-left: 5px solid #2196F3; box-shadow: 0 4px 12px rgba(33,150,243,0.2);">
            <h3 style="margin: 0 0 15px 0; color: #1565C0; font-size: 18px; display: flex; align-items: center; gap: 12px;">
              <span style="background: #2196F3; color: white; padding: 6px 10px; border-radius: 6px; font-size: 14px;">🛡️</span>
              ЗАХОДИ БЕЗПЕКИ
            </h3>
            <ul style="margin: 0; padding-left: 25px; font-size: 14px; color: #0D47A1; line-height: 1.7;">
              <li>Використовуйте засоби індивідуального захисту</li>
              <li>Дотримуйтесь санітарних норм</li>
              <li>Не допускайте попадання у водойми</li>
              <li>Консультуйтесь з агрономом</li>
            </ul>
          </div>
        </div>

        <!-- Футер -->
        <div style="border-top: 3px solid #2E7D32; padding-top: 30px; margin-top: 40px; background: linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%); padding: 25px; border-radius: 12px; border: 1px solid #E0E0E0;">
          <table width="100%" style="border-collapse: collapse; font-size: 13px; color: #424242;">
            <tr>
              <td width="65%" style="vertical-align: top; padding-right: 25px;">
                <div style="margin-bottom: 12px; font-weight: 700; color: #2E7D32; font-size: 14px;">⚖️ ЮРИДИЧНА ІНФОРМАЦІЯ:</div>
                <div style="line-height: 1.6; margin-bottom: 10px;">Документ сформовано автоматично на основі агрономічних моделей та метеоданих.</div>
                <div style="line-height: 1.6; font-style: italic; color: #666;">Відповідальність за остаточні рішення щодо застосування препаратів несе замовник послуг.</div>
              </td>
              <td width="35%" style="vertical-align: top; text-align: center; border-left: 2px solid #BDBDBD; padding-left: 25px;">
                <div style="margin-bottom: 15px; font-weight: 700; color: #2E7D32; font-size: 14px;">👨‍🌾 АГРОНОМ-КОНСУЛЬТАНТ:</div>
                <div style="border-bottom: 2px solid #9E9E9E; padding-bottom: 12px; margin-bottom: 12px; min-height: 45px; font-size: 16px; font-weight: 600;">
                  _________________________
                </div>
                <div style="font-style: italic; color: #757575; font-size: 12px; margin-bottom: 15px;">підпис та ПІБ</div>
                <div style="background: linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%); color: white; padding: 10px 15px; border-radius: 8px; font-size: 12px; font-weight: 700; box-shadow: 0 3px 8px rgba(0,0,0,0.2);">
                  ШТАМП АГРОНОМІЧНОЇ СЛУЖБИ
                </div>
              </td>
            </tr>
          </table>
          <div style="text-align: center; margin-top: 30px; padding: 20px; background: white; border-radius: 8px; font-size: 11px; color: #757575; border: 1px solid #E0E0E0; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
            <strong style="color: #2E7D32;">ℹ️ ІНФОРМАЦІЙНИЙ ДОКУМЕНТ</strong> | Цей документ є інтелектуальною власністю. Копіювання та розповсюдження без дозволу заборонено.
            <br>© ${new Date().getFullYear()} АГРОНОМІЧНА СЛУЖБА ЗАХИСТУ РОСЛИН. УСІ ПРАВА ЗАХИЩЕНО.
          </div>
        </div>
      `;

      // Налаштування для html2pdf
      const opt = {
        margin: [15, 15, 15, 15],
        filename: `Інтегрована_система_захисту_картоплі_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { 
          type: 'jpeg', 
          quality: 1.0
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
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 50%, #4CAF50 100%)',
        color: 'white',
        border: 'none',
        padding: '14px 28px',
        borderRadius: '10px',
        fontWeight: '700',
        fontSize: '16px',
        cursor: isGenerating ? 'not-allowed' : 'pointer',
        opacity: isGenerating ? 0.6 : 1,
        boxShadow: '0 6px 20px rgba(27, 94, 32, 0.4)',
        transition: 'all 0.3s ease',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}
      onMouseOver={(e) => !isGenerating && (e.target.style.transform = 'translateY(-2px)')}
      onMouseOut={(e) => !isGenerating && (e.target.style.transform = 'translateY(0)')}
    >
      {isGenerating ? '⏳ ГЕНЕРАЦІЯ...' : '🏢 ЗБЕРЕГТИ ФІРМОВИЙ БЛАНК'}
    </button>
  );
}