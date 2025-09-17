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

function getFilteredTreatments(riskDates, minGapDays = 7) {
  const sorted = [...riskDates].map(d => (d instanceof Date ? d : new Date(d))).sort((a, b) => a - b);
  const selected = [];
  for (let i = 0; i < sorted.length; i++) {
    const d = sorted[i];
    if (
      selected.length === 0 ||
      (d.getTime() - selected[selected.length - 1].getTime()) / (1000 * 60 * 60 * 24) >= minGapDays
    ) {
      selected.push(d);
    }
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
      <div className="overflow-x-auto mb-8">
        <h3 className="text-lg font-semibold mb-2">Рекомендовані внесення (проти фітофторозу)</h3>
        <table className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-lg text-sm text-gray-800">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Дата</th>
              <th className="px-4 py-2 text-left font-semibold">Препарат</th>
              <th className="px-4 py-2 text-left font-semibold">Інтервал</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sprayDates.map((d, i) => {
              const cur = parseISO(d.split(".").reverse().join("-"));
              const prev = i > 0 ? parseISO(sprayDates[i - 1].split(".").reverse().join("-")) : null;
              const gap = prev ? differenceInDays(cur, prev) : null;
              const intervalStr = gap !== null ? `${gap} діб після попередньої` : "—";
              return (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">{d}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{rotationProducts[i % rotationProducts.length]}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{intervalStr}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Інші хвороби */}
      {diseaseSummary && diseaseSummary.map((disease) => {
        const { name, riskDates } = disease;

        const rotation = {
          "Сіра гниль": rotationGrayMold,
          "Альтернаріоз": rotationAlternaria,
          "Бактеріоз": rotationBacteriosis,
        }[name] || [];

        const filtered = getFilteredTreatments(riskDates, 7);
        const treatments = filtered.map((date, i) => {
          const prev = i > 0 ? filtered[i - 1] : null;
          const intervalStr = prev ? `${differenceInDays(date, prev)} діб після попередньої` : "—";
          return { date, intervalStr };
        });

        if (!treatments.length) return null;

        return (
          <div key={name} className="overflow-x-auto mb-8">
            <h3 className="text-lg font-semibold mb-2">Рекомендовані внесення (проти: {name})</h3>
            <table className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-lg text-sm text-gray-800">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Дата</th>
                  <th className="px-4 py-2 text-left font-semibold">Препарат</th>
                  <th className="px-4 py-2 text-left font-semibold">Інтервал</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {treatments.map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">{item.date.toLocaleDateString("uk-UA")}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{rotation[i % rotation.length]}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{item.intervalStr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {blitecastMode && (
        <>
          <div className="overflow-x-auto mb-6">
            <h3 className="text-lg font-semibold mb-2">Діагностика по днях</h3>
            <table className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-lg text-sm text-gray-800">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Дата</th>
                  <th className="px-4 py-2 text-center font-semibold">RH ≥ 90%</th>
                  <th className="px-4 py-2 text-center font-semibold">RH ≥ 90% & T 10–28°C</th>
                  <th className="px-4 py-2 text-center font-semibold">Tavg (вологі), °C</th>
                  <th className="px-4 py-2 text-center font-semibold">DSV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {diagnostics.map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">{d.date.toLocaleDateString("uk-UA")}</td>
                    <td className="px-4 py-2 text-center">{d.wetHours}</td>
                    <td className="px-4 py-2 text-center">{d.condHours ?? 0}</td>
                    <td className="px-4 py-2 text-center">{Number.isFinite(d.wetTempAvg) ? d.wetTempAvg.toFixed(1) : "—"}</td>
                    <td className="px-4 py-2 text-center">{Math.min(dsvFromWet(d.wetHours, d.wetTempAvg), 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto mb-6">
            <h3 className="text-lg font-semibold mb-2">Щотижневі підсумки</h3>
            <table className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-lg text-sm text-gray-800">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Тиждень</th>
                  <th className="px-4 py-2 text-center font-semibold">DSV</th>
                  <th className="px-4 py-2 text-center font-semibold">Опади, мм</th>
                  <th className="px-4 py-2 text-left font-semibold">Рекомендація</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {weeklyPlan.map((w, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">{w.startStr} – {w.endStr}</td>
                    <td className="px-4 py-2 text-center">{w.weeklyDSV}</td>
                    <td className="px-4 py-2 text-center">{w.rainSum.toFixed(1)}</td>
                    <td className="px-4 py-2">{w.rec}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

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
