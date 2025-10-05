import React, { useState, useEffect } from "react";
import "./ActionMenu.css";

export default function ActionMenu({
  isMobile,
  onRestart,
  onShowWeather,
  onToggleIntegrated,
  showIntegrated,
}) {
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowMenu(false); // скидувати при переході на десктоп
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="menu-wrapper">
      <button
        className="menu-toggle"
        onClick={(e) => {
          if (isMobile) {
            e.stopPropagation();
            setShowMenu((prev) => !prev);
          }
        }}
      >
        ☰ Меню дій
      </button>

      {/* Меню (вище за backdrop) */}
      {isMobile && showMenu && (
        <div
          className="menu-dropdown visible"
          onClick={(e) => e.stopPropagation()} // щоб не закривалось при кліку
        >
          <button className="menu-item" onClick={onRestart}>
            Почати спочатку
          </button>
          <button
            className="menu-item"
            onClick={() =>
              alert(
                "🟢 Зелений — помірний ризик\n🟡 Жовтий — середній\n🔴 Червоний — високий"
              )
            }
          >
            Інформація про кольори карток
          </button>
          <button className="menu-item" onClick={onShowWeather}>
            Погодні умови за період
          </button>
          <button className="menu-item" onClick={onToggleIntegrated}>
            {showIntegrated
              ? "Сховати інтегровану систему"
              : "Сформувати інтегровану систему"}
          </button>
        </div>
      )}

      {/* Бекдроп (нижче за меню) */}
      {isMobile && showMenu && (
        <div className="menu-backdrop" onClick={() => setShowMenu(false)} />
      )}

      {/* На десктопі — меню з hover */}
      {!isMobile && (
        <div className="menu-dropdown desktop-menu">
          <button className="menu-item" onClick={onRestart}>
            Почати спочатку
          </button>
          <button
            className="menu-item"
            onClick={() =>
              alert(
                "🟢 Зелений — помірний ризик\n🟡 Жовтий — середній\n🔴 Червоний — високий"
              )
            }
          >
            Інформація про кольори карток
          </button>
          <button className="menu-item" onClick={onShowWeather}>
            Погодні умови за період
          </button>
          <button className="menu-item" onClick={onToggleIntegrated}>
            {showIntegrated
              ? "Сховати інтегровану систему"
              : "Сформувати інтегровану систему"}
          </button>
        </div>
      )}
    </div>
  );
}
