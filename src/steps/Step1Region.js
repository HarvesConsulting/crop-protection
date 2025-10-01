import React, { useState, useEffect } from "react";
import { regions } from "../regions";
import { norm, searchTextFor, placeKey } from "../helpers";
import Layout from "../components/Layout";

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
    <Layout>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <h2 className="title">Крок 1: Оберіть ваше місто</h2>
        <span
          className="info-icon"
          onClick={() => setShowInfo(!showInfo)}
          title="Додаткова інформація"
        >
          ℹ️
        </span>
      </div>

      {showInfo && (
        <div className="info-box">
          У цьому кроці ви вибираєте населений пункт, для якого потрібно
          розрахувати захист рослин. Почніть вводити назву (мінімум 2 букви),
          і з’явиться список доступних варіантів.
        </div>
      )}

      <div className="input-group">
        <input
          className="input"
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
          <div className="suggestions">
            {suggestions.length === 0 ? (
              <div className="no-match">Немає збігів</div>
            ) : (
              suggestions.map((c, i) => (
                <div
                  key={`${c.name}-${c.lat}-${c.lon}`}
                  className={`suggestion-item ${active === i ? "active" : ""}`}
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
        className={`btn ${region ? "btn-active" : "btn-disabled"}`}
      >
        Продовжити
      </button>
    </Layout>
  );
}

