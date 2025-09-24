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

function InfoToggle({ content }) {
  const [show, setShow] = useState(false);

  return (
    <span style={{ display: "inline-block" }}>
      <button
        onClick={(e) => {
          e.stopPropagation(); // 🛑 не перевертати картку
          setShow(!show);
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#007bff",
          fontSize: "16px",
          marginLeft: 6,
        }}
        title="Показати рекомендації"
      >
        ℹ️
      </button>
      {show && (
        <div style={{ marginTop: 6 }}>
          {Array.isArray(content) ? content : <div>{content}</div>}
        </div>
      )}
    </span>
  );
}

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

// 🧮 Сумування погодних умов за період
function getAccumulatedStats(diagnostics = [], startDate, endDate) {
  if (!Array.isArray(diagnostics)) return {};

  const start = new Date(startDate);
  const end = new Date(endDate);

  const periodData = diagnostics.filter((d) => {
    if (!d.date) return false;
    const dDate = new Date(d.date);
    return dDate >= start && dDate <= end;
  });

  if (!periodData.length) {
    return { wetHours: 0, rain: 0, condHours: 0 };
  }

  const wetHours = periodData.reduce((sum, d) => sum + (d.wetHours || 0), 0);
  const rain = periodData.reduce((sum, d) => sum + (d.rain || 0), 0);
  const condHours = periodData.reduce((sum, d) => sum + (d.condHours || 0), 0);

  const wetTemps = periodData.map((d) => d.wetTempAvg).filter((v) => v !== undefined && !isNaN(v));
  const allTemps = periodData.map((d) => d.allTempAvg).filter((v) => v !== undefined && !isNaN(v));

  const wetTempAvg = wetTemps.length ? wetTemps.reduce((a, b) => a + b, 0) / wetTemps.length : undefined;
  const allTempAvg = allTemps.length ? allTemps.reduce((a, b) => a + b, 0) / allTemps.length : undefined;

  return { wetHours, rain, condHours, wetTempAvg, allTempAvg };
}

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
              <strong>{key}:</strong>{" "}
              {key === "Рекомендація" ? <InfoToggle content={value} /> : value}
            </div>
          ))}
        </div>

        {/* Задня сторона */}
        <div className="flip-card-back">
          <h4>Погодні умови</h4>
          <p>
            <strong>Середня температура:</strong>{" "}
            {backData.allTempAvg !== undefined ? backData.allTempAvg.toFixed(1) : "—"} °C
          </p>
          <p>
            <strong>Середня t° при волозі:</strong>{" "}
            {backData.wetTempAvg !== undefined ? backData.wetTempAvg.toFixed(1) : "—"} °C
          </p>
          <p>
            <strong>Вологі години:</strong> {backData.wetHours ?? 0}
          </p>
          <p>
            <strong>Сприятливі години:</strong> {backData.condHours ?? 0}
          </p>
          <p>
            <strong>Опади:</strong>{" "}
            {backData.rain !== undefined ? backData.rain.toFixed(1) : 0} мм
          </p>
        </div>
      </div>
    </div>
  );
}

function CardView({ title, entries, diagnostics = [], plantingDate }) {
  return (
    <div className="card-section">
      <h3>{title}</h3>
      {entries.map((item, i) => {
        const curDate = parseISO(item.Дата.split(".").reverse().join("-"));
        const prevDate =
          i > 0
            ? parseISO(entries[i - 1].Дата.split(".").reverse().join("-"))
            : new Date(plantingDate);

        const diag = getAccumulatedStats(diagnostics, prevDate, curDate);

        return (
          <Card
            key={i}
            frontData={{ index: `#${i + 1}`, fields: item }}
            backData={diag}
          />
        );
      })}
    </div>
  );
}

