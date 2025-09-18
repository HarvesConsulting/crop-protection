import React, { useState } from "react";
import { parseISO, differenceInDays } from "date-fns";
import "./Step4Results.css";

const rotationProducts = [
  { name: "Зорвек Інкантія", rate: "0,5л/га" },
  { name: "Ридоміл Голд", rate: "2,5кг/га" },
  { name: "Танос", rate: "0,6кг/га" },
  { name: "Акробат МЦ", rate: "2кг/га" },
  { name: "Орондіс Ультра", rate: "0,4л/га" },
  { name: "Ранман ТОП", rate: "0,5л/га" },
  { name: "Ревус ТОП", rate: "0,6л/га" },
  { name: "Курзат Р", rate: "2,5кг/га" },
  { name: "Інфініто", rate: "1,6л/га" },
];

const rotationGrayMold = [
  { name: "Луна Експірієнс", rate: "0,75л/га" },
  { name: "Сігнум", rate: "1,5кг/га" },
  { name: "Скала", rate: "2л/га" },
  { name: "Тельдор", rate: "1,5кг/га" },
  { name: "Скор", rate: "0,6л/га" },
  { name: "Натіво", rate: "0,4кг/га" },
];

const rotationAlternaria = rotationGrayMold;

const rotationBacteriosis = [
  { name: "Медян Екстра", rate: "2л/га" },
  { name: "Казумін", rate: "1,5-3л/га" },
  { name: "Серенада", rate: "2л/га" },
];

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
      while (
        j < sorted.length &&
        differenceInDays(sorted[j], sorted[j - 1]) === 1
      ) {
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

function CardView({ title, entries }) {
  return (
    <div className="card-section">
      <h3>{title}</h3>
      {entries.map((item, i) => (
        <div key={i} className="card">
          <div className="card-index">#{i + 1}</div>
          {Object.entries(item).map(([key, value]) => (
            <div key={key} className="card-row">
              <strong>{key}:</strong> {value}
            </div>
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
    const product = rotationProducts[i % rotationProducts.length];
    return {
      Дата: d,
      Препарат: product.name,
      "Норма, л/кг/га": product.rate,
      Інтервал: gap,
    };
  });

  const diseaseCardsGrouped = diseaseSummary?.map(({ name, riskDates }) => {
    const rotation = {
      "Сіра гниль": rotationGrayMold,
      "Альтернаріоз": rotationAlternaria,
      "Бактеріоз": rotationBacteriosis,
    }[name] || [];
    const treatments = getAdvancedTreatments(riskDates);
    const entries = treatments.map((item, i) => {
      const product = rotation[i % rotation.length];
      return {
        Дата: item.date.toLocaleDateString("uk-UA"),
        Препарат: product.name,
        "Норма, л/кг/га": product.rate,
        Інтервал:
          i === 0
            ? "—"
            : `${differenceInDays(item.date, treatments[i - 1].date)} діб після попередньої`,
      };
    });
    return { name, entries };
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
    <div className="container">
      <h2>Крок 4: Результати</h2>
      <p className="description">
        Нижче показано рекомендовані дати обробки. Ви можете увімкнути розширений режим BLITECAST для діагностики.
      </p>

      <button className="toggle-button" onClick={() => setBlitecastMode(!blitecastMode)}>
        {blitecastMode ? "🔽 Сховати BLITECAST" : "🔬 Показати BLITECAST"}
      </button>

      <CardView title="Рекомендовані внесення (проти фітофторозу)" entries={sprayData} />

      {diseaseCardsGrouped &&
        diseaseCardsGrouped.map(({ name, entries }) => (
          <CardView key={name} title={`Рекомендовані внесення (проти: ${name})`} entries={entries} />
        ))}

      {blitecastMode && (
        <>
          <CardView title="Діагностика по днях" entries={diagnosticsData} />
          <CardView title="Щотижневі підсумки" entries={weeklyCards} />
        </>
      )}

      <button className="restart-button" onClick={onRestart}>
        🔄 Почати спочатку
      </button>
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
