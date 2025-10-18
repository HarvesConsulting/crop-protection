// Step1Region.js — спрощена робоча версія
import React, { useState, useEffect } from "react";
import { regions as allRegions } from "../regions";
import { norm, searchTextFor, placeKey } from "../helpers";
import { Info, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

// 🔁 Фільтрація лише унікальних назв
const regions = allRegions.filter(
  (r, i, arr) => i === arr.findIndex((x) => x.name === r.name)
);

// Список країн (наразі тільки Україна доступна)
const COUNTRIES = [
  { code: "UA", name: "Україна", available: true },
  { code: "PL", name: "Польща", available: false },
  { code: "DE", name: "Німеччина", available: false },
  { code: "FR", name: "Франція", available: false },
  { code: "ES", name: "Іспанія", available: false },
  { code: "IT", name: "Італія", available: false },
];

export default function Step1Region({ region, setRegion, onNext }) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(region?.name || "");
  const [suggestions, setSuggestions] = useState([]);
  const [active, setActive] = useState(-1);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Україна за замовчуванням
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  // Використовуємо всі регіони для України, для інших країн - пустий масив
  const availableRegions = selectedCountry.code === "UA" ? regions : [];

  useEffect(() => {
    if (!selectedCountry.available) {
      setSuggestions([]);
      setActive(-1);
      return;
    }

    const q = norm(inputValue.trim());
    if (q.length < 2) {
      setSuggestions([]);
      setActive(-1);
      return;
    }
    
    const exact = availableRegions.find((r) => searchTextFor(r) === q);
    if (exact) {
      setSuggestions([]);
      setActive(-1);
      return;
    }
    
    const seen = new Set();
    const res = [];
    for (const r of availableRegions) {
      const s = searchTextFor(r);
      if (s.includes(q)) {
        const key = placeKey(r);
        if (!seen.has(key)) {
          seen.add(key);
          res.push(r);
        }
      }
    }
    setSuggestions(res.slice(0, 30));
    setActive(res.length ? 0 : -1);
  }, [inputValue, selectedCountry, availableRegions]);

  const handleCountrySelect = (country) => {
    if (country.available) {
      setSelectedCountry(country);
      setShowCountryDropdown(false);
      setInputValue("");
      setRegion(null);
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    const v = e.target.value;
    setInputValue(v);
    
    if (selectedCountry.available) {
      const q = norm(v.trim());
      const exact = availableRegions.find((r) => searchTextFor(r) === q);
      setRegion(exact || null);
    }
  };

  const handleSuggestionClick = (city) => {
    setInputValue(city.name);
    setRegion(city);
    setSuggestions([]);
    setActive(-1);
  };

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

        {/* Вибір країни */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("step1_country")}
            </label>
            <button
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              className="w-full px-4 py-2 text-[16px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition bg-white flex justify-between items-center"
            >
              <span>{selectedCountry.name}</span>
              <ChevronDown size={16} className={`transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showCountryDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    onClick={() => handleCountrySelect(country)}
                    disabled={!country.available}
                    className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition ${
                      country.code === selectedCountry.code ? 'bg-blue-100 font-medium' : ''
                    } ${
                      !country.available ? 'text-gray-400 cursor-not-allowed opacity-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span>{country.name}</span>
                      {!country.available && (
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">Скоро</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Поле вводу міста */}
        <div className="flex justify-center">
          <div className="w-full max-w-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("step1_city")}
            </label>
            <input
              className={`w-full px-4 py-2 text-[16px] border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 transition ${
                !selectedCountry.available ? 'bg-gray-100 border-gray-300 text-gray-500' : 'border-gray-300'
              }`}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={selectedCountry.available ? t("placeholder_city") : "Оберіть доступну країну"}
              disabled={!selectedCountry.available}
            />
          </div>
        </div>

        {/* Список підказок */}
        {inputValue.trim().length >= 2 && !region && selectedCountry.available && (
          <div className="max-w-sm mx-auto mt-2 border border-gray-200 rounded-md bg-white max-h-60 overflow-y-auto shadow-md">
            {suggestions.length === 0 ? (
              <div className="p-2 text-gray-500">{t("no_matches")}</div>
            ) : (
              suggestions.map((city, index) => (
                <div
                  key={`${city.name}-${city.lat}-${city.lon}`}
                  className={`p-2 cursor-pointer hover:bg-blue-100 ${
                    active === index ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleSuggestionClick(city)}
                >
                  {city.name}
                </div>
              ))
            )}
          </div>
        )}

        {/* Кнопка "Продовжити" */}
        <div className="flex justify-center">
          <button
            onClick={onNext}
            disabled={!region || !selectedCountry.available}
            className={`px-6 py-2 rounded-md text-white font-medium transition ${
              region && selectedCountry.available
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