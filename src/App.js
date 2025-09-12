import React, { useState, useEffect } from "react";
import { format, isValid as isValidDate, parseISO, differenceInDays } from "date-fns";

// ---------------- Константи ----------------
const RH_WET_THRESHOLD = 90;
const COND_RH = 90;
const COND_T_MIN = 13;
const COND_T_MAX = 28;
const COND_HOURS_TRIGGER = 3;
const NEXT_SPRAY_MAX_GAP = 7;
const TIME_STANDARD = "lst";
const RAIN_HIGH_THRESHOLD_MM = 12.7;
const DEFAULT_DSV_THRESHOLD = 15;



// DSV (для довідкової діагностики)
const DSV_RULES = [
  { tempMin: 21, tempMax: 27, bands: [{ h: 6, dsv: 2 }, { h: 8, dsv: 3 }, { h: 10, dsv: 4 }] },
  { tempMin: 13, tempMax: 21, bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 2 }, { h: 10, dsv: 3 }, { h: 12, dsv: 4 }] },
  { tempMin: 7, tempMax: 13,  bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 1 }, { h: 10, dsv: 2 }, { h: 12, dsv: 3 }, { h: 14, dsv: 4 }] },
  { tempMin: 27, tempMax: 40, bands: [{ h: 6, dsv: 1 }, { h: 8, dsv: 2 }, { h: 10, dsv: 3 }] },
];

// Ротація препаратів
const rotationProducts = [
  "Зорвек Інкантія","Ридоміл Голд","Танос","Акробат МЦ","Орондіс Ультра","Ранман ТОП","Ревус","Курзат Р","Інфініто",
];

// Регіони
const regions = [
  { name: "Київ", lat: 50.4501, lon: 30.5234 },
  { name: "Львів", lat: 49.8397, lon: 24.0297 },
  { name: "Одеса", lat: 46.4825, lon: 30.7233 },
  { name: "Харків", lat: 49.9935, lon: 36.2304 },
  { name: "Дніпро", lat: 48.4647, lon: 35.0462 },
  { name: "Запоріжжя", lat: 47.8388, lon: 35.1396 },
  { name: "Полтава", lat: 49.5883, lon: 34.5514 },
  { name: "Черкаси", lat: 49.4444, lon: 32.0598 },
  { name: "Чернігів", lat: 51.4982, lon: 31.2893 },
  { name: "Миколаїв", lat: 46.975, lon: 31.9946 },
  { name: "Херсон", lat: 46.635, lon: 32.616 },
];

// Культури/хвороби
const diseaseOptions = [
  { crop: "Огірки",  disease: "Пероноспороз", pathogen: "Pseudoperonospora cubensis" },
  { crop: "Цибуля",  disease: "Пероноспороз", pathogen: "Peronospora destructor" },
  { crop: "Салат",   disease: "Пероноспороз", pathogen: "Bremia lactucae" },
  { crop: "Капуста", disease: "Пероноспороз", pathogen: "Hyaloperonospora parasitica" },
  { crop: "Шпинат",  disease: "Пероноспороз", pathogen: "Peronospora farinosa f. sp. spinaciae" },
  { crop: "Морква",  disease: "Пероноспороз", pathogen: "Pseudoperonospora spp." },
  { crop: "Томати",  disease: "Фітофтороз",   pathogen: "Phytophthora infestans" },
  { crop: "Картопля",disease: "Фітофтороз",   pathogen: "Phytophthora infestans" },
];

// ---------------- Хелпери дат ----------------
function toYYYYMMDD(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : parseISO(String(date));
  if (!isValidDate(d)) return null;
  return format(d, "yyyyMMdd");
}
function keyToISODate(key) {
  try {
    const raw = String(key);
    if (raw.includes("-")) return raw.split("T")[0];
    if (raw.includes("T") && !raw.includes("-")) {
      const d = raw.split("T")[0];
      return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
    }
    const d = raw.replace(/[^0-9]/g, "").slice(0, 8);
    if (d.length !== 8) return null;
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  } catch { return null; }
}