export default function Step4Results({ result, onRestart }) {
  const [showIntegrated, setShowIntegrated] = useState(false);

  if (!result) return <p>Дані відсутні</p>;

  const { sprayDates, diseaseSummary, suitableHours = {}, diagnostics = [], plantingDate, harvestDate } = result;

  const sprayData = sprayDates.map((d, i) => {
    const cur = parseISO(d.split(".").reverse().join("-"));
    const prev = i > 0 ? parseISO(sprayDates[i - 1].split(".").reverse().join("-")) : null;
    const gap = prev ? `${differenceInDays(cur, prev)} діб після попередньої` : "—";
    const product = rotationProducts[i % rotationProducts.length];
    const dateStr = format(cur, "dd.MM.yyyy");
    const recommendedHours = suitableHours[dateStr] || [];

    return {
      Дата: d,
      Препарат: `${product} (${productInfo[product] || "—"})`,
      Рекомендація: productLinks[product] ? (
        <a href={productLinks[product]} target="_blank" rel="noreferrer">
          Перейти
        </a>
      ) : (
        "—"
      ),
      Інтервал: gap,
      "Рекомендовані години": recommendedHours.length ? recommendedHours.join(", ") : "—",
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
      const dateStr = format(item.date, "dd.MM.yyyy");
      const recommendedHours = suitableHours[dateStr] || [];

      return {
        Дата: dateStr,
        Препарат: `${product} (${productInfo[product] || "—"})`,
        Рекомендація: productLinks[product] ? (
          <a href={productLinks[product]} target="_blank" rel="noreferrer">
            Перейти
          </a>
        ) : (
          "—"
        ),
        Інтервал:
          i === 0 ? "—" : `${differenceInDays(item.date, treatments[i - 1].date)} діб після попередньої`,
        "Рекомендовані години": recommendedHours.length ? recommendedHours.join(", ") : "—",
      };
    });

    return { name, entries };
  });

  const rawEntries = [...sprayData, ...diseaseCardsGrouped.flatMap(({ entries }) => entries)];

  const groupedByDate = rawEntries.reduce((acc, entry) => {
    const key = entry.Дата;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  const integratedSystem = Object.entries(groupedByDate).map(([date, entries]) => {
    const allProducts = entries.map((e) => e.Препарат).join(", ");
    const allLinks = entries
      .map((e) => {
        if (typeof e.Рекомендація === "string") return null;
        const href = e.Рекомендація?.props?.href;
        return href ? (
          <div key={href}>
            <a href={href} target="_blank" rel="noreferrer">
              {href}
            </a>
          </div>
        ) : null;
      })
      .filter(Boolean);

    return {
      Дата: date,
      Препарат: allProducts,
      Рекомендація: allLinks.length ? <>{allLinks}</> : "—",
      backData: {}, // ✅ щоб не ламалось
    };
  });

  integratedSystem.sort(
    (a, b) =>
      parseISO(a.Дата.split(".").reverse().join("-")) -
      parseISO(b.Дата.split(".").reverse().join("-"))
  );

  const exportToExcel = () => {
    const simplified = integratedSystem.map(({ Дата, Препарат, Рекомендація }) => ({
      Дата,
      Препарат,
      Рекомендація: typeof Рекомендація === "string" ? Рекомендація : Рекомендація?.props?.href || "",
    }));
    const ws = XLSX.utils.json_to_sheet(simplified);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Захист");
    XLSX.writeFile(wb, "Інтегрована_система_захисту.xlsx");
  };

  return (
    <div className="container">
      <button className="restart-button" onClick={onRestart}>
        🔄 Почати спочатку
      </button>
      <h2>Крок 4: Результати</h2>
      <p>
        Період розрахунку: <strong>{format(new Date(plantingDate), "dd.MM.yyyy")}</strong> —{" "}
        <strong>{format(new Date(harvestDate), "dd.MM.yyyy")}</strong>
      </p>
      <p className="description">
        Нижче показано рекомендовані дати обробки. Ви можете сформувати інтегровану систему захисту.
      </p>

      <button className="toggle-button" onClick={() => setShowIntegrated(!showIntegrated)}>
        {showIntegrated ? "🔽 Сховати інтегровану систему" : "🍅 Сформувати інтегровану систему захисту"}
      </button>

      {showIntegrated ? (
        <>
          <CardView title="Інтегрована система захисту" entries={integratedSystem} diagnostics={diagnostics} plantingDate={plantingDate} />
          <button onClick={exportToExcel} className="toggle-button">
            ⬇️ Експорт в Excel
          </button>
        </>
      ) : (
        <>
          <CardView title="Рекомендовані внесення (проти фітофторозу)" entries={sprayData} diagnostics={diagnostics} plantingDate={plantingDate} />
          {diseaseCardsGrouped?.map(({ name, entries }) => (
            <CardView key={name} title={`Рекомендовані внесення (проти: ${name})`} entries={entries} diagnostics={diagnostics} plantingDate={plantingDate} />
          ))}
        </>
      )}

      <button className="restart-button" onClick={onRestart}>
        🔄 Почати спочатку
      </button>
    </div>
  );
}
