import React, { useState } from "react";
import { parseISO, differenceInDays } from "date-fns";
import "./Step4Results.css";
import * as XLSX from "xlsx";

const productInfo = {
  "Зорвек Інкантія": "0,5л/га",
  "Ридоміл Голд": "2,5кг/га",
  "Танос": "0,6кг/га",
  "Акробат МЦ": "2кг/га",
  "Орондіс Ультра": "0,4л/га",
  "Ранман ТОП": "0,5л/га",
  "Ревус ТОП": "0,6л/га",
  "Курзат Р": "2,5кг/га",
  "Інфініто": "1,6л/га",
  "Луна Експірієнс": "0,75л/га",
  "Сігнум": "1,5кг/га",
  "Скала": "2л/га",
  "Тельдор": "1,5кг/га",
  "Скор": "0,6л/га",
  "Натіво": "0,4кг/га",
  "Медян Екстра": "2л/га",
  "Казумін": "1,5-3л/га",
  "Серенада": "2л/га",
};

const rotationProducts = [
  "Зорвек Інкантія",
  "Ридоміл Голд",
  "Танос",
  "Акробат МЦ",
  "Орондіс Ультра",
  "Ранман ТОП",
  "Ревус ТОП",
  "Курзат Р",
  "Інфініто",
];

const rotationGrayMold = [
  "Луна Експірієнс",
  "Сігнум",
  "Скала",
  "Тельдор",
  "Скор",
  "Натіво",
];

const rotationAlternaria = rotationGrayMold;
const rotationBacteriosis = ["Медян Екстра", "Казумін", "Серенада"];

function getAdvancedTreatments(riskDates, minGap = 7, shortGap = 5) {
  const sorted = [...riskDates].map((d) => new Date(d)).sort((a, b) => a - b);
  const selected = [];
  let i = 0;

  while (i < sorted.length) {
    const current = sorted[i];
    if (
      !selected.length ||
      differenceInDays(current, selected[selected.length - 1].date) >=
        selected[selected.length - 1].gap
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
  const [showIntegrated, setShowIntegrated] = useState(false);

  if (!result) return <p>Дані відсутні</p>;
  const { sprayDates, diseaseSummary } = result;

  const sprayData = sprayDates.map((d, i) => {
    const cur = parseISO(d.split(".").reverse().join("-"));
    const prev = i > 0 ? parseISO(sprayDates[i - 1].split(".").reverse().join("-")) : null;
    const gap = prev ? `${differenceInDays(cur, prev)} діб після попередньої` : "—";
    const product = rotationProducts[i % rotationProducts.length];
    return {
      Дата: d,
      Препарат: `${product} (${productInfo[product] || "—"})`,
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
        Препарат: `${product} (${productInfo[product] || "—"})`,
        Інтервал:
          i === 0 ? "—" : `${differenceInDays(item.date, treatments[i - 1].date)} діб після попередньої`,
      };
    });

    return { name, entries };
  });

  const integratedSystem = [...sprayData.map(({ Дата, Препарат }) => ({ Дата, Препарат }))];
  diseaseCardsGrouped?.forEach(({ entries }) => {
    entries.forEach(({ Дата, Препарат }) => {
      integratedSystem.push({ Дата, Препарат });
    });
  });
  integratedSystem.sort((a, b) => parseISO(a.Дата.split(".").reverse().join("-")) - parseISO(b.Дата.split(".").reverse().join("-")));

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(integratedSystem);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Захист");
    XLSX.writeFile(wb, "Інтегрована_система_захисту.xlsx");
  };

  return (
    <div className="container">
      <h2>Крок 4: Результати</h2>
      <p className="description">
        Нижче показано рекомендовані дати обробки. Ви можете сформувати інтегровану систему захисту.
      </p>

      <button className="toggle-button" onClick={() => setShowIntegrated(!showIntegrated)}>
        {showIntegrated ? "🔽 Сховати інтегровану систему" : "🧪 Сформувати інтегровану систему захисту"}
      </button>

      {showIntegrated && (
        <>
          <CardView title="Інтегрована система захисту" entries={integratedSystem} />
          <button onClick={exportToExcel} className="toggle-button">⬇️ Експорт в Excel</button>
        </>
      )}

      {!showIntegrated && (
        <>
          <CardView title="Рекомендовані внесення (проти фітофторозу)" entries={sprayData} />
          {diseaseCardsGrouped?.map(({ name, entries }) => (
            <CardView
              key={name}
              title={`Рекомендовані внесення (проти: ${name})`}
              entries={entries}
            />
          ))}
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
