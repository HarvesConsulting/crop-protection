// engine.js
import { format, parseISO, differenceInDays, isValid as isValidDate } from "date-fns";

/* ------------------------- Константи/пороги ------------------------- */
const RH_WET_THRESHOLD = 90;
const COND_RH = 90;
const COND_T_MIN = 10;
const COND_T_MAX = 28;
const COND_HOURS_TRIGGER = 3;
const DEFAULT_DSV_THRESHOLD = 15;
const RAIN_HIGH_THRESHOLD_MM = 12.7;

/* ------------------------- DSV правила ------------------------- */
const DSV_RULES = [
  { tempMin: 21, tempMax: 27, bands: [{ h: 6, dsv: 2 }, { h: 8, dsv: 3 }, { h: 10, dsv: 4 }] },
  { tempMin: 13, tempMax: 21, bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 2 }, { h: 10, dsv: 3 }, { h: 12, dsv: 4 }] },
  { tempMin: 7,  tempMax: 13, bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 1 }, { h: 10, dsv: 2 }, { h: 12, dsv: 3 }, { h: 14, dsv: 4 }] },
  { tempMin: 27, tempMax: 40, bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 2 }, { h: 10, dsv: 3 }] },
];

/* ------------------------- Хелпери дат/перевірок ------------------------- */
function asDate(v) {
  if (!v) return null;
  if (v instanceof Date) return isValidDate(v) ? v : null;
  // очікуємо ISO yyyy-MM-dd або подібне
  try {
    const d = parseISO(String(v));
    return isValidDate(d) ? d : null;
  } catch {
    const d = new Date(v);
    return isValidDate(d) ? d : null;
  }
}

function toISOyyyyMMDD(d) {
  const dt = asDate(d);
  return dt ? format(dt, "yyyyMMdd") : null;
}

function toISOyyyy_mm_dd(d) {
  const dt = asDate(d);
  return dt ? format(dt, "yyyy-MM-dd") : null;
}

function yesterday() {
  const t = new Date();
  t.setDate(t.getDate() - 1);
  t.setHours(0, 0, 0, 0);
  return t;
}

function clampDateRange(start, end, { min = new Date(1981, 0, 1), max = yesterday() } = {}) {
  const s = asDate(start);
  const e = asDate(end);
  if (!s || !e) return { start: null, end: null, error: "Invalid dates" };
  let s2 = s < min ? min : s;
  let e2 = e > max ? max : e;
  if (s2 > e2) [s2, e2] = [e2, s2];
  return { start: s2, end: e2, error: "" };
}

function isFiniteNumber(x) {
  return typeof x === "number" && Number.isFinite(x);
}

function coerceLatLon(lat, lon) {
  const la = Number(lat);
  const lo = Number(lon);
  if (!isFiniteNumber(la) || !isFiniteNumber(lo)) return { ok: false, lat: null, lon: null };
  if (la < -90 || la > 90 || lo < -180 || lo > 180) return { ok: false, lat: null, lon: null };
  return { ok: true, lat: la, lon: lo };
}

/* ------------------------- DSV обчислення ------------------------- */
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
  const rows = (daily || []).map(d => ({
    ...d,
    DSV: Math.min(dsvFromWet(Number(d?.wetHours ?? 0), Number(d?.wetTempAvg ?? NaN)), 4),
  }));
  const schedule = [];
  let acc = 0;
  let lastSpray = null;

  for (const r of rows) {
    const curDate = r.date instanceof Date ? r.date : asDate(r.date);
    if (!curDate) continue;
    acc += r.DSV || 0;

    const lastDate = lastSpray ? (lastSpray instanceof Date ? lastSpray : asDate(lastSpray)) : null;
    const canSpray = !lastDate || (isValidDate(lastDate) && differenceInDays(curDate, lastDate) >= 5);

    if (acc >= dsvThreshold && canSpray) {
      schedule.push({ date: curDate, accBefore: acc });
      acc -= dsvThreshold;
      lastSpray = curDate;
    }
  }

  return { rows, schedule };
}

