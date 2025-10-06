import React, { useEffect, useState } from "react";
import "./SplashScreen.css";
import bgImage from "../assets/images/bg0.jpg"; // ✅ правильний файл

function SplashScreen(props) {
  const { ready = false, minDuration = 1200, onFinish } = props;
  const [visible, setVisible] = useState(true);

  // Блокуємо прокрутку під час splash screen
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Ховаємо splash після того, як додаток готовий і пройшов мінімальний час
  useEffect(() => {
    let timer;
    if (ready) {
      timer = setTimeout(() => {
        setVisible(false);
        if (typeof onFinish === "function") {
          onFinish();
        }
      }, minDuration);
    }
    return () => clearTimeout(timer);
  }, [ready, minDuration, onFinish]);

  if (!visible) return null;

  return (
    <div
      className="splash-wrapper"
      style={{
        backgroundImage: `url(${bgImage})`, // ✅ ось тут фон
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="splash-overlay" />
      <div className="splash-content">
        <div className="splash-logo">🌾 AgroSense</div>
        <div className="splash-subtitle">завантаження застосунку…</div>
        <div className="splash-loader">
          <div className="loader-bar"></div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
