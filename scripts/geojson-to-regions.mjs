import fs from "fs";

// Читаємо GeoJSON
const raw = fs.readFileSync("./scripts/export.geojson", "utf-8");
const geojson = JSON.parse(raw);

// Витягуємо тільки назви та координати
const regions = geojson.features
  .map(f => {
    const name = f.properties?.name;
    const lat = f.geometry?.coordinates?.[1];
    const lon = f.geometry?.coordinates?.[0];
    if (!name || !lat || !lon) return null;
    return { name, lat, lon };
  })
  .filter(Boolean);

// Сортуємо по алфавіту
regions.sort((a, b) => a.name.localeCompare(b.name, "uk"));

// Зберігаємо у JS-файл
const out = `export const regions = ${JSON.stringify(regions, null, 2)};\n`;
fs.writeFileSync("./src/regions.js", out, "utf-8");

console.log(`✅ Збережено ${regions.length} міст у src/regions.js`);
