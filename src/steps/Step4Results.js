import { format, parseISO, differenceInDays } from "date-fns";
import React, { useState } from "react";
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

const productLinks = {
  "Зорвек Інкантія": "https://www.corteva.com.ua/products-and-solutions/crop-protection/zorvec-encantia.html",
  "Ридоміл Голд": "https://www.syngenta.ua/product/crop-protection/ridomil-gold-mz-68-wg-v-g",
  "Танос": "https://www.corteva.com.ua/products-and-solutions/crop-protection/tanos.html",
  "Акробат МЦ": "https://www.agro.basf.ua/uk/",
  "Орондіс Ультра": "https://www.syngenta.ua/product/crop-protection/orondisr-ultra-280-sc-k-s",
  "Ранман ТОП": "https://summit-agro.com.ua/product/zagalnij-katalog-produktiv/ranman-top-ks",
  "Ревус ТОП": "https://www.syngenta.ua/product/crop-protection/revus-top-500-es-k-s",
  "Курзат Р": "https://www.corteva.com.ua/products-and-solutions/crop-protection/curzate-r.html",
  "Інфініто": "https://www.cropscience.bayer.ua/Products/Fungicides/Infinito.aspx",
  "Луна Експірієнс": "https://www.cropscience.bayer.ua/Products/Fungicides/LunaExperience.aspx",
  "Сігнум": "https://www.agro.basf.ua/uk",
  "Скала": "https://www.cropscience.bayer.ua/Products/Fungicides/Scala.aspx",
  "Тельдор": "https://www.cropscience.bayer.ua/Products/Fungicides/Teldor.aspx",
  "Скор": "https://www.syngenta.ua/product/crop-protection/skor-250-es-k-e",
  "Натіво": "https://www.cropscience.bayer.ua/Products/Fungicides/Nativo.aspx",
  "Медян Екстра": "https://www.summit-agro.com.ua/product/organik-standart/medyan-ekstra-350-sc-ks",
  "Казумін": "https://summit-agro.com.ua/product/zagalnij-katalog-produktiv/kazumin-2l",
  "Серенада": "https://www.cropscience.bayer.ua/Products/Fungicides/Serenada.aspx",
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

const rotationGrayMold = ["Луна Експірієнс", "Сігнум", "Скала", "Тельдор", "Скор", "Натіво"];
const rotationAlternaria = rotationGrayMold;
const rotationBacteriosis = ["Медян Екстра", "Казумін", "Серенада"];

// ✅ Підсумовує опади та сприятливі години за період
function getAccumulatedStats(weatherDaily = [], rainDaily = [], prevDate, currentDate) {
  const start = typeof prevDate === "string" ? parseISO(prevDate.split(".").reverse().join("-")) : prevDate;
  const end = typeof currentDate === "string" ? parseISO(currentDate.split(".").reverse().join("-")) : currentDate;

  if (!start || !end || isNaN(start) || isNaN(end)) {
    return { rain: 0, condHours: 0 };
  }

  const condHours = weatherDaily
    .filter((entry) => parseISO(entry.date) >= start && parseISO(entry.date) <= end)
    .reduce((sum, entry) => sum + (Number(entry.condHours) || 0), 0);

  const rain = rainDaily
    .filter((entry) => parseISO(entry.date) >= start && parseISO(entry.date) <= end)
    .reduce((sum, entry) => sum + (Number(entry.rain) || 0), 0);

  return { rain, condHours };
}

// Карточка
function Card({ frontData, backData }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className={`flip-card ${flipped ? "flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
      <div className="flip-card-inner">
        {/* Передня сторона */}
        <div className="flip-card-front">
          <div className="card-index">{frontData.index}</div>
          {Object.entries(frontData.fields).map(([key, value]) => (
            <div key={key} className="card-row">
              <strong>{key}:</strong> {value}
            </div>
          ))}
        </div>

        {/* Задня сторона */}
        <div className="flip-card-back">
          <h4>Погодні умови за період</h4>
          <p><strong>Сприятливі години:</strong> {backData.condHours}</p>
          <p><strong>Опади:</strong> {backData.rain.toFixed(1)} мм</p>
        </div>
      </div>
    </div>
  );
}

// Секція з картками
function CardView({ title, entries, weatherDaily, rainDaily, plantingDate }) {
  return (
    <div className="card-section">
      <h3>{title}</h3>
      {entries.map((item, i) => {
        if (!item?.Дата) return null;

        const currentDate = parseISO(item.Дата.split(".").reverse().join("-"));
        if (isNaN(currentDate)) return null;

        const prevDate = i === 0 ? plantingDate : parseISO(entries[i - 1].Дата.split(".").reverse().join("-"));
        const backData = getAccumulatedStats(weatherDaily, rainDaily, prevDate, currentDate);

        return <Card key={i} frontData={{ index: `#${i + 1}`, fields: item }} backData={backData} />;
      })}
    </div>
  );
}

export default function Step4Results({ result, onRestart }) {
  const [showIntegrated, setShowIntegrated] = useState(false);
  if (!result) return <p>Дані відсутні</p>;

  const { sprayDates, diseaseSummary, suitableHours = {}, weatherDaily = [], rainDaily = [], plantingDate, harvestDate } = result;

  const sprayData = sprayDates.map((d, i) => {
    const cur = parseISO(d.split(".").reverse().join("-"));
    const prev = i > 0 ? parseISO(sprayDates[i - 1].split(".").reverse().join("-")) : null;
    const gap = prev ? `${differenceInDays(cur, prev)} діб після попередньої` : "—";
    const product = rotationProducts[i % rotationProducts.length];

    return {
      Дата: d,
      Препарат: `${product} (${productInfo[product] || "—"})`,
      Рекомендація: productLinks[product] ? (
        <a href={productLinks[product]} target="_blank" rel="noreferrer">Перейти</a>
      ) : "—",
      Інтервал: gap,
    };
  });

  return (
    <div className="container">
      <button className="restart-button" onClick={onRestart}>🔄 Почати спочатку</button>
      <h2>Крок 4: Результати</h2>
      <p>
        Період розрахунку: <strong>{format(new Date(plantingDate), "dd.MM.yyyy")}</strong> — <strong>{format(new Date(harvestDate), "dd.MM.yyyy")}</strong>
      </p>
      <p className="description">Нижче показано рекомендовані дати обробки. Ви можете сформувати інтегровану систему захисту.</p>

      <button className="toggle-button" onClick={() => setShowIntegrated(!showIntegrated)}>
        {showIntegrated ? "🔽 Сховати інтегровану систему" : "🍅 Сформувати інтегровану систему захисту"}
      </button>

      <CardView
        title="Рекомендовані внесення (проти фітофторозу)"
        entries={sprayData}
        weatherDaily={weatherDaily}
        rainDaily={rainDaily}
        plantingDate={plantingDate}
      />

      <button className="restart-button" onClick={onRestart}>🔄 Почати спочатку</button>
    </div>
  );
}
