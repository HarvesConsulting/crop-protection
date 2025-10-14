import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../fonts/Roboto-Regular-normal";
import "../fonts/Roboto-bold";

export const exportToPDF = (data, logoUrl) => {
  const doc = new jsPDF();
  doc.setFont("Roboto-Regular", "normal");

  const img = new Image();
  img.src = logoUrl;

  img.onload = () => {
    doc.addImage(img, "PNG", 10, 10, 40, 15);

    doc.setFontSize(16);
    doc.setFont("Roboto", "bold"); // <- заголовок
    doc.text("Інтегрована система захисту рослин", 105, 30, { align: "center" });

    const today = new Date().toLocaleDateString("uk-UA");
    doc.setFontSize(10);
    doc.setFont("Roboto-Regular", "normal"); // <- звичайний текст
    doc.text(`Дата формування: ${today}`, 200, 10, { align: "right" });

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
        font: "Roboto-Regular", // тут також
        fontSize: 10,
        cellPadding: 3,
        valign: "top",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        font: "Roboto", // для заголовків таблиці
      },
    });

    doc.save("Інтегрована_система_захисту.pdf");
  };

  img.onerror = () => {
    alert("Не вдалося завантажити логотип для PDF.");
  };
};
