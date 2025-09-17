import AppIntro from "./components/AppIntro";
import React, { useState } from "react";
import Step1Region from "./steps/Step1Region";
import Step2Season from "./steps/Step2Season";
import Step3Run from "./steps/Step3Run";
import Step4Results from "./steps/Step4Results";

export default function App() {
  const [step, setStep] = useState(1);

  const [region, setRegion] = useState(null);
  const [plantingDate, setPlantingDate] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [useForecast, setUseForecast] = useState(false);
  const [diseases, setDiseases] = useState(["lateBlight"]); // ✅ Новий стан

  const [result, setResult] = useState(null);

  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="main-container" style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
      <ProgressBar step={step} />

      {/* ВСТАВКА опису тільки на першому кроці */}
      {step === 1 && <AppIntro />}

      {step === 1 && (
        <Step1Region region={region} setRegion={setRegion} onNext={next} />
      )}

      {step === 2 && (
        <Step2Season
          plantingDate={plantingDate}
          setPlantingDate={setPlantingDate}
          harvestDate={harvestDate}
          setHarvestDate={setHarvestDate}
          useForecast={useForecast}
          setUseForecast={setUseForecast}
          onNext={({ diseases }) => {
            setDiseases(diseases); // ✅ Зберігаємо вибір
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
          useForecast={useForecast}
          diseases={diseases} // ✅ Передаємо у Step3
          onResult={(res) => {
            setResult(res);
            next();
          }}
          onBack={back}
        />
      )}

      {step === 4 && (
        <Step4Results result={result} onRestart={() => setStep(1)} />
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
