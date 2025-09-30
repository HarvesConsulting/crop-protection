import React, { useState, useEffect } from "react";
import { regions } from "../regions";
import { norm, searchTextFor, placeKey } from "../helpers";
import Layout from "../components/Layout";
import { MapPinIcon } from "@heroicons/react/24/outline";

export default function Step1Region({ region, setRegion, onNext }) {
  const [inputValue, setInputValue] = useState(region?.name || "");
  const [suggestions, setSuggestions] = useState([]);
  const [active, setActive] = useState(-1);

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
    <Layout>
      <div className="max-w-md mx-auto mt-10 bg-white rounded-2xl shadow-md p-6">
        <div className="mb-2">
          <span className="inline-block bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
            Крок 1 з 4
          </span>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">Оберіть ваше місто</h2>
        <p className="text-sm text-gray-600 mb-4">
          Оберіть населений пункт, для якого потрібно розрахувати захист.
        </p>

        <div className="relative mb-4">
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-700">
            <span className="pl-3 text-gray-500">
              <MapPinIcon className="h-5 w-5" />
            </span>
            <input
              type="text"
              placeholder="Наприклад: Львів"
              value={inputValue}
              onChange={(e) => {
                const v = e.target.value;
                setInputValue(v);
                const q = norm(v.trim());
                const exact = regions.find((r) => searchTextFor(r) === q);
                setRegion(exact || null);
              }}
              className="w-full p-2 outline-none"
            />
          </div>

          {inputValue.trim().length >= 2 && !region && (
            <div
              tabIndex={-1}
              onBlur={() => setTimeout(() => setSuggestions([]), 100)}
              className="absolute z-10 w-full border border-gray-200 rounded-lg bg-white mt-1 shadow-lg max-h-52 overflow-y-auto"
            >
              {suggestions.length === 0 ? (
                <div className="p-2 text-gray-500 text-sm">Немає збігів</div>
              ) : (
                suggestions.map((c, i) => (
                  <div
                    key={`${c.name}-${c.lat}-${c.lon}`}
                    onClick={() => {
                      setInputValue(c.name);
                      setRegion(c);
                      setSuggestions([]);
                      setActive(-1);
                    }}
                    className={`px-4 py-2 text-sm cursor-pointer ${
                      active === i ? "bg-green-100" : "hover:bg-gray-100"
                    }`}
                  >
                    {c.name}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={!region}
          className={`w-full py-2 px-4 text-white font-semibold rounded-lg transition ${
            region
              ? "bg-green-700 hover:bg-green-800"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Продовжити
        </button>
      </div>
    </Layout>
  );
}
