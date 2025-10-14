import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ✅ Підключаємо реальні шрифти з твоєї папки fonts
import "../fonts/Roboto-bold";
import "../fonts/Roboto-Regular-normal";

export const exportToPDF = (data, logoUrl) => {
  // Створюємо PDF документ
  const doc = new jsPDF();

  // Використовуємо базовий шрифт (звичайний)
  doc.setFont("Roboto-Regular", "normal");

  // Логотип
  const img = new Image();
  img.src = logoUrl;

  img.onload = () => {
    // 🟩 Додаємо логотип у лівий верхній кут
    doc.addImage(img, "PNG", 10, 10, 40, 15);

    // 🟦 Заголовок
    doc.setFontSize(16);
    doc.setFont("Roboto", "bold");
    doc.text("Інтегрована система захисту рослин", 105, 30, { align: "center" });

    // 📅 Дата формування
    const today = new Date().toLocaleDateString("uk-UA");
    doc.setFontSize(10);
    doc.setFont("Roboto-Regular", "normal");
    doc.text(`Дата формування: ${today}`, 200, 10, { align: "right" });

    // 🧾 Формуємо дані таблиці
    const tableData = data.map((row) => [
      row["Дата"] || "",
      row["Препарат"] || "",
      row["Хвороби"] || "",
    ]);

    // 📊 Створюємо таблицю з даними
    autoTable(doc, {
      startY: 40,
      head: [["Дата", "Препарат(и)", "Хвороби"]],
      body: tableData,
      styles: {
        font: "Roboto-Regular", // ← головний текстовий шрифт
        fontSize: 10,
        cellPadding: 3,
        valign: "top",
        textColor: [30, 30, 30],
      },
      headStyles: {
        font: "Roboto", // ← жирний шрифт для заголовків
        fontStyle: "bold",
        fontSize: 10,
        fillColor: [41, 128, 185],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // 🖋️ Підпис внизу сторінки
    doc.setFontSize(8);
    doc.setFont("Roboto-Regular", "normal");
    doc.text("Підготовлено Harvest Consulting", 10, 285);

    // 💾 Зберігаємо файл
    doc.save("Інтегрована_система_захисту.pdf");
  };

  // Якщо логотип не вдалося завантажити
  img.onerror = () => {
    alert("Не вдалося завантажити логотип для PDF.");
  };
};
