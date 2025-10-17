// Step1Region.js — сучасний вигляд з i18next, info-іконкою та покращенням UX
import React, { useState, useEffect } from "react";
import { regions as allRegions } from "../regions";
import { norm, searchTextFor, placeKey } from "../helpers";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

// 🔁 Фільтрація лише унікальних назв
const regions = allRegions.filter(
  (r, i, arr) => i === arr.findIndex((x) => x.name === r.name)
);
export default function Step1Region({ region, setRegion, onNext }) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(region?.name || "");
  const [suggestions, setSuggestions] = useState([]);
  const [active, setActive] = useState(-1);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const q = norm(inputValue.trim());
    if (q.length < 2) {
      setSuggestions([]);
      setActive(-1);
      return;
    }
    const exact = regions.find((r) => searchTextFor(r) === q);
    if (exact) {
      setSuggestions([]);
      setActive(-1);
      return;
    }
    const seen = new Set();
    const res = [];
    for (const r of regions) {
      const s = searchTextFor(r);
      if (s.startsWith(q)) {
        const key = placeKey(r);
        if (!seen.has(key)) {
          seen.add(key);
          res.push(r);
        }
      }
    }
    setSuggestions(res.slice(0, 30));
    setActive(res.length ? 0 : -1);
  }, [inputValue]);

  return (
    <main className="flex justify-center items-start min-h-[70vh] px-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6 space-y-6">
        
        {/* Заголовок з кнопкою info */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">{t("step1_title")}</h2>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="text-blue-600 hover:text-blue-800 transition"
            title={t("info")}
          >
            <Info size={24} />
          </button>
        </div>

        {/* Інфо-бокс */}
        {showInfo && (
          <div className="bg-blue-50 border border-blue-200 text-sm text-gray-700 p-4 rounded-md shadow-sm">
            {t("step1_description")}
          </div>
        )}

        {/* Поле вводу */}
        <div className="flex justify-center">
          <input
            className="w-full max-w-sm px-4 py-2 text-[16px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            type="text"
            value={inputValue}
            onChange={(e) => {
              const v = e.target.value;
              setInputValue(v);
              const q = norm(v.trim());
              const exact = regions.find((r) => searchTextFor(r) === q);
              setRegion(exact || null);
            }}
            placeholder={t("placeholder_city")}
          />
        </div>

        {/* Список підказок */}
        {inputValue.trim().length >= 2 && !region && (
          <div className="max-w-sm mx-auto mt-2 border border-gray-200 rounded-md bg-white max-h-60 overflow-y-auto shadow-md">
            {suggestions.length === 0 ? (
              <div className="p-2 text-gray-500">{t("no_matches")}</div>
            ) : (
              suggestions.map((c, i) => (
                <div
                  key={`${c.name}-${c.lat}-${c.lon}`}
                  className={`p-2 cursor-pointer hover:bg-blue-100 ${active === i ? "bg-blue-50" : ""}`}
                  onClick={() => {
                    setInputValue(c.name);
                    setRegion(c);
                    setSuggestions([]);
                    setActive(-1);
                  }}
                >
                  {c.name}
                </div>
              ))
            )}
          </div>
        )}

        {/* Кнопка "Продовжити" */}
        <div className="flex justify-center">
          <button
            onClick={onNext}
            disabled={!region}
            className={`px-6 py-2 rounded-md text-white font-medium transition ${
              region
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {t("button_continue")}
          </button>
        </div>
      </div>
    </main>
  );
}
