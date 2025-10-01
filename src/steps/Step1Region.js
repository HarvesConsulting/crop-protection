// src/steps/Step1Region.js
import React, { useState, useEffect } from "react";
import { regions } from "../regions";
import { norm, searchTextFor, placeKey } from "../helpers";
import Layout from "../components/Layout";

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
    <Layout currentStep={1}>
      <h2 className="title">Крок 1: Оберіть ваше місто</h2>
      <p className="subtitle">
        Оберіть населений пункт, для якого потрібно розрахувати захист.
      </p>

      <div className="input-group">
        <input
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
          className="input"
        />

        {inputValue.trim().length >= 2 && !region && (
          <div
            tabIndex={-1}
            onBlur={() => setTimeout(() => setSuggestions([]), 100)}
            className="suggestions"
          >
            {suggestions.length === 0 ? (
              <div className="no-match">Немає збігів</div>
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
                  className={`suggestion-item ${
                    active === i ? "active" : ""
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
        className={`btn ${region ? "btn-active" : "btn-disabled"}`}
      >
        Продовжити
      </button>
    </Layout>
  );
}

