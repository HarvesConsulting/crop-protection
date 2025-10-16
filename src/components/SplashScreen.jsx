import React, { useEffect, useState } from "react";
import "./SplashScreen.css";

function SplashScreen({ ready = false, minDuration = 1500, onFinish }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // 🚫 Блокуємо прокрутку під час splash screen
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.body.classList.add('splash-active');
    
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove('splash-active');
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
      aria-label="Завантаження додатку"
    >
      {/* Декоративні елементи - НИЖЧИЙ пріоритет */}
      <div className="splash-background-elements">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
        <div className="leaf leaf-1" aria-hidden="true">🍃</div>
        <div className="leaf leaf-2" aria-hidden="true">🌿</div>
      </div>

      {/* Основний контент - ВИЩИЙ пріоритет */}
      <div className="splash-content">
        <div className="splash-logo">
          <span className="logo-icon" aria-hidden="true">🍅</span>
          <span className="logo-text">Crop Protection</span>
        </div>
        
        <div className="splash-subtitle">завантаження застосунку…</div>
        
        <div className="splash-loader" aria-hidden="true">
          <div className="loader-bar" role="progressbar"></div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;