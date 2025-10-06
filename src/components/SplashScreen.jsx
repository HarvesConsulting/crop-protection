import React, { useEffect, useState } from "react";
import "./SplashScreen.css";
import bgImage from "../assets/images/bg0.jpg";

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

    return () => {
      clearTimeout(timer);
    };
  }, [ready, minDuration, onFinish]);

  // Якщо вже не видно — нічого не рендеримо
  if (!visible) {
    return null;
  }

  return (
    <div
      className="splash-wrapper"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
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
