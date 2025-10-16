import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Створюємо корінь React
const root = createRoot(document.getElementById("root"));

// Рендеримо застосунок
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