// ---------------- Трансформації/обчислення ----------------
function dsvFromWet(wetHours, wetTempAvg) {
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
function computeDSVSchedule(daily, dsvThreshold = DEFAULT_DSV_THRESHOLD) {
  const rows = daily.map(d => ({ ...d, DSV: Math.min(dsvFromWet(d.wetHours, d.wetTempAvg), 4) }));
  const schedule = [];
  let acc = 0; let lastSpray = null;
  for (const r of rows) {
    acc += r.DSV;
    const canSpray = !lastSpray || differenceInDays(r.date, lastSpray) >= 5;
    if (acc >= dsvThreshold && canSpray) {
      schedule.push({ date: r.date, accBefore: acc });
      acc = acc - dsvThreshold; lastSpray = r.date;
    }
  }
  return { rows, schedule };
}
function computeMultiSpraySchedule(rows) {
  const hasCond = (r) => Number(r.condHours || 0) >= COND_HOURS_TRIGGER;
  const sprays = [];
  const first = rows.find(hasCond)?.date || null;
  if (!first) return sprays;
  sprays.push(first);
  const dayMs = 86400000;
  let cursor = first;
  while (true) {
    const earliestAllowed = new Date(cursor.getTime() + NEXT_SPRAY_MAX_GAP * dayMs);
    const windowStart = new Date(cursor.getTime() + dayMs);
    const windowEnd = earliestAllowed;
    const hadCondWithin7 = rows.some(r => r.date >= windowStart && r.date <= windowEnd && hasCond(r));
    let next = null;
    if (hadCondWithin7) next = earliestAllowed;
    else next = rows.find(r => r.date >= earliestAllowed && hasCond(r))?.date || null;
    if (next) { sprays.push(next); cursor = next; } else break;
  }
  return sprays;
}

// ---------------- NASA POWER (історія) ----------------
function buildNASAUrl({ lat, lon, start, end }) {
  const startDate = toYYYYMMDD(start); const endDate = toYYYYMMDD(end);
  if (!startDate || !endDate) throw new Error("Невірний формат дат");
  const params = new URLSearchParams({
    parameters: "T2M,RH2M", start: startDate, end: endDate,
    latitude: String(lat), longitude: String(lon),
    community: "ag", "time-standard": TIME_STANDARD, format: "JSON"
  });
  return `https://power.larc.nasa.gov/api/temporal/hourly/point?${params.toString()}`;
}
function buildNASADailyUrl({ lat, lon, start, end }) {
  const startDate = toYYYYMMDD(start); const endDate = toYYYYMMDD(end);
  if (!startDate || !endDate) throw new Error("Невірний формат дат");
  const params = new URLSearchParams({
    parameters: "PRECTOTCORR", start: startDate, end: endDate,
    latitude: String(lat), longitude: String(lon),
    community: "ag", format: "JSON"
  });
  return `https://power.larc.nasa.gov/api/temporal/daily/point?${params.toString()}`;
}
function transformNASAResponse(json) {
  const p = json?.properties?.parameter; if (!p) return [];
  const t = p.T2M || {}; const rh = p.RH2M || {};
  const keys = Array.from(new Set([...Object.keys(t), ...Object.keys(rh)]));
  const perDay = new Map();
  for (const k of keys) {
    const iso = keyToISODate(k); if (!iso) continue;
    const rec = perDay.get(iso) || { allTemp: [], wetTemp: [], wetHours: 0, condHours: 0 };
    const tv = Number(t[k]); const rv = Number(rh[k]);
    if (Number.isFinite(tv)) rec.allTemp.push(tv);
    if (Number.isFinite(tv) && Number.isFinite(rv)) {
      if (rv >= RH_WET_THRESHOLD) { rec.wetTemp.push(tv); rec.wetHours += 1; }
      if (rv >= COND_RH && tv >= COND_T_MIN && tv < COND_T_MAX) { rec.condHours += 1; }
    }
    perDay.set(iso, rec);
  }
  const out = [];
  for (const [iso, r] of perDay.entries()) {
    const allAvg = r.allTemp.length ? r.allTemp.reduce((a, b) => a + b, 0) / r.allTemp.length : NaN;
    const wetAvg = r.wetTemp.length ? r.wetTemp.reduce((a, b) => a + b, 0) / r.wetTemp.length : NaN;
    out.push({ date: new Date(iso), wetHours: r.wetHours, wetTempAvg: wetAvg, allTempAvg: allAvg, condHours: r.condHours });
  }
  out.sort((a, b) => a.date.getTime() - b.date.getTime());
  return out;
}
async function fetchWeatherFromNASA(lat, lon, start, end) {
  let url = "";
  try {
    url = buildNASAUrl({ lat, lon, start, end });
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) { const txt = await res.text().catch(() => ""); return { daily: [], error: `HTTP ${res.status}${txt ? ": " + txt.slice(0, 160) : ""}`, url }; }
    const json = await res.json();
    return { daily: transformNASAResponse(json), error: "", url };
  } catch (e) { return { daily: [], error: String(e), url }; }
}
async function fetchDailyRainFromNASA(lat, lon, start, end) {
  let url = "";
  try {
    url = buildNASADailyUrl({ lat, lon, start, end });
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) { const txt = await res.text().catch(() => ""); return { daily: [], error: `HTTP ${res.status}${txt ? ": " + txt.slice(0, 160) : ""}`, url }; }
    const json = await res.json();
    const pr = json?.properties?.parameter?.PRECTOTCORR || {};
    const daily = Object.keys(pr).map(k => ({
      date: new Date(`${k.slice(0, 4)}-${k.slice(4, 6)}-${k.slice(6, 8)}`),
      rain: Number(pr[k]) || 0
    })).sort((a, b) => a.date.getTime() - b.date.getTime());
    return { daily, error: "", url };
  } catch (e) { return { daily: [], error: String(e), url }; }
}

