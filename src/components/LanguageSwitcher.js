// src/components/LanguageSwitcher.js
import React from "react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "uk", label: "UA" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="flex gap-2 items-center text-sm absolute top-4 right-4 z-50">
      {languages.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className={`px-2 py-1 rounded border ${
            i18n.language === code
              ? "bg-green-700 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
