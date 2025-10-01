import React, { useState, useEffect } from "react";
import { regions } from "../regions";
import { norm, searchTextFor, placeKey } from "../helpers";

export default function Step1Region({ region, setRegion, onNext }) {
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
    <>
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-semibold">Крок 1: Оберіть ваше місто</h2>
        <button
          className="info-icon"
          onClick={() => setShowInfo(!showInfo)}
          title="Додаткова інформація"
        >
          ℹ️
        </button>
      </div>

      {showInfo && (
        <div className="info-box">
          Почніть вводити назву населеного пункту (мін. 2 букви), і з’явиться список варіантів.
        </div>
      )}

      <div className="input-group mt-4">
        <input
          className="input w-full p-2 border rounded"
          type="text"
          value={inputValue}
          onChange={(e) => {
            const v = e.target.value;
            setInputValue(v);
            const q = norm(v.trim());
            const exact = regions.find((r) => searchTextFor(r) === q);
            setRegion(exact || null);
          }}
          placeholder="Почніть вводити (мін. 2 букви)"
        />

        {inputValue.trim().length >= 2 && !region && (
          <div className="suggestions mt-2 border rounded bg-white">
            {suggestions.length === 0 ? (
              <div className="p-2 text-gray-500">Немає збігів</div>
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
      </div>

      <button
        onClick={onNext}
        disabled={!region}
        className={`mt-4 px-4 py-2 rounded text-white ${
          region ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Продовжити
      </button>
    </>
  );
}
