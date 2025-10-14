import html2pdf from "html2pdf.js";
import React from "react";

export default function PDFExporter({ data }) {
  const exportToPDF = () => {
    const element = document.getElementById("pdf-content");

    const opt = {
      margin:       0.5,
      filename:     'Інтегрована_система_захисту.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <button onClick={exportToPDF} className="toggle-button">
      Зберегти як PDF
    </button>
  );
}