export function computeMultiSpraySchedule(rows, rainDaily = []) {
  const safeRows = Array.isArray(rows) ? rows.filter(r => r?.date instanceof Date || asDate(r?.date)) : [];
  const normRows = safeRows.map(r => ({ ...r, date: r.date instanceof Date ? r.date : asDate(r.date) }))
                           .filter(r => r.date && isValidDate(r.date));

  const hasCond = (r) => Number(r?.condHours || 0) >= COND_HOURS_TRIGGER;
  const sprays = [];
  const dayMs = 86400000;

  const firstObj = normRows.find(hasCond);
  const first = firstObj?.date || null;
  if (!first) return sprays;

  sprays.push(first);
  let cursor = first;

  // нормалізуємо опади
  const rain = Array.isArray(rainDaily)
    ? rainDaily
        .map(x => ({ date: x?.date instanceof Date ? x.date : asDate(x?.date), rain: Number(x?.rain || 0) }))
        .filter(x => x.date && isValidDate(x.date))
    : [];

  while (true) {
    const d1 = new Date(cursor.getTime() + 1 * dayMs);
    const d5 = new Date(cursor.getTime() + 5 * dayMs);
    const d7 = new Date(cursor.getTime() + 7 * dayMs);

    const hadHeavyRain = rain.some((r) => r.date > cursor && r.date <= d7 && Number(r.rain) >= RAIN_HIGH_THRESHOLD_MM);

    let next = null;
    if (hadHeavyRain) {
      next = d5;
    } else {
      const hadCondWithin7 = normRows.some((r) => r.date >= d1 && r.date <= d7 && hasCond(r));
      if (hadCondWithin7) next = d7;
      else next = normRows.find((r) => r.date > d7 && hasCond(r))?.date || null;
    }

    if (!next) break;
    if (sprays.length && next.getTime() <= sprays[sprays.length - 1].getTime()) break;

    sprays.push(next);
    cursor = next;
  }

  return sprays;
}

export function makeWeeklyPlan(rows, rainDaily, startISO, rainThreshold, horizonDays) {
  // старт беремо з параметра, або з першого дня даних, або з сьогодні
  let start = asDate(startISO);
  const safeRows = Array.isArray(rows) ? rows.filter(r => r?.date instanceof Date || asDate(r?.date)) : [];
  const normRows = safeRows
    .map(r => ({ ...r, date: r.date instanceof Date ? r.date : asDate(r.date) }))
    .filter(r => r.date && isValidDate(r.date));

  if (!start) start = normRows[0]?.date || new Date();
  if (!isValidDate(start)) return [];

  // ✅ Виправлена логіка кінцевої дати
  let stopDate;
  if (horizonDays) {
    // Прогноз → обмежуємо горизонт (наприклад, 14 днів)
    stopDate = new Date(start.getTime() + horizonDays * 86400000);
  } else {
    // Історія → до останнього дня з даних
    stopDate = normRows.length ? normRows[normRows.length - 1].date : start;
  }

  // нормалізуємо опади
  const rain = Array.isArray(rainDaily)
    ? rainDaily
        .map(x => ({ date: x?.date instanceof Date ? x.date : asDate(x?.date), rain: Number(x?.rain || 0) }))
        .filter(x => x.date && isValidDate(x.date))
    : [];

  const weeks = [];
  let cur = new Date(start);

  while (cur <= stopDate) {
    const end = new Date(Math.min(cur.getTime() + 6 * 86400000, stopDate.getTime()));
    const wkRows = normRows.filter(r => r.date >= cur && r.date <= end);
    const wkRain = rain.filter(r => r.date >= cur && r.date <= end).reduce((a, b) => a + Number(b?.rain || 0), 0);
    const weeklyDSV = wkRows.reduce(
      (a, b) => a + Math.min(dsvFromWet(Number(b?.wetHours || 0), Number(b?.wetTempAvg || NaN)), 4),
      0
    );

    let rec = "No spray";
    if (weeklyDSV >= 7) rec = "Heavy spray";
    else if (weeklyDSV >= 5) rec = "Moderate spray";
    else if (weeklyDSV >= 3) rec = "Alert";

    weeks.push({
      startStr: format(cur, "dd.MM.yyyy"),
      endStr: format(end, "dd.MM.yyyy"),
      weeklyDSV: Number(weeklyDSV) || 0,
      rainSum: Number(wkRain) || 0,
      rec,
    });

    cur = new Date(end.getTime() + 86400000);
  }

  return weeks;
}

