import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import "./ActionMenu.css";

export default function ActionMenu({
  isMobile,
  onRestart,
  onShowWeather,
  onToggleIntegrated,
  showIntegrated,
  onShowSummary,
}) {
  const { t } = useTranslation();
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
      clearTimeout(closeTimeoutRef.current);
      setShowMenu(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      closeTimeoutRef.current = setTimeout(() => {
        setShowMenu(false);
      }, 200);
    }
  };

  const handleMenuAction = (action) => {
    if (isMobile) {
      setShowMenu(false);
    }
    action();
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
        ☰ {t("actionMenu.menuTitle")}
      </button>

      {/* === МОБІЛЬНЕ МЕНЮ === */}
      {isMobile && showMenu && (
        <>
          <div className="menu-backdrop" onClick={() => setShowMenu(false)} />
          <div
            className="menu-dropdown visible"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="menu-item"
              onClick={() => handleMenuAction(onRestart)}
            >
              {t("actionMenu.restart")}
            </button>
            <button
              className="menu-item"
              onClick={() => handleMenuAction(onShowWeather)}
            >
              {t("actionMenu.weatherConditions")}
            </button>
            <button
              className="menu-item"
              onClick={() => handleMenuAction(onShowSummary)}
            >
              {t("actionMenu.spraySchedule")}
            </button>
            <button
              className="menu-item"
              onClick={() => handleMenuAction(onToggleIntegrated)}
            >
              {showIntegrated
                ? t("actionMenu.hideIntegrated")
                : t("actionMenu.showIntegrated")}
            </button>
          </div>
        </>
      )}

      {/* === ДЕСКТОПНЕ МЕНЮ === */}
      {!isMobile && (
        <div className={`menu-dropdown ${showMenu ? "visible" : ""}`}>
          <button
            className="menu-item"
            onClick={() => handleMenuAction(onRestart)}
          >
            {t("actionMenu.restart")}
          </button>
          <button
            className="menu-item"
            onClick={() => handleMenuAction(onShowWeather)}
          >
            {t("actionMenu.weatherConditions")}
          </button>
          <button
            className="menu-item"
            onClick={() => handleMenuAction(onShowSummary)}
          >
            {t("actionMenu.spraySchedule")}
          </button>
          <button
            className="menu-item"
            onClick={() => handleMenuAction(onToggleIntegrated)}
          >
            {showIntegrated
              ? t("actionMenu.hideIntegrated")
              : t("actionMenu.showIntegrated")}
          </button>
        </div>
      )}
    </div>
  );
}