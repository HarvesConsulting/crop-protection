import html2pdf from "html2pdf.js";
import React from "react";

export default function PDFExporter({ data }) {
  const exportToPDF = () => {
    if (!data || data.length === 0) {
      alert("Немає даних для експорту");
      return;
    }

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

    // Фірмовий бланк з логотипом та шапкою
    pdfContainer.innerHTML = `
      <!-- Шапка з логотипом та контактами -->
      <div style="border-bottom: 3px solid #2E7D32; padding-bottom: 20px; margin-bottom: 30px;">
        <table width="100%" style="border-collapse: collapse;">
          <tr>
            <td width="20%" style="vertical-align: top;">
              <img 
                src="${logoUrl}" 
                alt="Логотип" 
                style="height: 80px; max-width: 150px; display: block; border: 1px solid #e0e0e0; border-radius: 8px; padding: 5px;"
                onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTUwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iODAiIGZpbGw9IiMyRTdEMzIiIHJ4PSI4Ii8+PHRleHQgeD0iNzUiIHk9IjQwIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+Q1JPUDwvdGV4dD48L3N2Zz4=';"
              />
            </td>
            <td width="60%" style="vertical-align: top; text-align: center;">
              <h1 style="margin: 0; color: #2E7D32; font-size: 28px; font-weight: 600; letter-spacing: 0.5px;">
                ІНТЕГРОВАНА СИСТЕМА ЗАХИСТУ РОСЛИН
              </h1>
              <p style="margin: 8px 0 0 0; color: #666; font-size: 16px; font-weight: 300;">
                Професійні рекомендації для захисту врожаю картоплі
              </p>
            </td>
            <td width="20%" style="vertical-align: top; text-align: right; font-size: 12px; color: #666;">
              <div style="margin-bottom: 5px;"><strong>Дата формування:</strong></div>
              <div style="color: #2E7D32; font-weight: 500;">${new Date().toLocaleDateString("uk-UA", { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric' 
              })}</div>
              <div style="margin-top: 10px; font-size: 10px; background: #f5f5f5; padding: 4px 8px; border-radius: 4px;">
                Документ №${Math.random().toString(36).substr(2, 9).toUpperCase()}
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Інформація про період -->
      <div style="background: linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%); padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #4CAF50; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin: 0 0 15px 0; color: #2E7D32; font-size: 18px;">📊 Зведена інформація</h3>
        <table width="100%" style="border-collapse: collapse; font-size: 14px;">
          <tr>
            <td width="25%" style="padding: 8px;"><strong>📅 Період аналізу:</strong></td>
            <td width="25%" style="padding: 8px;">${data[0]?.Дата || '—'} - ${data[data.length - 1]?.Дата || '—'}</td>
            <td width="25%" style="padding: 8px;"><strong>🛡️ Кількість обробок:</strong></td>
            <td width="25%" style="padding: 8px;"><span style="color: #2E7D32; font-weight: bold;">${data.length}</span></td>
          </tr>
          <tr>
            <td style="padding: 8px;"><strong>🌱 Культура:</strong></td>
            <td style="padding: 8px;">Картопля</td>
            <td style="padding: 8px;"><strong>📈 Статус:</strong></td>
            <td style="padding: 8px;"><span style="color: #2E7D32; font-weight: bold; background: #E8F5E8; padding: 4px 8px; border-radius: 12px;">✓ Рекомендовано</span></td>
          </tr>
        </table>
      </div>

      <!-- Основна таблиця -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #2E7D32; font-size: 22px; margin-bottom: 20px; border-bottom: 2px solid #E8F5E8; padding-bottom: 10px; display: flex; align-items: center; gap: 10px;">
          <span style="background: #2E7D32; color: white; padding: 8px 12px; border-radius: 6px; font-size: 16px;">📋</span>
          План захистних заходів
        </h2>
        <table width="100%" style="border-collapse: collapse; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 10px; overflow: hidden; border: 1px solid #e0e0e0;">
          <thead>
            <tr style="background: linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%); color: white;">
              <th style="padding: 16px; text-align: center; font-weight: 600; width: 8%; border-right: 1px solid #45a049;">№</th>
              <th style="padding: 16px; text-align: left; font-weight: 600; width: 15%; border-right: 1px solid #45a049;">Дата обробки</th>
              <th style="padding: 16px; text-align: left; font-weight: 600; width: 42%; border-right: 1px solid #45a049;">Препарати та норми</th>
              <th style="padding: 16px; text-align: left; font-weight: 600; width: 35%;">Цільові хвороби</th>
            </tr>
          </thead>
          <tbody>
            ${data.map((entry, index) => {
              const productName = entry.Препарат?.split('(')[0]?.trim() || 'Не вказано';
              const productDosage = entry.Препарат?.match(/\(([^)]+)\)/)?.[1] || 'норма не вказана';
              const diseases = (entry.Хвороби || '').split(', ').filter(d => d.trim());
              
              return `
                <tr style="${index % 2 === 0 ? 'background-color: #FAFAFA;' : 'background-color: white;'} border-bottom: 1px solid #E8E8E8;">
                  <td style="padding: 14px; text-align: center; font-weight: 700; color: #2E7D32; border-right: 1px solid #E8E8E8;">${index + 1}</td>
                  <td style="padding: 14px; font-weight: 600; color: #333; border-right: 1px solid #E8E8E8;">
                    <div style="font-size: 14px;">${entry.Дата || ''}</div>
                  </td>
                  <td style="padding: 14px; border-right: 1px solid #E8E8E8;">
                    <div style="font-weight: 600; color: #2E7D32; margin-bottom: 6px; font-size: 14px;">${productName}</div>
                    <div style="font-size: 12px; color: #666; background: #F5F5F5; padding: 4px 8px; border-radius: 4px; display: inline-block;">
                      💧 Норма: ${productDosage}
                    </div>
                  </td>
                  <td style="padding: 14px;">
                    ${diseases.length > 0 ? diseases.map(disease => `
                      <span style="display: inline-block; background: linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%); color: #2E7D32; padding: 6px 12px; margin: 2px; border-radius: 15px; font-size: 11px; font-weight: 500; border: 1px solid #C8E6C9;">
                        🛡️ ${disease.trim()}
                      </span>
                    `).join('') : '<span style="color: #999; font-style: italic;">Не вказано</span>'}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Легенда та примітки -->
      <div style="display: flex; gap: 20px; margin-bottom: 30px;">
        <div style="flex: 1; background: linear-gradient(135deg, #FFF3E0 0%, #FFF8E1 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #FF9800; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <h3 style="margin: 0 0 12px 0; color: #E65100; font-size: 16px; display: flex; align-items: center; gap: 8px;">
            <span style="background: #FF9800; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">📝</span>
            Важливі примітки
          </h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #666; line-height: 1.6;">
            <li>Обробки проводять в сприятливі погодні умови (відсутність опадів, вітер до 5 м/с)</li>
            <li>Дотримуйтесь регламенту чергування препаратів для запобігання резистентності</li>
            <li>Враховуйте період чекання до збору врожаю для кожного препарату</li>
            <li>Зберігайте тару від препаратів для утилізації</li>
          </ul>
        </div>
        <div style="flex: 1; background: linear-gradient(135deg, #E3F2FD 0%, #E1F5FE 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #2196F3; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <h3 style="margin: 0 0 12px 0; color: #1565C0; font-size: 16px; display: flex; align-items: center; gap: 8px;">
            <span style="background: #2196F3; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">🛡️</span>
            Заходи безпеки
          </h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #666; line-height: 1.6;">
            <li>Обов'язково використовуйте засоби індивідуального захисту (ЗІЗ)</li>
            <li>Дотримуйтесь санітарних норм під час роботи з препаратами</li>
            <li>Не допускайте попадання препаратів у водойми</li>
            <li>Консультуйтесь з агрономом при виникненні питань</li>
          </ul>
        </div>
      </div>

      <!-- Футер -->
      <div style="border-top: 2px solid #2E7D32; padding-top: 25px; margin-top: 30px; background: linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%); padding: 20px; border-radius: 8px;">
        <table width="100%" style="border-collapse: collapse; font-size: 12px; color: #666;">
          <tr>
            <td width="60%" style="vertical-align: top; padding-right: 20px;">
              <div style="margin-bottom: 10px; font-weight: 600; color: #2E7D32;">⚖️ Юридична інформація:</div>
              <div style="line-height: 1.5; margin-bottom: 8px;">Документ сформовано автоматично на основі агрономічних моделей та метеоданих.</div>
              <div style="line-height: 1.5; font-style: italic;">Відповідальність за остаточні рішення щодо застосування препаратів несе замовник послуг.</div>
            </td>
            <td width="40%" style="vertical-align: top; text-align: center; border-left: 1px solid #e0e0e0; padding-left: 20px;">
              <div style="margin-bottom: 12px; font-weight: 600; color: #2E7D32;">👨‍🌾 Агроном-консультант:</div>
              <div style="border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 8px; min-height: 40px;">_________________________</div>
              <div style="font-style: italic; color: #999; font-size: 11px;">підпис та ПІБ</div>
              <div style="margin-top: 15px; background: #2E7D32; color: white; padding: 8px 12px; border-radius: 6px; font-size: 11px; font-weight: 500;">
                Штамп агрономічної служби
              </div>
            </td>
          </tr>
        </table>
        <div style="text-align: center; margin-top: 25px; padding: 15px; background: white; border-radius: 6px; font-size: 10px; color: #999; border: 1px solid #f0f0f0;">
          <strong>ℹ️ Інформаційний документ</strong> | Цей документ є інтелектуальною власністю. Копіювання та розповсюдження без дозволу заборонено.
          <br>© ${new Date().getFullYear()} Агрономічна служба захисту рослин. Усі права захищено.
        </div>
      </div>
    `;

    // Налаштування для html2pdf
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Інтегрована_система_захисту_картоплі_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 1.0,
        forceRedirect: true
      },
      html2canvas: { 
        scale: 3, // Збільшено масштаб для кращої якості
        useCORS: true,
        logging: true,
        width: 800,
        windowWidth: 800,
        backgroundColor: '#FFFFFF',
        allowTaint: true,
        foreignObjectRendering: true,
        onclone: function(clonedDoc) {
          console.log('✅ DOM клоновано для html2canvas');
        }
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true,
        hotfixes: ['px_scaling']
      }
    };

    console.log("🔄 Генерація професійного бланку...");
    console.log("📁 Шлях до логотипу:", logoUrl);

    html2pdf()
      .set(opt)
      .from(pdfContainer)
      .save()
      .then(() => {
        console.log("✅ Професійний бланк успішно збережено");
      })
      .catch((error) => {
        console.error("❌ Помилка при створенні PDF:", error);
        alert("Помилка при створенні PDF файлу: " + error.message);
      });
  };

  return (
    <button onClick={exportToPDF} className="toggle-button" style={{
      background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
      transition: 'all 0.3s ease'
    }}>
      🏢 Зберегти фірмовий бланк
    </button>
  );
}