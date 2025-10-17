import React, { useState } from "react";
import LogoutButton from "./LogoutButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { IconButton, Tooltip } from "@mui/material";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function Layout({ children, step, onLogout }) {
  const { t } = useTranslation();
  const [showInfo, setShowInfo] = useState(false);

  const stepKeys = ["city", "season", "calculation", "results"];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="flex flex-col gap-4 p-4 bg-green-700 text-white shadow">
        {/* Top row: title + buttons */}
        <div className="flex justify-between items-center">
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

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <LogoutButton onLogout={onLogout} />
          </div>
        </div>
      </header>

      {/* Info panel */}
      {showInfo && (
        <div className="bg-yellow-50 border border-yellow-200 text-sm text-gray-800 px-6 py-4">
          <p>{t("layout.infoText")}</p>
        </div>
      )}

      {/* Stepper */}
      <div className="flex justify-around bg-white py-3 shadow text-sm">
        {stepKeys.map((key, i) => (
          <div
            key={key}
            className={`px-3 py-1 rounded-full transition ${
              i + 1 === step
                ? "bg-green-100 text-green-800 font-semibold border border-green-400"
                : "text-gray-500"
            }`}
          >
            {i + 1}. {t(`step.${key}`)}
          </div>
        ))}
      </div>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}