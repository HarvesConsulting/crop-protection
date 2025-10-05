import React, { useState, useEffect, useRef } from "react";
import "./ActionMenu.css";

export default function ActionMenu({
  isMobile,
  onRestart,
  onShowWeather,
  onToggleIntegrated,
  showIntegrated,
}) {
  const [showMenu, setShowMenu] = useState(false);
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowMenu(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseEnter = () => {
    if (!isMobile) {
      clearTimeout(closeTimeoutRef.current); // не дозволяємо закриття
      setShowMenu(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      // затримка перед закриттям меню
      closeTimeoutRef.current = setTimeout(() => {
        setShowMenu(false);
      }, 200); // ← можна змінити тривалість (мс)
    }
  };

  return (
    <div
      className="menu-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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

      {isMobile && showMenu && (
        <>
          <div className="menu-backdrop" onClick={() => setShowMenu(false)} />
          <div
            className="menu-dropdown visible"
            onClick={(e) => e.stopPropagation()}
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
        </>
      )}

      {!isMobile && (
        <div className={`menu-dropdown ${showMenu ? "visible" : ""}`}>
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
