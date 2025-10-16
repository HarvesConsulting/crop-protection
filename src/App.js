import React, { useState, useEffect } from "react";
import Step1Region from "./steps/Step1Region";
import Step2Season from "./steps/Step2Season";
import Step3Run from "./steps/Step3Run";
import Step4Results from "./steps/Step4Results";
import LoginPage from "./components/LoginPage";
import CalendarView from "./components/CalendarView";
import Layout from "./components/Layout";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import {
  rotationProducts,
  rotationGrayMold,
  rotationAlternaria,
  rotationBacteriosis,
  getAdvancedTreatments,
} from "./data/productData";

function extractCalendarEvents(result) {
  if (!result) return [];
  const events = [];
  const { sprayDates, diseaseSummary } = result;

  const parseDateStr = (str) => {
    const [day, month, year] = str.split(".");
    return new Date(`${year}-${month}-${day}`);
  };

  // Фітофтороз
  sprayDates.forEach((dateStr, i) => {
    events.push({
      date: parseDateStr(dateStr),
      title: `Обробка ${i + 1}`,
      description: `Фітофтороз: ${rotationProducts[i % rotationProducts.length]}`,
    });
  });

  // Інші хвороби
  diseaseSummary?.forEach(({ name, riskDates }) => {
    const rotation = {
      "Сіра гниль": rotationGrayMold,
      "Альтернаріоз": rotationAlternaria,
      "Бактеріоз": rotationBacteriosis,
    }[name] || [];

    const selected = getAdvancedTreatments(riskDates);
    selected.forEach((item, i) => {
      events.push({
        date: item.date,
        title: `Обробка (${name})`,
        description: `${rotation[i % rotation.length]}`,
      });
    });
  });

  return events;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [region, setRegion] = useState(null);
  const [plantingDate, setPlantingDate] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [diseases, setDiseases] = useState(["lateBlight"]);
  const [result, setResult] = useState(null);
  const [appReady, setAppReady] = useState(false); // 🆕 splash screen state

  // Перевірка авторизації Firebase + splash
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      // затримка splash для плавності
      setTimeout(() => setAppReady(true), 1000);
    });
    return () => unsubscribe();
  }, []);

 

  // Якщо користувач не авторизований
  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  // Логіка кроків
  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <Layout step={step} onLogout={() => setUser(null)}>
      {step === 1 && (
        <Step1Region region={region} setRegion={setRegion} onNext={next} />
      )}

      {step === 2 && (
        <Step2Season
          plantingDate={plantingDate}
          setPlantingDate={setPlantingDate}
          harvestDate={harvestDate}
          setHarvestDate={setHarvestDate}
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
          plantingDate={plantingDate}
          harvestDate={harvestDate}
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
          <Step4Results
            result={result}
            onRestart={() => {
              setStep(1);
              setResult(null);
            }}
          />
          <CalendarView events={extractCalendarEvents(result)} />
        </>
      )}
    </Layout>
  );
}
