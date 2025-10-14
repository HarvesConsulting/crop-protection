import React from "react";
import html2pdf from "html2pdf.js";

export default function PDFExporter({ data }) {
  const handleExportPDF = () => {
    const element = document.getElementById("pdf-content");

    if (!element) {
      console.error("❌ Елемент #pdf-content не знайдено!");
      return;
    }

    console.log("✅ Елемент знайдено, вміст:", element.innerHTML);

    const opt = {
      margin: 0.5,
      filename: "Інтегрована_система_захисту.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    // Трохи затримки — щоб DOM точно оновився
    setTimeout(() => {
      html2pdf().set(opt).from(element).save();
    }, 300);
  };

  return (
    <button onClick={handleExportPDF} className="toggle-button">
      📄 Експорт у PDF
    </button>
  );
}
