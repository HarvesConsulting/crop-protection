import React, { useState, useEffect } from "react";
import {
  rotationProducts,
  rotationGrayMold,
  rotationAlternaria,
  rotationBacteriosis,
  getAdvancedTreatments,
} from "./data/productData";
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  if (!user) return <LoginPage onLogin={setUser} />;

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  function extractCalendarEvents(res) {
    if (!res) return [];

    const events = [];
    const { sprayDates, diseaseSummary } = res;

    const parseDateStr = (str) => {
      const [day, month, year] = str.split(".");
      return new Date(`${year}-${month}-${day}`);
    };

    sprayDates.forEach((dateStr, i) => {
      events.push({
        date: parseDateStr(dateStr),
        title: `Обробка ${i + 1}`,
        description: `Фітофтороз: ${rotationProducts[i % rotationProducts.length]}`,
      });
    });

    diseaseSummary?.forEach(({ name, riskDates }) => {
      const rotation = {
        "Сіра гниль": rotationGrayMold,
        "Альтернаріоз": rotationAlternaria,
        "Бактеріоз": rotationBacteriosis,
      }[name] || [];

      const selected = getAdvancedTreatments(riskDates);
      selected.forEach((item, i) => {
        events.push({
          date: item.date,  // це Date
          title: `Обробка (${name})`,
          description: `${rotation[i % rotation.length]}`,
        });
      });
    });

    return events;
  }

  return (
    <div className="main-container" style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <LogoutButton onLogout={() => setUser(null)} />
      </div>

      <ProgressBar step={step} />

      {step === 1 && <AppIntro />}
      {step === 1 && <Step1Region region={region} setRegion={setRegion} onNext={next} />}

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

      {step === 3 && (
        <Step3Run
          region={region}
          plantingDates={plantingDate}
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
