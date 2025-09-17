import React, { useState } from "react";
import { parseISO, differenceInDays } from "date-fns";

// Ротації препаратів
const rotationProducts = [
  "Зорвек Інкантія", "Ридоміл Голд", "Танос", "Акробат МЦ",
  "Орондіс Ультра", "Ранман ТОП", "Ревус", "Курзат Р", "Інфініто",
];

const rotationGrayMold = [
  "Луна Експірієнс", "Сігнум", "Скала", "Тельдор", "Скор", "Натіво",
];

const rotationAlternaria = rotationGrayMold;

const rotationBacteriosis = [
  "Медян Екстра", "Казумін", "Серенада",
];

// Обчислення інтервалу для обробок по інших хворобах
function getAdvancedTreatments(riskDates, minGap = 7, shortGap = 5) {
  const sorted = [...riskDates].map(d => new Date(d)).sort((a, b) => a - b);
  const selected = [];
  let i = 0;

  while (i < sorted.length) {
    const current = sorted[i];
    if (!selected.length || differenceInDays(current, selected[selected.length - 1].date) >= selected[selected.length - 1].gap) {
      // Перевірка 4+ днів підряд
      let streak = 1;
      let j = i + 1;
      while (j < sorted.length && differenceInDays(sorted[j], sorted[j - 1]) === 1) {
        streak++;
        j++;
      }
      const gap = streak >= 4 ? shortGap : minGap;
      selected.push({ date: current, gap });
    }
    i++;
  }

  return selected;
}

export default function Step4Results({ result, onRestart }) {
  const [blitecastMode, setBlitecastMode] = useState(false);

  if (!result) return <p>Дані відсутні</p>;

  const { sprayDates, diagnostics, weeklyPlan, diseaseSummary } = result;

  return (
    <div>
      <h2>Крок 4: Результати</h2>
      <p className="text-sm text-gray-600 mb-4">
        Нижче показано рекомендовані дати обробки. Ви можете увімкнути розширений режим BLITECAST для діагностики.
      </p>

      {/* Кнопка BLITECAST */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setBlitecastMode(!blitecastMode)}
          style={{
            padding: "8px 16px",
            fontSize: "14px",
            borderRadius: "6px",
            border: "1px solid #2d6cdf",
            background: blitecastMode ? "#2d6cdf" : "#fff",
            color: blitecastMode ? "#fff" : "#2d6cdf",
            cursor: "pointer",
          }}
        >
          {blitecastMode ? "🔽 Сховати BLITECAST" : "🔬 Показати BLITECAST"}
        </button>
      </div>

      {/* Обробки проти фітофторозу */}
      <div style={{ marginBottom: 24 }}>
        <h3>Рекомендовані внесення (проти фітофторозу)</h3>
        {sprayDates.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Дата</th>
                <th>Препарат</th>
                <th>Інтервал</th>
              </tr>
            </thead>
            <tbody>
              {sprayDates.map((d, i) => {
                const cur = parseISO(d.split(".").reverse().join("-"));
                const prev = i > 0 ? parseISO(sprayDates[i - 1].split(".").reverse().join("-")) : null;
                const gap = prev ? differenceInDays(cur, prev) : null;
                return (
                  <tr key={i}>
                    <td>{d}</td>
                    <td>{rotationProducts[i % rotationProducts.length]}</td>
                    <td>{gap !== null ? `${gap} діб після попередньої` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>—</p>
        )}
      </div>

      {/* Обробки по іншим хворобам */}
      {diseaseSummary && diseaseSummary.map((disease) => {
        const { name, riskDates } = disease;
        const rotation = {
          "Сіра гниль": rotationGrayMold,
          "Альтернаріоз": rotationAlternaria,
          "Бактеріоз": rotationBacteriosis,
        }[name] || [];

        const treatments = getAdvancedTreatments(riskDates);
        if (!treatments.length) return null;

        return (
          <div key={name} style={{ marginBottom: 24 }}>
            <h3>Рекомендовані внесення (проти: {name})</h3>
            <table>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Препарат</th>
                  <th>Інтервал</th>
                </tr>
              </thead>
              <tbody>
                {treatments.map((item, i) => (
                  <tr key={i}>
                    <td>{item.date.toLocaleDateString("uk-UA")}</td>
                    <td>{rotation[i % rotation.length]}</td>
                    <td>
  {i === 0
    ? "—"
    : `${differenceInDays(item.date, treatments[i - 1].date)} діб після попередньої`}
</td>

                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {/* BLITECAST */}
      {blitecastMode && (
        <>
          <div style={{ marginBottom: 24 }}>
            <h3>Діагностика по днях</h3>
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
                    <td align="center">{Number.isFinite(d.wetTempAvg) ? d.wetTempAvg.toFixed(1) : "—"}</td>
                    <td align="center">{Math.min(dsvFromWet(d.wetHours, d.wetTempAvg), 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: 24 }}>
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
        </>
      )}

      {/* Перезапуск */}
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

// Функція DSV
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