// ---------------- Open-Meteо (прогноз) ----------------
function buildOpenMeteoHourly(lat, lon, startISO, days = 14) {
  const params = new URLSearchParams({ latitude: String(lat), longitude: String(lon), timezone: "auto" });
  params.set("hourly", "temperature_2m,relative_humidity_2m");
  const end = format(new Date(new Date(startISO).getTime() + (days - 1) * 86400000), "yyyy-MM-dd");
  params.set("start_date", startISO); params.set("end_date", end);
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}
function buildOpenMeteoDaily(lat, lon, startISO, days = 14) {
  const params = new URLSearchParams({ latitude: String(lat), longitude: String(lon), timezone: "auto" });
  params.set("daily", "precipitation_sum");
  const end = format(new Date(new Date(startISO).getTime() + (days - 1) * 86400000), "yyyy-MM-dd");
  params.set("start_date", startISO); params.set("end_date", end);
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}
function transformOpenMeteoHourly(json) {
  const h = json?.hourly; if (!h) return [];
  const times = h.time || [];
  const temps = h.temperature_2m || [];
  const rhs = h.relative_humidity_2m || [];
  const perDay = new Map();
  for (let i = 0; i < times.length; i++) {
    const ts = times[i]; const tv = Number(temps[i]); const rv = Number(rhs[i]);
    const iso = ts.split("T")[0];
    const rec = perDay.get(iso) || { allTemp: [], wetTemp: [], wetHours: 0, condHours: 0 };
    if (Number.isFinite(tv)) rec.allTemp.push(tv);
    if (Number.isFinite(tv) && Number.isFinite(rv)) {
      if (rv >= RH_WET_THRESHOLD) { rec.wetTemp.push(tv); rec.wetHours += 1; }
      if (rv >= COND_RH && tv >= COND_T_MIN && tv < COND_T_MAX) { rec.condHours += 1; }
    }
    perDay.set(iso, rec);
  }
  const out = [];
  for (const [iso, r] of perDay.entries()) {
    const allAvg = r.allTemp.length ? r.allTemp.reduce((a, b) => a + b, 0) / r.allTemp.length : NaN;
    const wetAvg = r.wetTemp.length ? r.wetTemp.reduce((a, b) => a + b, 0) / r.wetTemp.length : NaN;
    out.push({ date: new Date(iso), wetHours: r.wetHours, wetTempAvg: wetAvg, allTempAvg: allAvg, condHours: r.condHours });
  }
  out.sort((a, b) => a.date.getTime() - b.date.getTime());
  return out;
}
function transformOpenMeteoDaily(json) {
  const d = json?.daily; if (!d) return [];
  const times = d.time || []; const pr = d.precipitation_sum || [];
  const out = times.map((t, idx) => ({ date: new Date(t), rain: Number(pr[idx] || 0) }));
  out.sort((a, b) => a.date.getTime() - b.date.getTime());
  return out;
}
async function fetchForecastHourly(lat, lon, startISO, days = 14) {
  const url = buildOpenMeteoHourly(lat, lon, startISO, days);
  try {
    const res = await fetch(url);
    if (!res.ok) return { daily: [], error: `HTTP ${res.status}`, url };
    const json = await res.json();
    return { daily: transformOpenMeteoHourly(json), error: "", url };
  } catch (e) { return { daily: [], error: String(e), url }; }
}
async function fetchForecastDailyRain(lat, lon, startISO, days = 14) {
  const url = buildOpenMeteoDaily(lat, lon, startISO, days);
  try {
    const res = await fetch(url);
    if (!res.ok) return { daily: [], error: `HTTP ${res.status}`, url };
    const json = await res.json();
    return { daily: transformOpenMeteoDaily(json), error: "", url };
  } catch (e) { return { daily: [], error: String(e), url }; }
}

