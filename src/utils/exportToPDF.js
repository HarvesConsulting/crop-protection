import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// 🧩 Підключаємо шрифти
import "../fonts/Roboto-Regular-normal";
import "../fonts/Roboto-Bold-bold";

export const exportToPDF = (data, logoUrl) => {
  const doc = new jsPDF();

  // 📌 Встановлюємо шрифт за замовчуванням
  doc.setFont("Roboto", "normal");

  // 🖼️ Додаємо логотип
  const img = new Image();
  img.src = logoUrl;

  img.onload = () => {
    doc.addImage(img, "PNG", 10, 10, 40, 15);

    // 🟦 Заголовок
    doc.setFontSize(16);
    doc.setFont("Roboto", "bold");
    doc.text("Інтегрована система захисту рослин", 105, 30, { align: "center" });

    // 📅 Дата
    const today = new Date().toLocaleDateString("uk-UA");
    doc.setFontSize(10);
    doc.setFont("Roboto", "normal");
    doc.text(`Дата формування: ${today}`, 200, 10, { align: "right" });

    // 📊 Формування таблиці
    const tableData = data.map((row) => [
      row["Дата"] || "",
      row["Препарат"] || "",
      row["Хвороби"] || "",
    ]);

    autoTable(doc, {
      startY: 40,
      head: [["Дата", "Препарат(и)", "Хвороби"]],
      body: tableData,
      styles: {
        font: "Roboto",
        fontSize: 10,
        cellPadding: 3,
        valign: "top",
        textColor: [30, 30, 30],
      },
      headStyles: {
        font: "Roboto",
        fontStyle: "bold",
        fontSize: 10,
        fillColor: [41, 128, 185],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    // 🖋️ Підпис внизу
    doc.setFontSize(8);
    doc.setFont("Roboto", "normal");
    doc.text("Підготовлено Harvest Consulting", 10, 285);

    // 💾 Зберігаємо PDF
    doc.save("Інтегрована_система_захисту.pdf");
  };

  // 🛑 Якщо не вдалося завантажити логотип
  img.onerror = () => {
    alert("Не вдалося завантажити логотип для PDF.");
  };
};
