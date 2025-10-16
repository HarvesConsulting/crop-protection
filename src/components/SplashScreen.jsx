import React, { useEffect, useState } from "react";
import "./SplashScreen.css";

function SplashScreen({ 
  ready = false, 
  minDuration = 1500, 
  onFinish,
  logo = "🍅",
  title = "Crop Protection",
  subtitle = "завантаження застосунку…"
}) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

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
        setFadeOut(true);
        // Даємо час для анімації зникнення
        setTimeout(() => {
          setVisible(false);
          if (typeof onFinish === "function") onFinish();
        }, 500);
      }, minDuration);
    }
    return () => clearTimeout(timer);
  }, [ready, minDuration, onFinish]);

  if (!visible) return null;

  return (
    <div 
      className={`splash-wrapper ${fadeOut ? 'fade-out' : ''}`} 
      role="status" 
      aria-live="polite" 
      aria-busy="true"
    >
      <div className="splash-content">
        <div className="splash-logo animate-logo">
          <span className="logo-icon">{logo}</span>
          <span className="logo-text">{title}</span>
        </div>
        <div className="splash-subtitle">{subtitle}</div>
        <div className="splash-loader">
          <div className="loader-bar"></div>
        </div>
        
        {/* Додатковий декоративний елемент */}
        <div className="splash-background-elements">
          <div className="bg-circle circle-1"></div>
          <div className="bg-circle circle-2"></div>
          <div className="bg-circle circle-3"></div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;