// ---------------- Щотижневий план ----------------
function makeWeeklyPlan(rows, rainDaily, startISO, rainThreshold, horizonDays) {
  const safeRows = Array.isArray(rows) ? rows : [];
  const safeRain = Array.isArray(rainDaily) ? rainDaily : [];
  const normStart = (val, fb) => {
    try {
      if (typeof val === "string" && /\d{4}-\d{2}-\d{2}/.test(val)) return val.slice(0, 10);
      if (fb instanceof Date && !isNaN(fb.getTime())) return format(fb, "yyyy-MM-dd");
    } catch {}
    return format(new Date(), "yyyy-MM-dd");
  };
  const startStr = normStart(startISO, safeRows[0]?.date);
  const start = parseISO(startStr);

  const lastRowDate =
    (safeRows.length && safeRows[safeRows.length - 1]?.date instanceof Date)
      ? safeRows[safeRows.length - 1].date
      : (safeRain.length && safeRain[safeRain.length - 1]?.date instanceof Date)
        ? safeRain[safeRain.length - 1].date
        : new Date(start.getTime() + 6 * 86400000);

  const stopDate = horizonDays ? new Date(start.getTime() + horizonDays * 86400000) : lastRowDate;

  const weeks = [];
  let cur = new Date(start);
  while (cur <= stopDate) {
    const end = new Date(Math.min(cur.getTime() + 6 * 86400000, stopDate.getTime()));
    const wkRows = safeRows.filter(r => r?.date instanceof Date && r.date >= cur && r.date <= end);
    const weeklyDSV = wkRows.reduce((a, b) => a + Math.min(dsvFromWet(Number(b?.wetHours ?? 0), Number(b?.wetTempAvg ?? 0)), 4), 0);
    const wkRain = safeRain.filter(r => r?.date instanceof Date && r.date >= cur && r.date <= end)
      .reduce((a, b) => a + Number(b?.rain ?? 0), 0);
    let rec = "No spray";
    if (weeklyDSV >= 7) rec = "Heavy spray";
    else if (weeklyDSV >= 5) rec = "Moderate spray";
    else if (weeklyDSV >= 3) rec = "Alert";
    weeks.push({ startStr: format(cur, "dd.MM.yyyy"), endStr: format(end, "dd.MM.yyyy"), weeklyDSV: Number(weeklyDSV) || 0, rainSum: Number(wkRain) || 0, rec });
    cur = new Date(end.getTime() + 86400000);
  }
  return weeks;
}

// ---------------- Фільтр сезону ----------------
function filterRowsBySeason(rows, planting, harvest) {
  if (!planting || !harvest) return rows;
  const start = parseISO(planting);
  const end = parseISO(harvest);
  return rows.filter(r => r.date >= start && r.date <= end);
}

