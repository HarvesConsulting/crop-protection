// helpers.js

export function norm(s) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, ""); // прибрати діакритику
}

export function searchTextFor(r) {
  const alt = r.alt || r.alts || r.alt_names || [];
  const fields = [
    r.name,
    r["name:uk"], r.name_uk, r.uk,
    r["name:ru"], r.name_ru, r.ru,
    r["name:en"], r.name_en, r.en,
    ...alt,
  ].filter(Boolean);
  return norm(fields.join(" | "));
}

export function placeKey(r) {
  return `${r.name}|${r.lat}|${r.lon}`;
}