/* ------------------------- NASA POWER (hourly) ------------------------- */
// ключ у NASA буває різним: YYYYMMDDHH, або YYYYMMDDTHH, або з двокрапками.
// Беремо перші 8 цифр і формуємо yyyy-MM-dd.
function powerKeyToISODate(k) {
  const digits = String(k).replace(/\D/g, "");
  if (digits.length < 8) return null;
  const d = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
  return d;
}

function buildNASAUrl({ lat, lon, start, end }) {
  const s = toISOyyyyMMDD(start);
  const e = toISOyyyyMMDD(end);
  if (!s || !e) throw new Error("Invalid date for NASA url");
  const params = new URLSearchParams({
    parameters: "T2M,RH2M",
    start: s,
    end: e,
    latitude: String(lat),
    longitude: String(lon),
    community: "ag",
    "time-standard": "lst",
    format: "JSON",
  });
  return `https://power.larc.nasa.gov/api/temporal/hourly/point?${params.toString()}`;
}

function buildNASADailyUrl({ lat, lon, start, end }) {
  const s = toISOyyyyMMDD(start);
  const e = toISOyyyyMMDD(end);
  if (!s || !e) throw new Error("Invalid date for NASA rain url");
  const params = new URLSearchParams({
    parameters: "PRECTOTCORR",
    start: s,
    end: e,
    latitude: String(lat),
    longitude: String(lon),
    community: "ag",
    format: "JSON",
  });
  return `https://power.larc.nasa.gov/api/temporal/daily/point?${params.toString()}`;
}

function transformNASAResponse(json) {
  const p = json?.properties?.parameter;
  if (!p) return [];
  const t = p.T2M || {};
  const rh = p.RH2M || {};
  const keys = Array.from(new Set([...Object.keys(t), ...Object.keys(rh)]));

  const perDay = new Map();
  for (const k of keys) {
    const iso = powerKeyToISODate(k);
    if (!iso) continue;
    const dt = asDate(iso);
    if (!dt) continue;

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
      condHours: r.condHours,
    });
  }

  out.sort((a, b) => a.date.getTime() - b.date.getTime());
  return out;
}

/* ------------------------- Open-Meteo helpers ------------------------- */
function transformOpenMeteoHourly(json) {
  const h = json?.hourly;
  if (!h) return [];
  const times = h.time || [];
  const temps = h.temperature_2m || [];
  const rhs = h.relative_humidity_2m || [];

  const perDay = new Map();
  const n = Math.min(times.length, temps.length, rhs.length);

  for (let i = 0; i < n; i++) {
    const ts = times[i];
    if (!ts || typeof ts !== "string" || ts.indexOf("T") < 0) continue;
    const iso = ts.split("T")[0];
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
    const d = asDate(iso);
    if (!d) continue;
    const allAvg = r.allTemp.length ? r.allTemp.reduce((a, b) => a + b, 0) / r.allTemp.length : NaN;
    const wetAvg = r.wetTemp.length ? r.wetTemp.reduce((a, b) => a + b, 0) / r.wetTemp.length : NaN;
    out.push({
      date: d,
      wetHours: r.wetHours,
      wetTempAvg: wetAvg,
      allTempAvg: allAvg,
      condHours: r.condHours,
    });
  }
  out.sort((a, b) => a.date.getTime() - b.date.getTime());
  return out;
}

function transformOpenMeteoDaily(json) {
  const d = json?.daily;
  if (!d) return [];
  const t = d.time || [];
  const pr = d.precipitation_sum || [];
  const n = Math.min(t.length, pr.length);
  const out = [];
  for (let i = 0; i < n; i++) {
    const day = asDate(t[i]);
    if (!day) continue;
    out.push({ date: day, rain: Number(pr[i] || 0) });
  }
  out.sort((a, b) => a.date.getTime() - b.date.getTime());
  return out;
}