// ---------------- Компонент UI ----------------
function ProtectionApp() {
  const [region, setRegion] = useState(null);
  const [disease, setDisease] = useState(diseaseOptions[0]);
  const [plantingDate, setPlantingDate] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [useForecast, setUseForecast] = useState(false);
  const [showDiag, setShowDiag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [diagnostics, setDiagnostics] = useState([]);
  const [weeklyPlan, setWeeklyPlan] = useState([]);
  const [sprayDates, setSprayDates] = useState([]);
  const [lastUrl, setLastUrl] = useState("");
  const [lastRainUrl, setLastRainUrl] = useState("");
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
  if (region?.name) setInputValue(region.name);
}, [region]);


  const generate = async () => {
    setError(""); setDiagnostics([]); setWeeklyPlan([]); setSprayDates([]); setLastUrl(""); setLastRainUrl("");
    if (!region) { setError("Будь ласка, оберіть регіон."); return; }
    if (useForecast) { if (!plantingDate) { setError("Увімкнено прогноз: вкажіть дату висадки."); return; } }
    else { if (!plantingDate || !harvestDate) { setError("Для історичних даних вкажіть дати початку та завершення."); return; } }

    setLoading(true);
    try {
      let wx, rain;
      if (useForecast) {
        wx = await fetchForecastHourly(region.lat, region.lon, plantingDate, 14);
        rain = await fetchForecastDailyRain(region.lat, region.lon, plantingDate, 14);
        setLastUrl(wx.url || ""); setLastRainUrl(rain.url || "");
      } else {
        [wx, rain] = await Promise.all([
          fetchWeatherFromNASA(region.lat, region.lon, plantingDate, harvestDate),
          fetchDailyRainFromNASA(region.lat, region.lon, plantingDate, harvestDate),
        ]);
        setLastUrl(wx.url || ""); setLastRainUrl(rain.url || "");
      }
      if (wx.error) { setError(`Помилка погоди: ${wx.error}`); return; }
      if (!wx.daily.length) { setError("Не отримано погодних даних."); return; }

      let rows = wx.daily;
      if (!useForecast) rows = filterRowsBySeason(rows, plantingDate, harvestDate);

      const sprays = computeMultiSpraySchedule(rows);
      setSprayDates(sprays.map(d => format(d, "dd.MM.yyyy")));

      const comp = computeDSVSchedule(rows, DEFAULT_DSV_THRESHOLD);
      setDiagnostics(comp.rows);

      const startForWeeksISO =
        typeof plantingDate === "string" && plantingDate
          ? plantingDate
          : (rows[0]?.date ? format(rows[0].date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));

      const plan = makeWeeklyPlan(comp.rows, (rain?.daily || []), startForWeeksISO, RAIN_HIGH_THRESHOLD_MM, useForecast ? 14 : undefined);
      setWeeklyPlan(plan);
    } catch (e) {
      setError(`Помилка при побудові моделі: ${e?.message || String(e)}`);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui, Arial" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Захист овочевих культур від грибкових хвороб</h1>

      <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
  <div>
    <label style={{ fontSize: 12 }}>Регіон:</label>
    <input
      type="text"
      value={inputValue}
      onChange={(e) => {
        const val = e.target.value;
        setInputValue(val);
        const match = regions.find(c => c.name.toLowerCase().includes(val.toLowerCase()));
        if (match) setRegion(match);
        else setRegion(null);
      }}
      list="city-options"
      placeholder="Введіть місто"
      style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
    />
    <datalist id="city-options">
      {regions.map(c => <option key={c.name} value={c.name} />)}
    </datalist>
  </div>

  <div>
    <label style={{ fontSize: 12 }}>Збір врожаю (для історичних даних):</label>
    <input
      type="date"
      value={harvestDate}
      disabled={useForecast}
      onChange={(e) => setHarvestDate(e.target.value)}
      style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
    />
  </div>

  <div>
    <label style={{ fontSize: 12 }}>Початок вегетації (дата висадки):</label>
    <input
      type="date"
      value={plantingDate}
      onChange={(e) => setPlantingDate(e.target.value)}
      style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
    />
  </div>
</div>


        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
          <button onClick={generate} disabled={loading} style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #222", background: "#222", color: "#fff", cursor: "pointer" }}>
            {loading ? "Обчислення…" : (useForecast ? "Сформувати прогноз (14 днів)" : "Створити модель (історія)")}
          </button>

          <label style={{ fontSize: 14 }}>
            <input type="checkbox" checked={useForecast} onChange={(e) => setUseForecast(e.target.checked)} /> Використовувати прогноз (Open-Meteo)
          </label>
          <label style={{ fontSize: 14 }}>
            <input type="checkbox" checked={showDiag} onChange={(e) => setShowDiag(e.target.checked)} /> Показати діагностику
          </label>
        </div>

        {error && <div style={{ color: "#b91c1c", fontSize: 13, marginTop: 8, whiteSpace: "pre-wrap" }}>{error}</div>}
        {lastUrl && <div style={{ fontSize: 12, color: "#666", marginTop: 6, wordBreak: "break-all" }}>URL (годинні T,RH): {lastUrl}</div>}
        {lastRainUrl && <div style={{ fontSize: 12, color: "#666", wordBreak: "break-all" }}>URL (добові опади): {lastRainUrl}</div>}
      </div>

      {/* Рекомендації */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Рекомендовані внесення </h2>
        {sprayDates.length > 0 ? (
          <ol style={{ marginLeft: 18 }}>
            {sprayDates.map((d, i) => <li key={i} style={{ marginBottom: 4 }}>{d} — {rotationProducts[i % rotationProducts.length]}</li>)}
          </ol>
        ) : <p style={{ fontSize: 14, margin: 0 }}>—</p>}
        <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>
          Увага: програма веде два типи розрахунків: !-ий - дає прогноз на дві послідовні обробки фунгіцидами відносно дати висадки або заданої дати; 2-ий - будує систему захисту в кінці сезону на основі архіву погоду (для перевірки факичної системи захисту з розрахунковою)
        </p>
      </div>

      {/* Діагностика */}
      {showDiag && diagnostics.length > 0 && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflowX: "auto" }}>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Діагностика по днях (RH ≥ {RH_WET_THRESHOLD}%{useForecast ? ", прогноз" : ", LST"})</h3>
          <table style={{ width: "100%", fontSize: 14, marginBottom: 16 }}>
            <thead>
              <tr>
                <th align="left">Дата</th>
                <th align="left">Год RH≥{RH_WET_THRESHOLD}%</th>
                <th align="left">Год RH≥90% & 13–&lt;28°C</th>
                <th align="left">Tavg (вологі год), °C</th>
                <th align="left">DSV (діагн.)</th>
              </tr>
            </thead>
            <tbody>
              {diagnostics.map((d, i) => (
                <tr key={i}>
                  <td>{format(d.date, "dd.MM.yyyy")}</td>
                  <td>{d.wetHours}</td>
                  <td>{d.condHours ?? 0}</td>
                  <td>{Number.isFinite(d.wetTempAvg) ? d.wetTempAvg.toFixed(1) : "—"}</td>
                  <td>{Math.min(dsvFromWet(d.wetHours, d.wetTempAvg), 4)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {weeklyPlan.length > 0 && (
            <>
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Щотижневі підсумки (діагностика BLITECAST)</h3>
              <table style={{ width: "100%", fontSize: 14 }}>
                <thead>
                  <tr>
                    <th align="left">Тиждень</th>
                    <th align="left">DSV за тиждень</th>
                    <th align="left">Опади, мм</th>
                    <th align="left">Рекомендація</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyPlan.map((w, i) => (
                    <tr key={i}>
                      <td>{w.startStr} – {w.endStr}</td>
                      <td>{Number(w.weeklyDSV || 0)}</td>
                      <td>{Number(w.rainSum || 0).toFixed(1)}</td>
                      <td>{w.rec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// CRA очікує дефолтний експорт App
export default function App() {
  return <ProtectionApp />;
}

