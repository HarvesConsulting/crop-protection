import React, { useEffect, useState } from "react";
import "./SplashScreen.css";

function SplashScreen({ ready = false, minDuration = 1500, onFinish }) {
  const [visible, setVisible] = useState(true);

  // 🚫 Блокуємо прокрутку під час splash screen
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // ⏳ Ховаємо splash після готовності + мінімальний час
  useEffect(() => {
    let timer;
    if (ready) {
      timer = setTimeout(() => {
        setVisible(false);
        if (typeof onFinish === "function") onFinish();
      }, minDuration);
    }
    return () => clearTimeout(timer);
  }, [ready, minDuration, onFinish]);

  if (!visible) return null;

  return (
    <div className="splash-wrapper" role="status" aria-live="polite" aria-busy="true">
      <div className="splash-content">
        <div className="splash-logo animate-logo">🌾 Crop Protection</div>
        <div className="splash-subtitle">завантаження застосунку…</div>
        <div className="splash-loader">
          <div className="loader-bar"></div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
