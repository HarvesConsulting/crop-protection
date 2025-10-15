import ModalWithSummary from "../components/ModalWithSummary";
import React, { useState, useEffect } from "react";
import "./Step4Results.css";
import * as XLSX from "xlsx";
import HourTimeline from "../components/HourTimeline";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ModalWithWeather from "../components/ModalWithWeather";
import { extractSuitableSprayHours } from "../engine";
import IntegratedTableView from "../components/IntegratedTableView";
import ActionMenu from "../components/ActionMenu";
import PDFExporter from "../components/PDFExporter";
import { Modal, Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { parseISO, format, differenceInDays, isValid } from 'date-fns';

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

// МОДАЛЬНЕ ВІКНО ДЛЯ КАРТКИ - ПОКРАЩЕНА ВЕРСІЯ
function CardModal({ open, onClose, cardData }) {
  if (!cardData) return null;

  const getCardClass = () => {
    const hours = cardData.backData?.condHours ?? 0;
    if (hours <= 10) return "card-green";
    if (hours <= 20) return "card-yellow";
    return "card-red";
  };

  const getStatusText = () => {
    const hours = cardData.backData?.condHours ?? 0;
    if (hours <= 10) return "🟢 Низький ризик";
    if (hours <= 20) return "🟡 Середній ризик";
    return "🔴 Високий ризик";
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="card-modal-container">
        <div className="card-modal-header">
          <Typography variant="h6" component="h2">
            📋 Картка обробки #{cardData.index}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
        
        <div className={`card-modal-content ${getCardClass()}`}>
          {/* СТАТУС РИЗИКУ */}
          <div className="card-modal-section risk-status">
            <Typography variant="subtitle1" gutterBottom style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getStatusText()}
            </Typography>
          </div>

          <div className="card-modal-section">
            <Typography variant="subtitle1" gutterBottom style={{ fontWeight: '600' }}>
              📅 Основна інформація
            </Typography>
            <div className="card-modal-grid">
              <div className="card-modal-item">
                <strong>Дата:</strong> {cardData.Дата}
              </div>
              <div className="card-modal-item">
                <strong>Препарат:</strong> {cardData.Препарат}
              </div>
              <div className="card-modal-item">
                <strong>Інтервал:</strong> {cardData.Інтервал}
              </div>
            </div>
          </div>

          <div className="card-modal-section">
            <Typography variant="subtitle1" gutterBottom style={{ fontWeight: '600' }}>
              📖 Рекомендації
            </Typography>
            <div className="card-modal-item">
              {cardData.Рекомендація}
            </div>
          </div>

          {cardData["Рекомендовані години"] && cardData["Рекомендовані години"] !== "—" && (
            <div className="card-modal-section">
              <Typography variant="subtitle1" gutterBottom style={{ fontWeight: '600' }}>
                🕒 Сприятливі години для обробки
              </Typography>
              <div className="card-modal-item">
                <HourTimeline
                  date={cardData.Дата}
                  suitableHours={cardData["Рекомендовані години"].split(", ").map((h) => h.trim())}
                  hourlyData={cardData.hourlyData || []}
                />
              </div>
            </div>
          )}

          <div className="card-modal-section">
            <Typography variant="subtitle1" gutterBottom style={{ fontWeight: '600' }}>
              🌤️ Погодні умови періоду
            </Typography>
            <div className="weather-stats">
              <div className="weather-stat">
                <span className="stat-value">{cardData.backData?.condHours ?? 0}</span>
                <span className="stat-label">Сприятливі години</span>
              </div>
              <div className="weather-stat">
                <span className="stat-value">
                  {cardData.backData?.rain !== undefined ? cardData.backData.rain.toFixed(1) : 0} мм
                </span>
                <span className="stat-label">Опади</span>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </Modal>
  );
}

