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
    if (
      !selected.length ||
      differenceInDays(current, selected[selected.length - 1].date) >= selected[selected.length - 1].gap
    ) {
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

function MobileCard({ title, entries }) {
  return (
    <div className="md:hidden flex flex-col gap-4 mb-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {entries.map((item, i) => (
        <div key={i} className="bg-white border rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-600 mb-1">#{i + 1}</p>
          {Object.entries(item).map(([key, value]) => (
            <p key={key} className="text-sm">
              <span className="font-semibold">{key}: </span>{value}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function Step4Results({ result, onRestart }) {
  const [blitecastMode, setBlitecastMode] = useState(false);

  if (!result) return <p>Дані відсутні</p>;

  const { sprayDates, diagnostics, weeklyPlan, diseaseSummary } = result;

  const sprayData = sprayDates.map((d, i) => {
    const cur = parseISO(d.split(".").reverse().join("-"));
    const prev = i > 0 ? parseISO(sprayDates[i - 1].split(".").reverse().join("-")) : null;
    const gap = prev ? `${differenceInDays(cur, prev)} діб після попередньої` : "—";
    return {
      Дата: d,
      Препарат: rotationProducts[i % rotationProducts.length],
      Інтервал: gap,
    };
  });

  const diseaseCards = diseaseSummary?.flatMap(({ name, riskDates }) => {
    const rotation = {
      "Сіра гниль": rotationGrayMold,
      "Альтернаріоз": rotationAlternaria,
      "Бактеріоз": rotationBacteriosis,
    }[name] || [];
    const treatments = getAdvancedTreatments(riskDates);
    return treatments.map((item, i) => ({
      Хвороба: name,
      Дата: item.date.toLocaleDateString("uk-UA"),
      Препарат: rotation[i % rotation.length],
      Інтервал:
        i === 0
          ? "—"
          : `${differenceInDays(item.date, treatments[i - 1].date)} діб після попередньої`,
    }));
  });

  const diagnosticsData = diagnostics.map((d) => ({
    Дата: d.date.toLocaleDateString("uk-UA"),
    "RH ≥ 90%": d.wetHours,
    "RH ≥ 90% & T 10–28°C": d.condHours ?? 0,
    "Tavg (вологі), °C": Number.isFinite(d.wetTempAvg)
      ? d.wetTempAvg.toFixed(1)
      : "—",
    DSV: Math.min(dsvFromWet(d.wetHours, d.wetTempAvg), 4),
  }));

  const weeklyCards = weeklyPlan.map((w) => ({
    Тиждень: `${w.startStr} – ${w.endStr}`,
    DSV: w.weeklyDSV,
    "Опади, мм": w.rainSum.toFixed(1),
    Рекомендація: w.rec,
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Крок 4: Результати</h2>
      <p className="text-sm text-gray-600 mb-4">
        Нижче показано рекомендовані дати обробки. Ви можете увімкнути розширений режим BLITECAST для діагностики.
      </p>

      <div className="mb-4">
        <button
          onClick={() => setBlitecastMode(!blitecastMode)}
          className={`px-4 py-2 text-sm rounded border font-medium ${blitecastMode ? "bg-blue-600 text-white" : "bg-white text-blue-600 border-blue-600"}`}
        >
          {blitecastMode ? "🔽 Сховати BLITECAST" : "🔬 Показати BLITECAST"}
        </button>
      </div>

      <div className="hidden md:block mb-6 overflow-x-auto">
        <h3 className="text-lg font-semibold mb-2">Рекомендовані внесення (проти фітофторозу)</h3>
        <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg overflow-hidden text-sm">
          <thead className="bg-blue-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2">Дата</th>
              <th className="px-4 py-2">Препарат</th>
              <th className="px-4 py-2">Інтервал</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sprayData.map((item, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-2">{i + 1}</td>
                <td className="px-4 py-2">{item["Дата"]}</td>
                <td className="px-4 py-2">{item["Препарат"]}</td>
                <td className="px-4 py-2">{item["Інтервал"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MobileCard title="Рекомендовані внесення (проти фітофторозу)" entries={sprayData} />

      {diseaseCards && <MobileCard title="Обробки по хворобах" entries={diseaseCards} />}

      {blitecastMode && (
        <>
          <MobileCard title="Діагностика по днях" entries={diagnosticsData} />
          <MobileCard title="Щотижневі підсумки" entries={weeklyCards} />
        </>
      )}

      <div className="mt-8">
        <button
          onClick={onRestart}
          className="px-6 py-3 text-white font-bold bg-blue-600 rounded hover:bg-blue-700"
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
    { tempMin: 7, tempMax: 13, bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 1 }, { h: 10, dsv: 2 }, { h: 12, dsv: 3 }, { h: 14, dsv: 4 }] },
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
