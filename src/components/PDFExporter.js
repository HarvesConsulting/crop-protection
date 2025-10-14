import html2pdf from "html2pdf.js";
import React from "react";

export default function PDFExporter({ data }) {
  const exportToPDF = () => {
    const element = document.getElementById("pdf-content");

    if (!element) {
      console.error("❌ Елемент #pdf-content не знайдено");
      return;
    }

    console.log("📦 PDFExporter data:", data);
    console.log("🧾 Знайдено елемент:", element);
    console.log("🔍 Його HTML:", element.innerHTML);

    const opt = {
      margin: 0.5,
      filename: "Інтегрована_система_захисту.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    setTimeout(() => {
      html2pdf().set(opt).from(element).save();
    }, 500); // 👈 Додана затримка, щоб DOM точно встиг згенеруватись
  };

  return (
    <button onClick={exportToPDF} className="toggle-button">
      📄 Зберегти як PDF
    </button>
  );
}

