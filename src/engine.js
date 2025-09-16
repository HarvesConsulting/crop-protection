// engine.js
import { format, parseISO, differenceInDays } from "date-fns";

// ---------------- Константи ----------------
const RH_WET_THRESHOLD = 90;
const COND_RH = 90;
const COND_T_MIN = 10;
const COND_T_MAX = 28;
const COND_HOURS_TRIGGER = 3;
const DEFAULT_DSV_THRESHOLD = 15;
const RAIN_HIGH_THRESHOLD_MM = 12.7;

// ---------------- DSV правила ----------------
const DSV_RULES = [
  { tempMin: 21, tempMax: 27, bands: [{ h: 6, dsv: 2 }, { h: 8, dsv: 3 }, { h: 10, dsv: 4 }] },
  { tempMin: 13, tempMax: 21, bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 2 }, { h: 10, dsv: 3 }, { h: 12, dsv: 4 }] },
  { tempMin: 7, tempMax: 13, bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 1 }, { h: 10, dsv: 2 }, { h: 12, dsv: 3 }, { h: 14, dsv: 4 }] },
  { tempMin: 27, tempMax: 40, bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 2 }, { h: 10, dsv: 3 }] },
];

// ---------------- DSV функції ----------------
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

// ---------------- NASA helper ----------------
function buildNASAUrl({ lat, lon, start, end }) {
  const startDate = format(new Date(start), "yyyyMMdd");
  const endDate = format(new Date(end), "yyyyMMdd");
  const params = new URLSearchParams({
    parameters: "T2M,RH2M",
    start: startDate,
    end: endDate,
    latitude: String(lat),
    longitude: String(lon),
    community: "ag",
    "time-standard": "lst",
    format: "JSON"
  });
  return `https://power.larc.nasa.gov/api/temporal/hourly/point?${params.toString()}`;
}

function buildNASADailyUrl({ lat, lon, start, end }) {
  const startDate = format(new Date(start), "yyyyMMdd");
  const endDate = format(new Date(end), "yyyyMMdd");
  const params = new URLSearchParams({
    parameters: "PRECTOTCORR",
    start: startDate,
    end: endDate,
    latitude: String(lat),
    longitude: String(lon),
    community: "ag",
    format: "JSON"
  });
  return `https://power.larc.nasa.gov/api/temporal/daily/point?${params.toString()}`;
}

function transformNASAResponse(json) {
  const p = json?.properties?.parameter;
  if (!p) return [];
  const t = p.T2M || {};
  const rh = p.RH2M || {};
  const perDay = new Map();

  for (const k of Object.keys(t)) {
    const iso = `${k.slice(0,4)}-${k.slice(4,6)}-${k.slice(6,8)}`;
    const rec = perDay.get(iso) || { allTemp: [], wetTemp: [], wetHours: 0, condHours: 0 };
    const tv = Number(t[k]);
    const rv = Number(rh[k]);
    if (Number.isFinite(tv)) rec.allTemp.push(tv);
    if (Number.isFinite(tv) && Number.isFinite(rv)) {
      if (rv >= RH_WET_THRESHOLD) {
        rec.wetTemp.push(tv);
        rec.wetHours += 1;
      }
      if (rv >= COND_RH && tv >= COND_T_MIN && tv < COND_T_MAX) {
        rec.condHours += 1;
      }
    }
    perDay.set(iso, rec);
  }

  const out = [];
  for (const [iso, r] of perDay.entries()) {
    const allAvg = r.allTemp.length ? r.allTemp.reduce((a, b) => a + b, 0) / r.allTemp.length : NaN;
    const wetAvg = r.wetTemp.length ? r.wetTemp.reduce((a, b) => a + b, 0) / r.wetTemp.length : NaN;
    out.push({
      date: new Date(iso),
      wetHours: r.wetHours,
      wetTempAvg: wetAvg,
      allTempAvg: allAvg,
      condHours: r.condHours
    });
  }
  out.sort((a, b) => a.date - b.date);
  return out;
}

