import React, { useState } from "react";
import LogoutButton from "./LogoutButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { IconButton, Tooltip } from "@mui/material";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function Layout({ children, step, onLogout }) {
  const { t } = useTranslation();
  const [showInfo, setShowInfo] = useState(false);

  const steps = [
    t("step.city"),
    t("step.season"),
    t("step.calculation"),
    t("step.results"),
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="flex flex-col gap-4 p-4 bg-green-700 text-white shadow">
        {/* Верхній ряд: назва додатку + кнопки */}
        <div className="flex justify-between items-center">
          {/* App title & info icon */}
          <div className="flex items-center gap-2 text-lg font-semibold">
            🍅 {t("app.title")}
            <Tooltip title={t("layout.infoTooltip")}>
              <IconButton
                onClick={() => setShowInfo(!showInfo)}
                size="small"
                sx={{ color: "white" }}
              >
                <InfoOutlinedIcon />
              </IconButton>
            </Tooltip>
          </div>

          {/* Language switcher + Logout */}
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-4">
            <LogoutButton onLogout={onLogout} />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Info box */}
      {showInfo && (
        <div className="bg-yellow-50 border border-yellow-200 text-sm text-gray-800 px-6 py-4">
          <p>{t("layout.infoText")}</p>
        </div>
      )}

      {/* Stepper */}
      <div className="flex justify-around bg-white py-3 shadow text-sm">
        {steps.map((label, i) => (
          <div
            key={i}
            className={`px-3 py-1 rounded-full transition ${
              i + 1 === step
                ? "bg-green-100 text-green-800 font-semibold border border-green-400"
                : "text-gray-500"
            }`}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
