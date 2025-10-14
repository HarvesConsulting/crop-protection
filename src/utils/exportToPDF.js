import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../fonts/Roboto-Regular-normal";
import "../fonts/Roboto-bold";

export const exportToPDF = (data, logoUrl) => {
  // Ініціалізація документа
  const doc = new jsPDF();

  // Встановлення базового шрифту
  doc.setFont("Roboto-Regular", "normal");

  // Додавання логотипу
  const img = new Image();
  img.src = logoUrl;

  img.onload = () => {
    // 🟢 Логотип у верхньому лівому куті
    doc.addImage(img, "PNG", 10, 10, 40, 15);

    // 🟦 Заголовок
    doc.setFontSize(16);
    doc.setFont("Roboto-Bold", "bold");
    doc.text("Інтегрована система захисту рослин", 105, 30, { align: "center" });

    // 📅 Дата формування
    const today = new Date().toLocaleDateString("uk-UA");
    doc.setFontSize(10);
    doc.setFont("Roboto-Regular", "normal");
    doc.text(`Дата формування: ${today}`, 200, 10, { align: "right" });

    // 🧾 Підготовка даних для таблиці
    const tableData = data.map((row) => [
      row["Дата"] || "",
      row["Препарат"] || "",
      row["Хвороби"] || "",
    ]);

    // 📊 Таблиця з даними
    autoTable(doc, {
      startY: 40,
      head: [["Дата", "Препарат(и)", "Хвороби"]],
      body: tableData,
      styles: {
        font: "Roboto-Regular",
        fontSize: 10,
        cellPadding: 3,
        valign: "top",
        textColor: [30, 30, 30],
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        font: "Roboto-Bold",
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // 💾 Збереження PDF
    doc.save("Інтегрована_система_захисту.pdf");
  };

  // 🛑 Якщо логотип не завантажився
  img.onerror = () => {
    alert("Не вдалося завантажити логотип для PDF.");
  };
};
