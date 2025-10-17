import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import './i18n'; // важливо: підключаємо i18n перед рендером App
import App from "./App";

// Створюємо корінь React
const root = createRoot(document.getElementById("root"));

// Рендеримо застосунок
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 🟢 Прибираємо splash-екран після завантаження React
window.addEventListener("load", () => {
  const splash = document.getElementById("initial-splash");
  if (splash) {
    splash.style.transition = "opacity 0.8s ease";
    splash.style.opacity = "0";

    // Після анімації зникнення — повністю видаляємо splash
    setTimeout(() => splash.remove(), 800);
  }
});
