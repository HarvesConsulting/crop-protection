import React, { useEffect, useState } from "react";
import "./SplashScreen.css";

function SplashScreen({ 
  ready = false, 
  minDuration = 1500, 
  onFinish,
  logo = "🌱",
  title = "Crop Protection",
  subtitle = "завантаження застосунку…"
}) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // 🚫 Блокуємо прокрутку під час splash screen
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // ⏳ Ховаємо splash після готовності + мінімальний час
  useEffect(() => {
    let timer;
    
    if (ready) {
      timer = setTimeout(() => {
        setFadeOut(true);
        // Даємо час для анімації зникнення
        const hideTimer = setTimeout(() => {
          setVisible(false);
          if (typeof onFinish === "function") {
            onFinish();
          }
        }, 500);
        
        return () => clearTimeout(hideTimer);
      }, minDuration);
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [ready, minDuration, onFinish]);

  // Додаємо клас для плавного переходу при завантаженні
  useEffect(() => {
    document.body.classList.add('splash-active');
    
    return () => {
      document.body.classList.remove('splash-active');
    };
  }, []);

  if (!visible) return null;

  return (
    <div 
      className={`splash-wrapper ${fadeOut ? 'fade-out' : ''}`} 
      role="status" 
      aria-live="polite" 
      aria-busy={!ready}
      aria-label="Завантаження додатку"
    >
      <div className="splash-content">
        <div className="splash-logo animate-logo">
          <span className="logo-icon" aria-hidden="true">{logo}</span>
          <span className="logo-text">{title}</span>
        </div>
        
        <div className="splash-subtitle">{subtitle}</div>
        
        <div className="splash-loader" aria-hidden="true">
          <div 
            className="loader-bar" 
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuetext="Завантаження"
          ></div>
        </div>
        
        {/* Декоративні елементи фону */}
        <div className="splash-background-elements">
          <div className="bg-circle circle-1"></div>
          <div className="bg-circle circle-2"></div>
          <div className="bg-circle circle-3"></div>
          <div className="leaf leaf-1" aria-hidden="true">🍃</div>
          <div className="leaf leaf-2" aria-hidden="true">🌿</div>
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;