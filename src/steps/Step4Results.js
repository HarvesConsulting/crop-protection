import React, { useState } from "react";
import { parseISO, differenceInDays } from "date-fns";

const rotationProducts = [
  "Зорвек Інкантія", "Ридоміл Голд", "Танос", "Акробат МЦ",
  "Орондіс Ультра", "Ранман ТОП", "Ревус", "Курзат Р", "Інфініто",
];

const rotationGrayMold = ["Луна Експірієнс", "Сігнум", "Скала", "Тельдор", "Скор", "Натіво"];
const rotationAlternaria = rotationGrayMold;
const rotationBacteriosis = ["Медян Екстра", "Казумін", "Серенада"];

function getFilteredTreatmentsWithDynamicGap(riskDates) {
  const dates = [...riskDates].map(d => (d instanceof Date ? d : new Date(d))).sort((a, b) => a - b);
  const selected = [];
  let i = 0;
  while (i < dates.length) {
    const current = dates[i];
    selected.push(current);

    // перевіримо, чи є 4+ дні ризику підряд
    let gapDays = 7;
    let count = 1;
    for (let j = i + 1; j < dates.length; j++) {
      const diff = differenceInDays(dates[j], dates[j - 1]);
      if (diff === 1) count++;
      else break;
    }
    if (count >= 4) gapDays = 5;

    // проскакуємо до дати через gapDays
    let nextIndex = i + 1;
    while (nextIndex < dates.length && differenceInDays(dates[nextIndex], current) < gapDays) {
      nextIndex++;
    }
    i = nextIndex;
  }
  return selected;
}

function TreatmentTable({ title, treatments, rotation }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <table className="table-auto w-full text-sm border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-3 py-2 text-left border">Дата</th>
            <th className="px-3 py-2 text-left border">Препарат</th>
            <th className="px-3 py-2 text-left border">Інтервал</th>
          </tr>
        </thead>
        <tbody>
          {treatments.map(({ date, interval }, i) => (
            <tr key={i} className="even:bg-gray-50">
              <td className="px-3 py-2 border">{date.toLocaleDateString("uk-UA")}</td>
              <td className="px-3 py-2 border">{rotation[i % rotation.length]}</td>
              <td className="px-3 py-2 border">{interval}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Step4Results({ result, onRestart }) {
  if (!result) return <p>Дані відсутні</p>;
  const { sprayDates, diagnostics, weeklyPlan, diseaseSummary } = result;

  const fitoTreatments = sprayDates.map((d, i) => {
    const cur = parseISO(d.split(".").reverse().join("-"));
    const prev = i > 0 ? parseISO(sprayDates[i - 1].split(".").reverse().join("-")) : null;
    const interval = prev ? `${differenceInDays(cur, prev)} діб після попередньої` : "—";
    return { date: cur, interval };
  });

  const extraDiseaseTreatments = (name, rotation) => {
    const disease = diseaseSummary.find(d => d.name === name);
    if (!disease || !disease.riskDates?.length) return [];
    const rawDates = getFilteredTreatmentsWithDynamicGap(disease.riskDates);
    return rawDates.map((date, i) => {
      const prev = i > 0 ? rawDates[i - 1] : null;
      const interval = prev ? `${differenceInDays(date, prev)} діб після попередньої` : "—";
      return { date, interval };
    });
  };

  return (
    <div className="px-4">
      <h2 className="text-xl font-bold mb-4">Крок 4: Результати</h2>

      <TreatmentTable
        title="Рекомендовані внесення (проти фітофторозу)"
        treatments={fitoTreatments}
        rotation={rotationProducts}
      />

      <TreatmentTable
        title="Рекомендовані внесення (проти: Сіра гниль)"
        treatments={extraDiseaseTreatments("Сіра гниль", rotationGrayMold)}
        rotation={rotationGrayMold}
      />

      <TreatmentTable
        title="Рекомендовані внесення (проти: Альтернаріоз)"
        treatments={extraDiseaseTreatments("Альтернаріоз", rotationAlternaria)}
        rotation={rotationAlternaria}
      />

      <TreatmentTable
        title="Рекомендовані внесення (проти: Бактеріоз)"
        treatments={extraDiseaseTreatments("Бактеріоз", rotationBacteriosis)}
        rotation={rotationBacteriosis}
      />

      <div className="mt-8">
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          🔄 Почати спочатку
        </button>
      </div>
    </div>
  );
}
