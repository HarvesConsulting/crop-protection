import React from "react";
import { parseISO, differenceInDays } from "date-fns";

// Препарати — словник по хворобах
const diseaseProducts = {
  "Сіра гниль": ["Луна Експірієнс", "Сігнум", "Скала", "Тельдор", "Скор", "Натіво"],
  "Альтернаріоз": ["Луна Експірієнс", "Сігнум", "Скала", "Тельдор", "Скор", "Натіво"],
  "Бактеріоз": ["Медян Екстра", "Казумін", "Серенада"],
};

const rotationProducts = [
  "Зорвек Інкантія", "Ридоміл Голд", "Танос", "Акробат МЦ",
  "Орондіс Ультра", "Ранман ТОП", "Ревус", "Курзат Р", "Інфініто",
];

export default function Step4Results({ result, onRestart }) {
  if (!result) return <p>Дані відсутні</p>;

  const { sprayDates, diagnostics, weeklyPlan, diseaseSummary = [] } = result;

  return (
    <div>
      <h2>Крок 4: Результати</h2>

      <p className="text-sm text-gray-600 mb-4">
        Нижче показано графік із накопиченими DSV, рекомендовані дати обробки, ризики інших хвороб та щотижнева оцінка ризику.
      </p>

      {/* ✅ Внесення */}
      <div style={{ marginBottom: 24 }}>
        <h3>Рекомендовані внесення (фітофтороз)</h3>
        {sprayDates.length > 0 ? (
          <ol>
            {sprayDates.map((d, i) => {
              const cur = parseISO(d.split(".").reverse().join("-"));
              const prev = i > 0 ? parseISO(sprayDates[i - 1].split(".").reverse().join("-")) : null;
              const gap = prev ? differenceInDays(cur, prev) : null;

              return (
                <li key={i} style={{ marginBottom: 4 }}>
                  {d} — {rotationProducts[i % rotationProducts.length]}
                  {gap !== null && (
                    <span style={{ color: "#555" }}> ({gap} діб після попередньої)</span>
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <p>—</p>
        )}
      </div>

      {/* ✅ Додано: Хвороби */}
      {diseaseSummary.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3>Прогноз розвитку інших хвороб</h3>
          {diseaseSummary.map((d, i) => (
            <div key={i} style={{ marginBottom: 20 }}>
              <h4 style={{ marginBottom: 6 }}>{d.name}</h4>

              <p style={{ fontStyle: "italic", marginBottom: 6 }}>
                Ризик виявлено у {d.riskDates.length} днів:
              </p>
              {d.riskDates.length > 0 ? (
                <ul>
                  {d.riskDates.map((date, j) => (
                    <li key={j}>{new Date(date).toLocaleDateString("uk-UA")}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: "green" }}>Ризику не виявлено</p>
              )}

              <p style={{ marginTop: 6 }}>
                <strong>Рекомендовані препарати:</strong> {diseaseProducts[d.name]?.join(", ") || "Немає даних"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Діагностика */}
      <div style={{ marginBottom: 24 }}>
        <h3>Діагностика по днях (фітофтороз)</h3>
        <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Дата</th>
              <th>RH ≥ 90%</th>
              <th>RH ≥ 90% & T 10–28°C</th>
              <th>Tavg (вологі), °C</th>
              <th>DSV</th>
            </tr>
          </thead>
          <tbody>
            {diagnostics.map((d, i) => (
              <tr key={i}>
                <td>{d.date.toLocaleDateString("uk-UA")}</td>
                <td align="center">{d.wetHours}</td>
                <td align="center">{d.condHours ?? 0}</td>
                <td align="center">
                  {Number.isFinite(d.wetTempAvg) ? d.wetTempAvg.toFixed(1) : "—"}
                </td>
                <td align="center">
                  {Math.min(dsvFromWet(d.wetHours, d.wetTempAvg), 4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ✅ Щотижневі підсумки */}
      <div>
        <h3>Щотижневі підсумки</h3>
        <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Тиждень</th>
              <th align="center">DSV</th>
              <th align="center">Опади, мм</th>
              <th align="left">Рекомендація</th>
            </tr>
          </thead>
          <tbody>
            {weeklyPlan.map((w, i) => (
              <tr key={i}>
                <td>{w.startStr} – {w.endStr}</td>
                <td align="center">{w.weeklyDSV}</td>
                <td align="center">{w.rainSum.toFixed(1)}</td>
                <td>{w.rec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🔁 Перезапуск */}
      <div style={{ marginTop: 32 }}>
        <button
          onClick={onRestart}
          style={{
            padding: "12px 20px",
            fontSize: "16px",
            fontWeight: "bold",
            background: "#2d6cdf",
            color: "#fff",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🔄 Почати спочатку
        </button>
      </div>
    </div>
  );
}

// Потрібна ця функція — додай або імпортуй
function dsvFromWet(wetHours, wetTempAvg) {
  if (!Number.isFinite(wetHours) || !Number.isFinite(wetTempAvg)) return 0;
  if (wetHours < 6) return 0;

  const DSV_RULES = [
    { tempMin: 21, tempMax: 27, bands: [{ h: 6, dsv: 2 }, { h: 8, dsv: 3 }, { h: 10, dsv: 4 }] },
    { tempMin: 13, tempMax: 21, bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 2 }, { h: 10, dsv: 3 }, { h: 12, dsv: 4 }] },
    { tempMin: 7, tempMax: 13,  bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 1 }, { h: 10, dsv: 2 }, { h: 12, dsv: 3 }, { h: 14, dsv: 4 }] },
    { tempMin: 27, tempMax: 40, bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 2 }, { h: 10, dsv: 3 }] },
  ];

  for (const rule of DSV_RULES) {
    if (wetTempAvg >= rule.tempMin && wetTempAvg < rule.tempMax) {
      const bands = [...rule.bands].sort((a, b) => b.h - a.h);
      for (const b of bands) {
        if (wetHours >= b.h) return b.dsv;
      }
    }
  }

  return 0;
}
