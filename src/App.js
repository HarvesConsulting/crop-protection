import AdminPanel from "./components/AdminPanel";
import LogoutButton from "./components/LogoutButton";
import AppIntro from "./components/AppIntro";
import React, { useState, useEffect } from "react";
import Step1Region from "./steps/Step1Region";
import Step2Season from "./steps/Step2Season";
import Step3Run from "./steps/Step3Run";
import Step4Results from "./steps/Step4Results";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import LoginPage from "./components/LoginPage";

export default function App() {
  // ✅ Всі хуки викликаються одразу на початку
  const [user, setUser] = useState(null); // 🔐 Користувач
  const [step, setStep] = useState(1);
  const [region, setRegion] = useState(null);
  const [plantingDate, setPlantingDate] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [useForecast, setUseForecast] = useState(false);
  const [diseases, setDiseases] = useState(["lateBlight"]);
  const [result, setResult] = useState(null);

  // 🔁 Перевірка аутентифікації
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 🔐 Якщо не авторизований — показати логін
  if (!user) return <LoginPage onLogin={setUser} />;

// ❗️ Твій email як "суперадмін"
if (user.email === "lashyn.aleksandr@gmail.com") {
  return <AdminPanel />;
}

  // 👉 Функції переходу
  const next = () => setStep((s) => Math.min(s + 1, 4));
  const back = () => setStep((s) => Math.max(s - 1, 1));

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

      {/* Крок 2 — Сезон */}
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

      {/* Крок 4 — Результати */}
      {step === 4 && (
        <Step4Results result={result} onRestart={() => setStep(1)} />
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
