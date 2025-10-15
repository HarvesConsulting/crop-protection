import { format, parseISO, differenceInDays, isValid } from "date-fns";
import ModalWithSummary from "../components/ModalWithSummary";
import React, { useState, useEffect } from "react";
import "./Step4Results.css";
import * as XLSX from "xlsx";
import HourTimeline from "../components/HourTimeline";
import Layout from "../components/Layout";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WeatherPeriodView from "../components/WeatherPeriodView";
import ModalWithWeather from "../components/ModalWithWeather";
import { extractSuitableSprayHours } from "../engine";
import IntegratedTableView from "../components/IntegratedTableView";
import ActionMenu from "../components/ActionMenu";
import PDFExporter from "../components/PDFExporter";

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

const rotationGrayMold = [
  "Луна Експірієнс",
  "Сігнум",
  "Скала",
  "Тельдор",
  "Скор",
  "Натіво",
];

const rotationAlternaria = rotationGrayMold;
const rotationBacteriosis = ["Медян Екстра", "Казумін", "Серенада"];

function InfoToggle({ content }) {
  const [show, setShow] = useState(false);

  return (
    <span style={{ display: "inline-block" }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
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
        title="Показати рекомендацію"
      >
        ℹ️
      </button>

      {show && (
        <div
          style={{
            marginTop: 6,
            color: "#007bff",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          {React.isValidElement(content) ? (
            content
          ) : typeof content === "string" || typeof content === "number" ? (
            <div>{content}</div>
          ) : (
            <pre>{JSON.stringify(content, null, 2)}</pre>
          )}
        </div>
      )}
    </span>
  );
}

function getAdvancedTreatments(riskDates, minGap = 7, shortGap = 5) {
  const parsedDates = riskDates
    .map((d) =>
      typeof d === "string"
        ? parseISO(d.includes(".") ? d.split(".").reverse().join("-") : d)
        : d
    )
    .filter((d) => isValid(d));

  const sorted = parsedDates.sort((a, b) => a - b);
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

const parseDotDate = (str) => {
  if (!str || typeof str !== "string") return null;
  const [day, month, year] = str.split(".");
  if (!day || !month || !year) return null;
  const isoStr = `${year}-${month}-${day}`;
  const date = parseISO(isoStr);
  return isValid(date) ? date : null;
};

export function getAccumulatedStats(
  diagnostics = [],
  prevDate,
  currentDate,
  rainDaily = []
) {
  const start = typeof prevDate === "string" ? new Date(prevDate) : prevDate;
  const end = typeof currentDate === "string" ? new Date(currentDate) : currentDate;

  console.log("🔍 getAccumulatedStats()");
  console.log("⏱️ prevDate:", prevDate, "→", start);
  console.log("⏱️ currentDate:", currentDate, "→", end);

  if (!start || !end || isNaN(start) || isNaN(end)) {
    console.warn("❗ Невалідна дата:", { start, end });
    return { rain: 0, condHours: 0 };
  }

  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

  const rainEntries = rainDaily.filter((entry) => {
    const entryStr = format(new Date(entry.date), "yyyy-MM-dd");
    return entryStr >= startStr && entryStr <= endStr;
  });

  const condEntries = diagnostics.filter((entry) => {
    const entryStr = format(new Date(entry.date), "yyyy-MM-dd");
    return entryStr >= startStr && entryStr <= endStr;
  });

  console.log("🌧️ Враховано опадів:", rainEntries.length);
  console.log("⏳ Враховано годин:", condEntries.length);

  const rainSum = rainEntries.reduce((sum, entry) => {
    let value = Number(entry.rain ?? entry.precip ?? entry.opad);
    if (!isFinite(value) || value < 0) value = 0;
    return sum + value;
  }, 0);

  const hoursSum = condEntries.reduce((sum, entry) => {
    const h = Number(entry.condHours ?? entry.cond_hours ?? entry.hours);
    return sum + (isNaN(h) ? 0 : h);
  }, 0);

  console.log("✅ Підсумок за період:");
  console.log("☔ Опади:", rainSum.toFixed(1), "мм");
  console.log("🕒 Години:", hoursSum);

  return {
    rain: rainSum,
    condHours: hoursSum,
  };
}

function Card({ frontData, backData }) {
  const [flipped, setFlipped] = useState(false);

  const getCardClass = () => {
    const hours = backData?.condHours ?? 0;
    if (hours <= 10) return "card-green";
    if (hours <= 20) return "card-yellow";
    return "card-red";
  };

  return (
    <div
      className={`flip-card ${getCardClass()} ${flipped ? "flipped" : ""}`}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="flip-card-inner">
        <div className="flip-card-front">
          <div className="card-index">{frontData.index}</div>
          {Object.entries(frontData.fields).map(([key, value]) => (
            <div key={key} className="card-row">
              <strong>{key}:</strong>{" "}
              {key === "Рекомендація" ? (
                <InfoToggle content={value} />
              ) : key === "Рекомендовані години" ? (
                <HourTimeline
                  date={frontData.fields["Дата"]}
                  suitableHours={(value || "").split(", ").map((h) => h.trim())}
                  hourlyData={frontData.hourlyData || []}
                />
              ) : typeof value === "object" && value !== null ? (
                JSON.stringify(value)
              ) : (
                value
              )}
            </div>
          ))}
        </div>

        <div className="flip-card-back">
          <h4>Погодні умови</h4>
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

function CardView({ title, entries, diagnostics = [], plantingDate, rainDaily = [], hourlyData: enrichedHourlyData = [] }) {
  return (
    <div className="card-section">
      <h3>{title}</h3>
      {entries.map((item, i) => {
        if (!item?.Дата) {
          console.warn("Пропущено item через відсутність Дата:", item);
          return null;
        }

        let currentDate;
        try {
          currentDate = item.Дата instanceof Date
            ? item.Дата
            : parseISO(item.Дата.split(".").reverse().join("-"));
        } catch (e) {
          console.error("Помилка парсингу дати:", item.Дата);
          return null;
        }

        if (isNaN(currentDate)) {
          console.warn("Некоректна дата:", item.Дата);
          return null;
        }

        const prevDate =
          i === 0
            ? plantingDate
            : entries[i - 1].Дата instanceof Date
            ? entries[i - 1].Дата
            : parseISO(entries[i - 1].Дата.split(".").reverse().join("-"));

        const backDataResult = item.backData ?? getAccumulatedStats(
          diagnostics,
          prevDate,
          currentDate,
          rainDaily
        );

        const { backData, ...frontFields } = item;

        return (
          <Card
            key={i}
            frontData={{
              index: `#${i + 1}`,
              fields: frontFields,
              hourlyData: enrichedHourlyData,
            }}
            backData={backDataResult}
          />
        );
      })}
    </div>
  );
}

function aggregateDailyRain(hourlyData = []) {
  const dailyMap = {};

  hourlyData.forEach((entry) => {
    const date = entry.date;
    const rainValue = Number(entry.rain ?? entry.precip ?? entry.opad);

    if (!date || isNaN(rainValue)) return;

    if (!dailyMap[date]) {
      dailyMap[date] = 0;
    }

    dailyMap[date] += rainValue;
  });

  return Object.entries(dailyMap).map(([date, totalRain]) => ({
    date,
    rain: totalRain,
  }));
}

export default function Step4Results({ result, onRestart }) {
  const [showIntegrated, setShowIntegrated] = useState(false);
  const [showIntegratedModal, setShowIntegratedModal] = useState(false);
  const topRef = React.useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Змінено: порожній початковий стан
  const [expandedDiseases, setExpandedDiseases] = useState({});

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [weatherModalOpen, setWeatherModalOpen] = useState(false);

  const handleGoToCards = () => {
    setShowIntegrated(false);
  };

  if (!result) return <p>Дані відсутні</p>;

  const {
    sprayDates,
    diseaseSummary,
    suitableHours = {},
    diagnostics = [],
    rainDaily = [],
    hourlyData = [],
    plantingDate,
    harvestDate,
  } = result;

  const hasPhytophthora = true;

  // Обчислення sprayData та diseaseCardsGrouped
  const aggregatedRain = rainDaily;
  const sprayData = sprayDates.map((d, i) => {
    const cur = parseISO(d.split(".").reverse().join("-"));
    const prev =
      i > 0
        ? parseISO(sprayDates[i - 1].split(".").reverse().join("-"))
        : plantingDate;

    const gap = prev
      ? `${differenceInDays(cur, prev)} діб після попередньої`
      : "—";

    const product = rotationProducts[i % rotationProducts.length];
    const recommendedHours = suitableHours[d] || [];

    const backData = getAccumulatedStats(diagnostics, prev, cur, aggregatedRain);

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
      "Рекомендовані години": recommendedHours.length
        ? recommendedHours.join(", ")
        : "—",
      backData,
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

      const prevDate =
        i === 0 ? plantingDate : treatments[i - 1].date;

      const backData = getAccumulatedStats(
        diagnostics,
        prevDate,
        item.date,
        aggregatedRain
      );

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
          i === 0
            ? "—"
            : `${differenceInDays(item.date, treatments[i - 1].date)} діб після попередньої`,
        "Рекомендовані години": recommendedHours.length
          ? recommendedHours.join(", ")
          : "—",
        backData,
      };
    });

    return { name, entries };
  });

  // Додано: автоматичне управління станом розгортання
  useEffect(() => {
    const newExpandedState = {};
    
    // Фітофтороз - розгортаємо тільки якщо є sprayData
    if (sprayData && sprayData.length > 0) {
      newExpandedState["Фітофтороз"] = true;
    } else {
      newExpandedState["Фітофтороз"] = false;
    }
    
    // Інші хвороби - розгортаємо тільки якщо є entries
    diseaseCardsGrouped?.forEach(({ name, entries }) => {
      newExpandedState[name] = entries && entries.length > 0;
    });
    
    setExpandedDiseases(newExpandedState);
  }, [sprayData, diseaseCardsGrouped]);

  const isAllExpanded =
    ["Фітофтороз", ...((diseaseSummary?.map((d) => d.name)) || [])].every(
      (name) => expandedDiseases[name]
    );

  const suitableMap = extractSuitableSprayHours(hourlyData);

  const enrichedHourlyData = hourlyData.map((entry) => {
    const dateStr = entry.date.toISOString().split('T')[0];
    const hourStr = String(entry.hour).padStart(2, "0") + ":00";
    const suitableEntry = suitableMap[dateStr]?.find((h) => h.hour === hourStr);
    return {
      ...entry,
      suitable: suitableEntry?.suitable === true,
    };
  });

  const toggleDisease = (name) => {
    setExpandedDiseases((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const toggleAllCards = () => {
    const allDiseaseNames = ["Фітофтороз", ...(diseaseCardsGrouped?.map((d) => d.name) || [])];
    const allExpanded = allDiseaseNames.every((name) => expandedDiseases[name]);
    const newState = {};
    for (const name of allDiseaseNames) {
      newState[name] = !allExpanded;
    }
    setExpandedDiseases(newState);
  };

  // Решта коду для integratedSystem, exportToExcel тощо залишається без змін
  const rawEntries = [
    ...sprayData,
    ...diseaseCardsGrouped.flatMap(({ entries }) => entries),
  ];

  const groupedByDate = rawEntries.reduce((acc, entry) => {
    const key = entry.Дата;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  let lastDatesByDisease = {
    "Фітофтороз": plantingDate,
    "Альтернаріоз": plantingDate,
    "Сіра гниль": plantingDate,
    "Бактеріоз": plantingDate,
  };

  const mergeThreshold = 3 * 24 * 60 * 60 * 1000;

  const integratedMap = sprayData.map((spray) => {
    const dateObj = parseISO(spray.Дата.split(".").reverse().join("-"));
    return {
      Дата: spray.Дата,
      timestamp: dateObj.getTime(),
      Препарати: [spray.Препарат],
      Рекомендації: [spray.Рекомендація],
      diseases: new Set(["Фітофтороз"]),
      backData: spray.backData,
    };
  });

  for (const group of diseaseCardsGrouped) {
    for (const entry of group.entries) {
      const diseaseDate = parseISO(entry.Дата.split(".").reverse().join("-"));
      const diseaseTime = diseaseDate.getTime();

      let merged = false;

      for (const record of integratedMap) {
        const diff = Math.abs(record.timestamp - diseaseTime);

        if (diff <= mergeThreshold) {
          record.Препарати.push(entry.Препарат);
          record.Рекомендації.push(entry.Рекомендація);
          record.diseases.add(group.name);
          merged = true;
          break;
        }
      }

      if (!merged) {
        integratedMap.push({
          Дата: entry.Дата,
          timestamp: diseaseTime,
          Препарати: [entry.Препарат],
          Рекомендації: [entry.Рекомендація],
          diseases: new Set([group.name]),
          backData: entry.backData,
        });
      }
    }
  }

  const integratedSystem = integratedMap
    .map((entry) => ({
      Дата: entry.Дата,
      Препарат: entry.Препарати.join(", "),
      Рекомендація: entry.Рекомендації,
      backData: entry.backData,
      Хвороби: Array.from(entry.diseases).join(", "),
    }))
    .sort((a, b) => {
      const dA = parseISO(a.Дата.split(".").reverse().join("-"));
      const dB = parseISO(b.Дата.split(".").reverse().join("-"));
      return dA - dB;
    });

  const exportToExcel = () => {
    const exportData = integratedSystem.map((entry) => ({
      Дата: entry.Дата,
      Препарати: entry.Препарат,
      Хвороби: entry.Хвороби,
    }));

    const ws = XLSX.utils.aoa_to_sheet([["Інтегрована система захисту"]]);
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
    XLSX.utils.sheet_add_json(ws, exportData, { origin: "A2", skipHeader: false });

    ws["!cols"] = Object.keys(exportData[0]).map((key) => {
      const maxContentLength = Math.max(
        key.length,
        ...exportData.map((row) =>
          String(row[key] || "").split("\n").reduce((max, line) => Math.max(max, line.length), 0)
        )
      );
      return { wch: Math.min(Math.max(maxContentLength + 4, 12), 60) };
    });

    Object.keys(ws).forEach((cell) => {
      if (cell[0] === "!") return;
      if (!ws[cell].s) ws[cell].s = {};
      ws[cell].s.alignment = { wrapText: true, vertical: "top" };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Інтегрована таблиця");
    XLSX.writeFile(wb, "Інтегрована_таблиця_захисту.xlsx");
  };

  return (
    <main ref={topRef} className="flex justify-center items-start min-h-[70vh] px-4">
      <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-md px-6 sm:px-10 py-6 space-y-6 text-base sm:text-lg">
        <ActionMenu
          isMobile={isMobile}
          onRestart={onRestart}
          onShowWeather={() => setWeatherModalOpen(true)}
          onToggleIntegrated={() => setShowIntegratedModal(true)}
          showIntegrated={showIntegrated}
          onGoToCards={handleGoToCards}
          onShowSummary={() => setSummaryModalOpen(true)}
        />

        <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          Крок 4: Результати
          <button
            className="info-button"
            onClick={() => setShowInfo(!showInfo)}
            title="Показати інформацію"
          >
            <InfoOutlinedIcon style={{ color: "#1976d2" }} />
          </button>
        </h2>

        {showInfo && (
          <div
            style={{
              marginTop: "10px",
              background: "#e9f5ff",
              padding: "12px 16px",
              borderLeft: "4px solid #007bff",
              borderRadius: "6px",
            }}
          >
            <p>
              Період розрахунку:{" "}
              <strong>{format(new Date(result.plantingDate), "dd.MM.yyyy")}</strong> —{" "}
              <strong>{format(new Date(result.harvestDate), "dd.MM.yyyy")}</strong>
            </p>
            <p>
              Нижче показано рекомендовані дати обробки. 
              Ви можете сформувати інтегровану систему
              захисту. Зверніть увагу на колір картки - зелений - низький рівень загрози захворювання (додаткових заходів не потребує), 
              жовтий - середній рівень загрози (потребує включення до бакової суміші додатковоо контактного препарату опційно), 
              червоний - високий рівень загрози (потребує включення до бакової суміші додатково системного препарату опційно).
            </p>
          </div>
        )}

        {showIntegrated ? (
          <>
            <IntegratedTableView data={integratedSystem} />

            <button onClick={exportToExcel} className="toggle-button">
              Експорт в Excel
            </button>
            
            <PDFExporter data={integratedSystem} />

          </>
        ) : (
          <>
            {hasPhytophthora && (
              <div className="card-section">
                <h3
                  onClick={() => toggleDisease("Фітофтороз")}
                  style={{
                    cursor: "pointer",
                    userSelect: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  Рекомендовані внесення (проти: Фітофтороз)
                  <span style={{ fontSize: "18px", marginLeft: "10px" }}>
                    {expandedDiseases["Фітофтороз"] ? "▲" : "▼"}
                  </span>
                </h3>

                {expandedDiseases["Фітофтороз"] && (
                  sprayData.length > 0 ? (
                    <CardView
                      entries={sprayData}
                      title=""
                      diagnostics={diagnostics}
                      plantingDate={plantingDate}
                      rainDaily={aggregatedRain}
                      hourlyData={enrichedHourlyData}
                    />
                  ) : (
                    <p style={{ color: "#666", fontStyle: "italic", marginLeft: "10px" }}>
                      Ризиків за обраний період не визначено
                    </p>
                  )
                )}
              </div>
            )}

            {diseaseCardsGrouped?.map(({ name, entries }) => (
              <div key={name} className="card-section">
                <h3
                  onClick={() => toggleDisease(name)}
                  style={{
                    cursor: "pointer",
                    userSelect: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  Рекомендовані внесення (проти: {name})
                  <span style={{ fontSize: "18px", marginLeft: "10px" }}>
                    {expandedDiseases[name] ? "▲" : "▼"}
                  </span>
                </h3>

                {expandedDiseases[name] && (
                  entries.length > 0 ? (
                    <CardView
                      entries={entries}
                      title=""
                      diagnostics={diagnostics}
                      plantingDate={plantingDate}
                      rainDaily={aggregatedRain}
                      hourlyData={enrichedHourlyData}
                    />
                  ) : (
                    <p style={{ color: "#666", fontStyle: "italic", marginLeft: "10px" }}>
                      Ризиків за обраний період не визначено
                    </p>
                  )
                )}
              </div>
            ))}
            <div style={{ display: "flex", gap: "12px", marginTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                <button className="toggle-button" onClick={toggleAllCards}>
                  {isAllExpanded ? "Згорнути всі картки" : "Розгорнути всі картки"}
                </button>
              </div>
            </div>

            <button
              className="restart-button"
              onClick={() => {
                if (topRef.current) {
                  topRef.current.scrollIntoView({ behavior: "smooth" });
                } else {
                  console.warn("❗ topRef не знайдено");
                }
              }}
            >
              ↑ Вгору
            </button>
          </>
        )}
      </div>

      <ModalWithWeather
        open={weatherModalOpen}
        onOpenChange={setWeatherModalOpen}
        startDate={plantingDate}
        endDate={harvestDate}
        lat={result.lat}
        lon={result.lon}
        hourlyData={hourlyData}
      />
      <ModalWithSummary
        open={summaryModalOpen}
        onOpenChange={setSummaryModalOpen}
        startDate={plantingDate}
        endDate={harvestDate}
        diagnostics={diagnostics}
        rainDaily={rainDaily}
        integratedTreatments={integratedSystem}
      />
      <IntegratedTableView 
        data={integratedSystem} 
        isOpen={showIntegratedModal} 
        onClose={() => setShowIntegratedModal(false)} 
        />
    </main>
  );
}