import {
  rotationProducts,
  rotationGrayMold,
  rotationAlternaria,
  rotationBacteriosis,
  getAdvancedTreatments,
} from "./data/productData";
import React, { useState, useEffect } from "react";
import LogoutButton from "./components/LogoutButton";
import AppIntro from "./components/AppIntro";
import Step1Region from "./steps/Step1Region";
import Step2Season from "./steps/Step2Season";
import Step3Run from "./steps/Step3Run";
import Step4Results from "./steps/Step4Results";
import LoginPage from "./components/LoginPage";
import CalendarView from "./components/CalendarView";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export default function App() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [region, setRegion] = useState(null);
  const [plantingDate, setPlantingDate] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [useForecast, setUseForecast] = useState(false);
  const [diseases, setDiseases] = useState(["lateBlight"]);
  const [result, setResult] = useState(null);

  // 🔁 Автоматична перевірка авторизації
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 🔐 Якщо не авторизований — показати сторінку входу
  if (!user) return <LoginPage onLogin={setUser} />;

  // 🔁 Переходи між кроками
  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  // 🔘 Події для календаря (можна буде замінити на реальні)
  const mockEvents = [
    { date: "20.09.2025", title: "Обробка 1", description: "Фітофтороз: Зорвек Інкантія" },
    { date: "25.09.2025", title: "Обробка 2", description: "Сіра гниль: Сігнум" },
  ];

  return (
    <div className="main-container" style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      {/* 🔐 Кнопка виходу */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <LogoutButton onLogout={() => setUser(null)} />
      </div>

      {/* 🔢 Прогресбар */}
      <ProgressBar step={step} />

      {/* 📘 Вступна інформація */}
      {step === 1 && <AppIntro />}

      {/* Крок 1 — Вибір регіону */}
      {step === 1 && (
        <Step1Region region={region} setRegion={setRegion} onNext={next} />
      )}

      {/* Крок 2 — Вибір сезону */}
      {step === 2 && (
        <Step2Season
          plantingDate={plantingDate}
          setPlantingDate={setPlantingDate}
          harvestDate={harvestDate}
          setHarvestDate={setHarvestDate}
          useForecast={useForecast}
          setUseForecast={setUseForecast}
          onNext={({ diseases }) => {
            setDiseases(diseases);
            next();
          }}
          onBack={back}
        />
      )}

      {/* Крок 3 — Розрахунок */}
      {step === 3 && (
        <Step3Run
          region={region}
          plantingDate={plantingDate}
          harvestDate={harvestDate}
          useForecast={useForecast}
          diseases={diseases}
          onResult={(res) => {
            setResult(res);
            next();
          }}
          onBack={back}
        />
      )}

      {/* Крок 4 — Результати та календар */}
      {step === 4 && (
        <>
          <Step4Results result={result} onRestart={() => setStep(1)} />

          <h3 style={{ marginTop: 40 }}>Календар обробок</h3>
          <CalendarView events={extractCalendarEvents(result)} />
        </>
      )}
    </div>
  );
}

// 🔘 Прогресбар компонент
function ProgressBar({ step }) {
  const steps = ["Місто", "Сезон", "Розрахунок", "Результати"];
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
      {steps.map((label, i) => (
        <div
          key={i}
          style={{
            fontWeight: i + 1 === step ? "bold" : "normal",
            color: i + 1 === step ? "#2d6cdf" : "#999",
          }}
        >
          {i + 1}. {label}
        </div>
      ))}
    </div>
  );
}
function extractCalendarEvents(result) {
  if (!result) return [];

  const events = [];
  const { sprayDates, diseaseSummary } = result;

  // ➤ Обробки проти фітофторозу
  sprayDates.forEach((dateStr, i) => {
    events.push({
      date: dateStr, // у форматі дд.мм.рррр
      title: `Обробка ${i + 1}`,
      description: `Фітофтороз: ${rotationProducts[i % rotationProducts.length]}`,
    });
  });

  // ➤ Обробки проти інших хвороб
  diseaseSummary?.forEach(({ name, riskDates }) => {
    const rotation = {
      "Сіра гниль": rotationGrayMold,
      "Альтернаріоз": rotationAlternaria,
      "Бактеріоз": rotationBacteriosis,
    }[name] || [];

    const selected = getAdvancedTreatments(riskDates);
    selected.forEach((item, i) => {
      events.push({
        date: item.date.toLocaleDateString("uk-UA"), // дд.мм.рррр
        title: `Обробка (${name})`,
        description: `${rotation[i % rotation.length]}`,
      });
    });
  });

  return events;
}