// ---------------- Open-Meteo helper ----------------
function transformOpenMeteoHourly(json) {
  const h = json?.hourly;
  if (!h) return [];
  const times = h.time || [];
  const temps = h.temperature_2m || [];
  const rhs = h.relative_humidity_2m || [];
  const perDay = new Map();

  for (let i = 0; i < times.length; i++) {
    const iso = times[i].split("T")[0];
    const tv = Number(temps[i]);
    const rv = Number(rhs[i]);
    const rec = perDay.get(iso) || { allTemp: [], wetTemp: [], wetHours: 0, condHours: 0 };
    if (Number.isFinite(tv)) rec.allTemp.push(tv);
    if (Number.isFinite(tv) && Number.isFinite(rv)) {
      if (rv >= RH_WET_THRESHOLD) {
        rec.wetTemp.push(tv);
        rec.wetHours += 1;
      }
      if (rv >= COND_RH && tv >= COND_T_MIN && tv < COND_T_MAX) {
        rec.condHours += 1;
      }
    }
    perDay.set(iso, rec);
  }

  const out = [];
  for (const [iso, r] of perDay.entries()) {
    const allAvg = r.allTemp.length ? r.allTemp.reduce((a, b) => a + b, 0) / r.allTemp.length : NaN;
    const wetAvg = r.wetTemp.length ? r.wetTemp.reduce((a, b) => a + b, 0) / r.wetTemp.length : NaN;
    out.push({
      date: new Date(iso),
      wetHours: r.wetHours,
      wetTempAvg: wetAvg,
      allTempAvg: allAvg,
      condHours: r.condHours
    });
  }
  out.sort((a, b) => a.date - b.date);
  return out;
}

function transformOpenMeteoDaily(json) {
  const d = json?.daily;
  if (!d) return [];
  return (d.time || []).map((iso, i) => ({
    date: new Date(iso),
    rain: Number(d.precipitation_sum[i]) || 0
  }));
}

// ---------------- Fetch API ----------------
export async function fetchForecastHourly(lat, lon, startISO, days = 14) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: "auto",
    hourly: "temperature_2m,relative_humidity_2m",
    start_date: startISO,
    end_date: format(new Date(new Date(startISO).getTime() + (days - 1) * 86400000), "yyyy-MM-dd"),
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { daily: transformOpenMeteoHourly(json), error: "", url };
  } catch (e) {
    return { daily: [], error: String(e), url };
  }
}

export async function fetchForecastDailyRain(lat, lon, startISO, days = 14) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: "auto",
    daily: "precipitation_sum",
    start_date: startISO,
    end_date: format(new Date(new Date(startISO).getTime() + (days - 1) * 86400000), "yyyy-MM-dd"),
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return { daily: transformOpenMeteoDaily(json), error: "", url };
  } catch (e) {
    return { daily: [], error: String(e), url };
  }
}

export async function fetchWeatherFromNASA(lat, lon, start, end) {
  let url = "";
  try {
    url = buildNASAUrl({ lat, lon, start, end });
    let res = await fetch(url, { headers: { Accept: "application/json" } });

    if (res.ok) {
      const json = await res.json();
      const daily = transformNASAResponse(json);
      if (daily.length > 0) return { daily, error: "", url };
    }

    // fallback: Open-Meteo ERA5
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      hourly: "temperature_2m,relative_humidity_2m",
      start_date: format(new Date(start), "yyyy-MM-dd"),
      end_date: format(new Date(end), "yyyy-MM-dd"),
      timezone: "auto",
    });
    const omUrl = `https://archive-api.open-meteo.com/v1/era5?${params.toString()}`;
    res = await fetch(omUrl);
    if (!res.ok) throw new Error(`ERA5 error ${res.status}`);
    const json2 = await res.json();
    return { daily: transformOpenMeteoHourly(json2), error: "", url: omUrl };

  } catch (e) {
    return { daily: [], error: String(e), url };
  }
}

export async function fetchDailyRainFromNASA(lat, lon, start, end) {
  let url = "";
  try {
    url = buildNASADailyUrl({ lat, lon, start, end });
    let res = await fetch(url, { headers: { Accept: "application/json" } });

    if (res.ok) {
      const json = await res.json();
      const pr = json?.properties?.parameter?.PRECTOTCORR || {};
      const daily = Object.keys(pr).map(k => ({
        date: new Date(`${k.slice(0, 4)}-${k.slice(4, 6)}-${k.slice(6, 8)}`),
        rain: Number(pr[k]) || 0
      }));
      if (daily.length > 0) return { daily, error: "", url };
    }

    // fallback: Open-Meteo ERA5 daily
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      daily: "precipitation_sum",
      start_date: format(new Date(start), "yyyy-MM-dd"),
      end_date: format(new Date(end), "yyyy-MM-dd"),
      timezone: "auto",
    });
    const omUrl = `https://archive-api.open-meteo.com/v1/era5?${params.toString()}`;
    res = await fetch(omUrl);
    if (!res.ok) throw new Error(`ERA5 rain error ${res.status}`);
    const json2 = await res.json();
    return { daily: transformOpenMeteoDaily(json2), error: "", url: omUrl };

  } catch (e) {
    return { daily: [], error: String(e), url };
  }
}