/* ------------------------- Open-Meteo (прогноз) ------------------------- */
export async function fetchForecastHourly(lat, lon, startISO, days = 14) {
  const s = toISOyyyy_mm_dd(startISO);
  const { ok, lat: la, lon: lo } = coerceLatLon(lat, lon);
  if (!ok || !s) return { daily: [], error: "Invalid lat/lon or start date", url: "" };

  const end = toISOyyyy_mm_dd(new Date(new Date(s).getTime() + (days - 1) * 86400000));
  const params = new URLSearchParams({
    latitude: String(la),
    longitude: String(lo),
    timezone: "auto",
    hourly: "temperature_2m,relative_humidity_2m",
    start_date: s,
    end_date: end,
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
  const s = toISOyyyy_mm_dd(startISO);
  const { ok, lat: la, lon: lo } = coerceLatLon(lat, lon);
  if (!ok || !s) return { daily: [], error: "Invalid lat/lon or start date", url: "" };

  const end = toISOyyyy_mm_dd(new Date(new Date(s).getTime() + (days - 1) * 86400000));
  const params = new URLSearchParams({
    latitude: String(la),
    longitude: String(lo),
    timezone: "auto",
    daily: "precipitation_sum",
    start_date: s,
    end_date: end,
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

/* ------------------------- Історія: NASA + fallback ERA5 ------------------------- */
export async function fetchWeatherFromNASA(lat, lon, start, end) {
  const { ok, lat: la, lon: lo } = coerceLatLon(lat, lon);
  if (!ok) return { daily: [], error: "Invalid lat/lon", url: "" };

  const clamped = clampDateRange(start, end);
  if (clamped.error) return { daily: [], error: clamped.error, url: "" };
  const { start: s, end: e } = clamped;

  let url = "";
  try {
    // 1) NASA POWER hourly
    url = buildNASAUrl({ lat: la, lon: lo, start: s, end: e });
    let res = await fetch(url, { headers: { Accept: "application/json" } });

    if (res.ok) {
      const json = await res.json();
      const daily = transformNASAResponse(json);
      if (Array.isArray(daily) && daily.length > 0) return { daily, error: "", url };
    }

    // 2) Fallback → Open-Meteo ERA5 (archive)
    const params = new URLSearchParams({
      latitude: String(la),
      longitude: String(lo),
      hourly: "temperature_2m,relative_humidity_2m,windspeed_10m,precipitation",
      start_date: toISOyyyy_mm_dd(s),
      end_date: toISOyyyy_mm_dd(e),
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
  const { ok, lat: la, lon: lo } = coerceLatLon(lat, lon);
  if (!ok) return { daily: [], error: "Invalid lat/lon", url: "" };

  const clamped = clampDateRange(start, end);
  if (clamped.error) return { daily: [], error: clamped.error, url: "" };
  const { start: s, end: e } = clamped;

  let url = "";
  try {
    // 1) NASA POWER daily rain
    url = buildNASADailyUrl({ lat: la, lon: lo, start: s, end: e });
    let res = await fetch(url, { headers: { Accept: "application/json" } });

    if (res.ok) {
      const json = await res.json();
      const pr = json?.properties?.parameter?.PRECTOTCORR || {};
      const keys = Object.keys(pr).filter(k => /\d{8}/.test(k)).sort();
      const daily = keys.map(k => {
        const iso = `${k.slice(0, 4)}-${k.slice(4, 6)}-${k.slice(6, 8)}`;
        const d = asDate(iso);
        return d ? { date: d, rain: Number(pr[k]) || 0 } : null;
      }).filter(Boolean);

      if (daily.length > 0) return { daily, error: "", url };
    }

    // 2) Fallback → Open-Meteo ERA5 daily rain
    const params = new URLSearchParams({
      latitude: String(la),
      longitude: String(lo),
      daily: "precipitation_sum",
      start_date: toISOyyyy_mm_dd(s),
      end_date: toISOyyyy_mm_dd(e),
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
export function extractSuitableHoursFromHourly(json) {
  const h = json?.hourly;
  if (!h) return {};

  const times = h.time || [];
  const temps = h.temperature_2m || [];
  const winds = h.windspeed_10m || [];
  const precs = h.precipitation || [];

  const result = {};

  for (let i = 0; i < times.length; i++) {
    const ts = times[i]; // e.g. "2025-09-20T06:00"
    const [date, hour] = ts.split("T");
    const hNum = parseInt(hour.split(":")[0]);
    const t = temps[i];
    const w = winds[i];
    const p = precs[i];

    if (t >= 10 && t <= 25 && w <= 4 && p === 0) {
      if (!result[date]) result[date] = [];
      result[date].push(`${hNum}:00`);
    }
  }

  return result; // { '2025-09-20': ['6:00', '7:00', ...] }
}
