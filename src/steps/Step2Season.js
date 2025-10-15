import React, { useState, useEffect } from "react";
import { Info, ArrowRight } from "lucide-react";

export default function Step2Season({
  plantingDate,
  setPlantingDate,
  harvestDate,
  setHarvestDate,
  onNext,
  onBack,
}) {
  const allDiseases = ["lateBlight", "grayMold", "alternaria", "bacteriosis"];
  const [diseases, setDiseases] = useState(["lateBlight"]);
  const [showInfo, setShowInfo] = useState(false);
  const [calculationPeriod, setCalculationPeriod] = useState("15");
  const [maxPeriod, setMaxPeriod] = useState(45);

  // Встановлення поточної дати за замовчуванням
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    if (!plantingDate) {
      setPlantingDate(formattedDate);
    }
  }, [plantingDate, setPlantingDate]);

  // Розрахунок максимального періоду (поточна дата + 15 днів)
  useEffect(() => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 15);
    
    if (plantingDate) {
      const startDate = new Date(plantingDate);
      const diffTime = maxDate - startDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setMaxPeriod(Math.max(1, diffDays)); // Мінімум 1 день
    } else {
      setMaxPeriod(45); // Значення за замовчуванням
    }
  }, [plantingDate]);

  // Оновлення дати завершення при зміні точки відліку або періоду
  useEffect(() => {
    if (plantingDate && calculationPeriod && parseInt(calculationPeriod) > 0) {
      const period = parseInt(calculationPeriod);
      const startDate = new Date(plantingDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + period);
      
      // Форматуємо дату у формат YYYY-MM-DD
      const formattedDate = endDate.toISOString().split('T')[0];
      setHarvestDate(formattedDate);
    }
  }, [plantingDate, calculationPeriod, setHarvestDate]);

  const toggleDisease = (disease) => {
    setDiseases((prev) =>
      prev.includes(disease)
        ? prev.filter((d) => d !== disease)
        : [...prev, disease]
    );
  };

  const toggleSelectAll = () => {
    if (diseases.length === allDiseases.length) {
      setDiseases([]);
    } else {
      setDiseases(allDiseases);
    }
  };

  const handleCalculationPeriodChange = (e) => {
    const value = e.target.value;
    
    // Дозволяємо пустий рядок або числа
    if (value === "" || /^\d+$/.test(value)) {
      const numValue = value === "" ? "" : parseInt(value);
      
      // Якщо число, перевіряємо межі
      if (numValue !== "") {
        if (numValue < 1) {
          setCalculationPeriod("1");
        } else if (numValue > maxPeriod) {
          setCalculationPeriod(maxPeriod.toString());
        } else {
          setCalculationPeriod(value);
        }
      } else {
        setCalculationPeriod("");
      }
    }
  };

  const handleCalculationPeriodBlur = (e) => {
    // При втраті фокусу нормалізуємо значення
    if (calculationPeriod === "" || parseInt(calculationPeriod) < 1) {
      setCalculationPeriod("1");
    } else if (parseInt(calculationPeriod) > maxPeriod) {
      setCalculationPeriod(maxPeriod.toString());
    }
  };

  const handleNext = () => {
    if (!plantingDate || !calculationPeriod || parseInt(calculationPeriod) < 1) {
      alert("Будь ласка, оберіть точку відліку та коректний період розрахунку");
      return;
    }
    if (diseases.length === 0) {
      alert("Будь ласка, оберіть хоча б одну хворобу");
      return;
    }
    onNext({ diseases });
  };

  // Розрахунок дати завершення для відображення
  const getEndDateDisplay = () => {
    if (!plantingDate || !calculationPeriod || parseInt(calculationPeriod) < 1) return "";
    
    const period = parseInt(calculationPeriod);
    const startDate = new Date(plantingDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + period);
    
    return endDate.toLocaleDateString('uk-UA');
  };

  const isAllSelected = diseases.length === allDiseases.length;

  return (
    <main className="flex justify-center items-start min-h-[70vh] px-3 sm:px-4">
      <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="px-4 sm:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
          {/* Заголовок + Інфо */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
              Крок 2: Дані про сезон
            </h2>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-blue-600 hover:text-blue-800 transition p-1"
              title="Інформація"
            >
              <Info size={22} />
            </button>
          </div>

          {showInfo && (
            <div className="bg-blue-50 border border-blue-200 text-sm text-gray-700 p-3 sm:p-4 rounded-lg leading-relaxed">
              <p className="mb-2">
                <strong>Точка відліку</strong> - це дата початку розрахунків. Це може бути дата сходів чи висадки культури, 
                або дата останнього внесення фунгіциду.
              </p>
              <p>
                <strong>Період розрахунку</strong> не може перевищувати 15 днів від поточної дати для забезпечення точності прогнозу.
              </p>
            </div>
          )}

          {/* Поля вводу */}
          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
                📅 Точка відліку
              </label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Дата висадки або останнього внесення фунгіциду
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
                ⏱️ Період розрахунку
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={maxPeriod}
                    value={calculationPeriod}
                    onChange={handleCalculationPeriodChange}
                    onBlur={handleCalculationPeriodBlur}
                    className="w-20 sm:w-24 border border-gray-300 rounded-xl px-4 py-3 text-base text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-700 whitespace-nowrap">
                    днів (макс.: {maxPeriod})
                  </span>
                </div>
              </div>
              
              {plantingDate && calculationPeriod && parseInt(calculationPeriod) > 0 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-800 font-medium">
                    <span className="block mb-1">📌 Дата завершення:</span>
                    <span className="text-base">{getEndDateDisplay()}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Чекбокси хвороб */}
          <div className="border border-gray-200 rounded-xl p-4 sm:p-5">
            <label className="block font-semibold text-gray-800 mb-3 text-sm sm:text-base">
              🦠 Оберіть хвороби для моделювання:
            </label>
            
            {/* Кнопка "Вибрати всі" */}
            <div className="mb-4">
              <button
                onClick={toggleSelectAll}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all font-semibold text-sm sm:text-base ${
                  isAllSelected
                    ? "bg-green-100 border-green-400 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {isAllSelected ? "✅ Всі хвороби обрані" : "📋 Вибрати всі хвороби"}
              </button>
            </div>

            <div className="space-y-3">
              {[
                { id: "lateBlight", name: "Фітофтороз"},
                { id: "grayMold", name: "Сіра гниль"},
                { id: "alternaria", name: "Альтернаріоз"},
                { id: "bacteriosis", name: "Бактеріоз"},
              ].map((d) => (
                <label key={d.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={diseases.includes(d.id)}
                    onChange={() => toggleDisease(d.id)}
                    className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <span className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
                    <span className="text-base">{d.emoji}</span>
                    {d.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-semibold text-gray-800 text-sm sm:text-base order-2 sm:order-1"
            >
              ← Назад
            </button>
            <button
              onClick={handleNext}
              disabled={!plantingDate || !calculationPeriod || parseInt(calculationPeriod) < 1 || diseases.length === 0}
              className={`px-6 py-3 rounded-xl text-white font-semibold transition flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2 ${
                plantingDate && calculationPeriod && parseInt(calculationPeriod) > 0 && diseases.length > 0
                  ? "bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Продовжити
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}