// КОМПОНЕНТ ТАБЛИЦІ
function TreatmentTable({ data, title, onCardClick }) {
  if (!data || data.length === 0) {
    return (
      <div className="treatment-table-section">
        <h3 className="table-section-title">{title}</h3>
        <p className="no-data-message">Обробок не заплановано</p>
      </div>
    );
  }

  return (
    <div className="treatment-table-section">
      <h3 className="table-section-title">{title}</h3>
      <div className="table-container">
        <table className="treatment-table">
          <thead>
            <tr>
              <th>№</th>
              <th>Дата</th>
              <th>Препарат</th>
              <th>Норма</th>
              <th>кг(л)/га</th>
              <th>Рекомендації</th>
              <th>Картка</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const productName = item.Препарат.split(' (')[0];
              const normMatch = item.Препарат.match(/\(([^)]+)\)/);
              const norm = normMatch ? normMatch[1] : '—';
              const unit = norm.includes('л') ? 'л/га' : norm.includes('кг') ? 'кг/га' : '—';
              const normValue = norm.replace('л/га', '').replace('кг/га', '').trim();
              
              return (
                <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                  <td className="number-cell">{index + 1}</td>
                  <td className="date-cell">{item.Дата}</td>
                  <td className="product-cell">{productName}</td>
                  <td className="norm-cell">{normValue}</td>
                  <td className="unit-cell">{unit}</td>
                  <td className="recommendation-cell">
                    {item.Рекомендація}
                  </td>
                  <td className="card-cell">
                    <button 
                      className="card-button"
                      onClick={() => onCardClick({...item, index: index + 1})}
                      title="Переглянути детальну інформацію"
                    >
                      📋 Картка
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ДОПОМІЖНІ ФУНКЦІЇ
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

function getAccumulatedStats(diagnostics = [], prevDate, currentDate, rainDaily = []) {
  const start = typeof prevDate === "string" ? new Date(prevDate) : prevDate;
  const end = typeof currentDate === "string" ? new Date(currentDate) : currentDate;

  if (!start || !end || isNaN(start) || isNaN(end)) {
    return { rain: 0, condHours: 0 };
  }

  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

  const rainEntries = rainDaily.filter((entry) => {
    const entryDate = new Date(entry.date);
    const entryStr = format(entryDate, "yyyy-MM-dd");
    return entryStr >= startStr && entryStr <= endStr;
  });

  const condEntries = diagnostics.filter((entry) => {
    const entryDate = new Date(entry.date);
    const entryStr = format(entryDate, "yyyy-MM-dd");
    return entryStr >= startStr && entryStr <= endStr;
  });

  const rainSum = rainEntries.reduce((sum, entry) => {
    let value = Number(entry.rain ?? entry.precip ?? entry.opad);
    if (!isFinite(value) || value < 0) value = 0;
    return sum + value;
  }, 0);

  const hoursSum = condEntries.reduce((sum, entry) => {
    const h = Number(entry.condHours ?? entry.cond_hours ?? entry.hours);
    return sum + (isNaN(h) ? 0 : h);
  }, 0);

  return {
    rain: rainSum,
    condHours: hoursSum,
  };
}

// ОСНОВНИЙ КОМПОНЕНТ
export default function Step4Results({ result, onRestart }) {
  const [showIntegrated, setShowIntegrated] = useState(false);
  const [showIntegratedModal, setShowIntegratedModal] = useState(false);
  const topRef = React.useRef(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [weatherModalOpen, setWeatherModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const [sprayData, setSprayData] = useState([]);
  const [diseaseCardsGrouped, setDiseaseCardsGrouped] = useState([]);
  const [integratedSystem, setIntegratedSystem] = useState([]);
  const [enrichedHourlyData, setEnrichedHourlyData] = useState([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCardClick = (cardData) => {
    setSelectedCard({
      ...cardData,
      hourlyData: enrichedHourlyData
    });
    setCardModalOpen(true);
  };

  const handleCloseCard = () => {
    setCardModalOpen(false);
    setSelectedCard(null);
  };

  useEffect(() => {
    if (!result) return;

    const {
      sprayDates,
      diseaseSummary,
      suitableHours = {},
      diagnostics = [],
      rainDaily = [],
      hourlyData = [],
      plantingDate,
    } = result;

    // Обчислення sprayData для фітофторозу
    const calculatedSprayData = sprayDates.map((d, i) => {
      const cur = parseISO(d.split(".").reverse().join("-"));
      const prev = i > 0 ? parseISO(sprayDates[i - 1].split(".").reverse().join("-")) : plantingDate;

      const gap = prev ? `${differenceInDays(cur, prev)} діб після попередньої` : "—";
      const product = rotationProducts[i % rotationProducts.length];
      const recommendedHours = suitableHours[d] || [];
      const backData = getAccumulatedStats(diagnostics, prev, cur, rainDaily);

      return {
        Дата: d,
        Препарат: `${product} (${productInfo[product] || "—"})`,
        Рекомендація: productLinks[product] ? (
          <a href={productLinks[product]} target="_blank" rel="noreferrer">
            Деталі препарату
          </a>
        ) : "—",
        Інтервал: gap,
        "Рекомендовані години": recommendedHours.length ? recommendedHours.join(", ") : "—",
        backData,
      };
    });

    // Обчислення для інших хвороб
    const calculatedDiseaseCardsGrouped = diseaseSummary?.map(({ name, riskDates }) => {
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
        const prevDate = i === 0 ? plantingDate : treatments[i - 1].date;
        const backData = getAccumulatedStats(diagnostics, prevDate, item.date, rainDaily);

        return {
          Дата: dateStr,
          Препарат: `${product} (${productInfo[product] || "—"})`,
          Рекомендація: productLinks[product] ? (
            <a href={productLinks[product]} target="_blank" rel="noreferrer">
              Деталі препарату
            </a>
          ) : "—",
          Інтервал: i === 0 ? "—" : `${differenceInDays(item.date, treatments[i - 1].date)} діб після попередньої`,
          "Рекомендовані години": recommendedHours.length ? recommendedHours.join(", ") : "—",
          backData,
        };
      });

      return { name, entries };
    });

    // Інтегрована система
    const integratedMap = calculatedSprayData.map((spray) => {
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

    calculatedDiseaseCardsGrouped?.forEach((group) => {
      group.entries?.forEach((entry) => {
        const diseaseDate = parseISO(entry.Дата.split(".").reverse().join("-"));
        const diseaseTime = diseaseDate.getTime();
        let merged = false;

        for (const record of integratedMap) {
          const diff = Math.abs(record.timestamp - diseaseTime);
          if (diff <= 3 * 24 * 60 * 60 * 1000) {
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
      });
    });

    const calculatedIntegratedSystem = integratedMap
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

    // Збагачені погодні дані
    const suitableMap = extractSuitableSprayHours(hourlyData);
    const calculatedEnrichedHourlyData = hourlyData.map((entry) => {
      const dateStr = entry.date.toISOString().split('T')[0];
      const hourStr = String(entry.hour).padStart(2, "0") + ":00";
      const suitableEntry = suitableMap[dateStr]?.find((h) => h.hour === hourStr);
      return {
        ...entry,
        suitable: suitableEntry?.suitable === true,
      };
    });

    setSprayData(calculatedSprayData);
    setDiseaseCardsGrouped(calculatedDiseaseCardsGrouped || []);
    setIntegratedSystem(calculatedIntegratedSystem);
    setEnrichedHourlyData(calculatedEnrichedHourlyData);
  }, [result]);

  const exportToExcel = () => {
    const exportData = integratedSystem.map((entry) => ({
      Дата: entry.Дата,
      Препарати: entry.Препарат,
      Хвороби: entry.Хвороби,
    }));

    const ws = XLSX.utils.aoa_to_sheet([["Інтегрована система захисту"]]);
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
    XLSX.utils.sheet_add_json(ws, exportData, { origin: "A2", skipHeader: false });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Інтегрована таблиця");
    XLSX.writeFile(wb, "Інтегрована_таблиця_захисту.xlsx");
  };

  if (!result) return <p>Дані відсутні</p>;

  return (
    <main ref={topRef} className="step4-results-container">
      <div className="results-content">
        {/* Заголовок тепер вище меню дій */}
        <div className="results-header">
  <div className="step-title-container">
    <h2 className="step-title">Крок 4: Результати</h2>
    <button
      className="info-button"
      onClick={() => setShowInfo(!showInfo)}
      title="Показати інформацію"
    >
      <InfoOutlinedIcon />
    </button>
  </div>

  {showInfo && (
    <div className="info-panel">
      <p>
        Період розрахунку:{" "}
        <strong>{format(new Date(result.plantingDate), "dd.MM.yyyy")}</strong> —{" "}
        <strong>{format(new Date(result.harvestDate), "dd.MM.yyyy")}</strong>
      </p>
      <p>
        Нижче показано рекомендовані дати обробки. Натисніть "Картка" для перегляду 
        детальної інформації про погодні умови та рекомендації.
      </p>
    </div>
  )}
</div>

        {/* Меню дій тепер під заголовком */}
        <ActionMenu
          isMobile={isMobile}
          onRestart={onRestart}
          onShowWeather={() => setWeatherModalOpen(true)}
          onToggleIntegrated={() => setShowIntegratedModal(true)}
          showIntegrated={showIntegrated}
          onGoToCards={() => setShowIntegrated(false)}
          onShowSummary={() => setSummaryModalOpen(true)}
        />

        {showIntegrated ? (
          <>
            <IntegratedTableView data={integratedSystem} />
            <div className="action-buttons">
              <button onClick={exportToExcel} className="action-button">
                Експорт в Excel
              </button>
              <PDFExporter data={integratedSystem} />
            </div>
          </>
        ) : (
          <>
            {/* ТАБЛИЦЯ ДЛЯ ФІТОФТОРОЗУ */}
            {sprayData.length > 0 && (
              <TreatmentTable
                data={sprayData}
                title="Захисні заходи проти Фітофторозу"
                onCardClick={handleCardClick}
              />
            )}

            {/* ТАБЛИЦІ ДЛЯ ІНШИХ ХВОРОБ */}
            {diseaseCardsGrouped?.map(({ name, entries }) => (
              entries.length > 0 && (
                <TreatmentTable
                  key={name}
                  data={entries}
                  title={`Захисні заходи проти ${name}`}
                  onCardClick={handleCardClick}
                />
              )
            ))}

            <div className="action-buttons">
              <button
                className="scroll-top-button"
                onClick={() => topRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                ↑ Вгору
              </button>
            </div>
          </>
        )}

        {/* МОДАЛЬНЕ ВІКНО ДЛЯ КАРТКИ */}
        <CardModal
          open={cardModalOpen}
          onClose={handleCloseCard}
          cardData={selectedCard}
        />

        <ModalWithWeather
          open={weatherModalOpen}
          onOpenChange={setWeatherModalOpen}
          startDate={result.plantingDate}
          endDate={result.harvestDate}
          lat={result.lat}
          lon={result.lon}
          hourlyData={result.hourlyData}
        />
        
        <ModalWithSummary
          open={summaryModalOpen}
          onOpenChange={setSummaryModalOpen}
          startDate={result.plantingDate}
          endDate={result.harvestDate}
          diagnostics={result.diagnostics}
          rainDaily={result.rainDaily}
          integratedTreatments={integratedSystem}
        />
        
        <IntegratedTableView 
          data={integratedSystem} 
          isOpen={showIntegratedModal} 
          onClose={() => setShowIntegratedModal(false)} 
        />
      </div>
    </main>
  );
}