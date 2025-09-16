import React, { useState, useEffect } from "react";
import { regions } from "../regions"; // або ./regions, залежно від місця
import { norm, searchTextFor, placeKey } from "../helpers"; // або додай ці функції сюди, якщо helpers немає

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
    <div>
      <h2>Крок 1: Оберіть ваше місто</h2>

      <label>Населений пункт:</label>
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
        style={{ width: "100%", padding: "12px", fontSize: "16px", marginBottom: "8px" }}
      />

      {inputValue.trim().length >= 2 && !region && (
        <div
          tabIndex={-1}
          onBlur={() => setTimeout(() => setSuggestions([]), 100)}
          style={{
            border: "1px solid #ddd",
            borderRadius: "6px",
            background: "#fff",
            maxHeight: "200px",
            overflowY: "auto",
            position: "relative",
          }}
        >
          {suggestions.length === 0 ? (
            <div style={{ padding: 8, color: "#666" }}>Немає збігів</div>
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
                style={{
                  padding: 8,
                  background: active === i ? "#eef" : "#fff",
                  cursor: "pointer",
                }}
              >
                {c.name}
              </div>
            ))
          )}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!region}
        style={{
          marginTop: "16px",
          padding: "10px 20px",
          fontSize: "16px",
          fontWeight: "bold",
          borderRadius: "8px",
          background: region ? "#2d6cdf" : "#ccc",
          color: "#fff",
          cursor: region ? "pointer" : "not-allowed",
        }}
      >
        Продовжити
      </button>
    </div>
  );
}
