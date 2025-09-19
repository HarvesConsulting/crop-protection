// src/data/productData.js
import { differenceInDays } from "date-fns";

export const rotationProducts = [
  "Зорвек Інкантія", "Ридоміл Голд", "Танос", "Акробат МЦ",
  "Орондіс Ультра", "Ранман ТОП", "Ревус ТОП", "Курзат Р", "Інфініто",
];

export const rotationGrayMold = [
  "Луна Експірієнс", "Сігнум", "Скала", "Тельдор", "Скор", "Натіво",
];

export const rotationAlternaria = rotationGrayMold;

export const rotationBacteriosis = [
  "Медян Екстра", "Казумін", "Серенада",
];

export function getAdvancedTreatments(riskDates, minGap = 7, shortGap = 5) {
  const sorted = [...riskDates].map((d) => new Date(d)).sort((a, b) => a - b);
  const selected = [];
  let i = 0;

  while (i < sorted.length) {
    const current = sorted[i];
    if (
      !selected.length ||
      differenceInDays(
        current,
        selected[selected.length - 1].date
      ) >= selected[selected.length - 1].gap
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
