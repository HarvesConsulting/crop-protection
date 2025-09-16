// engine.js
import { format, parseISO, differenceInDays } from "date-fns";

const RH_WET_THRESHOLD = 90;
const COND_RH = 90;
const COND_T_MIN = 10;
const COND_T_MAX = 28;
const COND_HOURS_TRIGGER = 3;
const DEFAULT_DSV_THRESHOLD = 15;
const RAIN_HIGH_THRESHOLD_MM = 12.7;

// ---------------- DSV ----------------
const DSV_RULES = [
  { tempMin: 21, tempMax: 27, bands: [{ h: 6, dsv: 2 }, { h: 8, dsv: 3 }, { h: 10, dsv: 4 }] },
  { tempMin: 13, tempMax: 21, bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 2 }, { h: 10, dsv: 3 }, { h: 12, dsv: 4 }] },
  { tempMin: 7, tempMax: 13,  bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 1 }, { h: 10, dsv: 2 }, { h: 12, dsv: 3 }, { h: 14, dsv: 4 }] },
  { tempMin: 27, tempMax: 40, bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 2 }, { h: 10, dsv: 3 }] },
];

export function dsvFromWet(wetHours, wetTempAvg) {
  if (!Number.isFinite(wetHours) || !Number.isFinite(wetTempAvg)) return 0;
  if (wetHours < 6) return 0;
  for (const rule of DSV_RULES) {
    if (wetTempAvg >= rule.tempMin && wetTempAvg < rule.tempMax) {
      const bands = [...rule.bands].sort((a, b) => b.h - a.h);
      for (const b of bands) if (wetHours >= b.h) return b.dsv;
    }
  }
  return 0;
}

export function computeDSVSchedule(daily, dsvThreshold = DEFAULT_DSV_THRESHOLD) {
  const rows = daily.map(d => ({ ...d, DSV: Math.min(dsvFromWet(d.wetHours, d.wetTempAvg), 4) }));
  const schedule = [];
  let acc = 0;
  let lastSpray = null;

  for (const r of rows) {
    acc += r.DSV;
    const curDate = parseISO(String(r.date));
    const lastDate = lastSpray ? parseISO(String(lastSpray)) : null;
    const canSpray = !lastDate || differenceInDays(curDate, lastDate) >= 5;

    if (acc >= dsvThreshold && canSpray) {
      schedule.push({ date: r.date, accBefore: acc });
      acc -= dsvThreshold;
      lastSpray = r.date;
    }
  }

  return { rows, schedule };
}

export function computeMultiSpraySchedule(rows, rainDaily = []) {
  const hasCond = (r) => Number(r.condHours || 0) >= COND_HOURS_TRIGGER;
  const sprays = [];
  const dayMs = 86400000;
  const first = rows.find(hasCond)?.date || null;
  if (!first) return sprays;
  sprays.push(first);
  let cursor = first;

  while (true) {
    const d1 = new Date(cursor.getTime() + 1 * dayMs);
    const d5 = new Date(cursor.getTime() + 5 * dayMs);
    const d7 = new Date(cursor.getTime() + 7 * dayMs);

    const hadHeavyRain = (rainDaily || []).some(
      (r) => r.date > cursor && r.date <= d7 && Number(r.rain) >= RAIN_HIGH_THRESHOLD_MM
    );

    let next = null;
    if (hadHeavyRain) next = d5;
    else {
      const hadCondWithin7 = rows.some(
        (r) => r.date >= d1 && r.date <= d7 && hasCond(r)
      );
      if (hadCondWithin7) next = d7;
      else next = rows.find((r) => r.date > d7 && hasCond(r))?.date || null;
    }

    if (!next || (sprays.length && next <= sprays[sprays.length - 1])) break;
    sprays.push(next);
    cursor = next;
  }

  return sprays;
}

export function makeWeeklyPlan(rows, rainDaily, startISO, rainThreshold, horizonDays = 14) {
  const start = parseISO(startISO);
  const stopDate = new Date(start.getTime() + horizonDays * 86400000);
  const weeks = [];

  let cur = new Date(start);
  while (cur <= stopDate) {
    const end = new Date(Math.min(cur.getTime() + 6 * 86400000, stopDate.getTime()));
    const wkRows = rows.filter((r) => r.date >= cur && r.date <= end);
    const wkRain = rainDaily.filter((r) => r.date >= cur && r.date <= end)
      .reduce((a, b) => a + Number(b?.rain ?? 0), 0);
    const weeklyDSV = wkRows.reduce(
      (a, b) => a + Math.min(dsvFromWet(Number(b.wetHours), Number(b.wetTempAvg)), 4),
      0
    );

    let rec = "No spray";
    if (weeklyDSV >= 7) rec = "Heavy spray";
    else if (weeklyDSV >= 5) rec = "Moderate spray";
    else if (weeklyDSV >= 3) rec = "Alert";

    weeks.push({
      startStr: format(cur, "dd.MM.yyyy"),
      endStr: format(end, "dd.MM.yyyy"),
      weeklyDSV,
      rainSum: wkRain,
      rec,
    });

    cur = new Date(end.getTime() + 86400000);
  }

  return weeks;
}

// Заглушки API (ти заміниш на повні функції пізніше)
export async function fetchForecastHourly() {
  return { daily: [], error: "STUB: fetchForecastHourly not implemented" };
}
export async function fetchForecastDailyRain() {
  return { daily: [], error: "STUB: fetchForecastDailyRain not implemented" };
}
export async function fetchWeatherFromNASA() {
  return { daily: [], error: "STUB: fetchWeatherFromNASA not implemented" };
}
export async function fetchDailyRainFromNASA() {
  return { daily: [], error: "STUB: fetchDailyRainFromNASA not implemented" };
}
