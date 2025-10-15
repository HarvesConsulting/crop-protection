import React, { useState, useEffect } from "react";
import { Info, ArrowRight, CheckSquare, Square } from "lucide-react";

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
  const [calculationPeriod, setCalculationPeriod] = useState("30");
  const [maxPeriod, setMaxPeriod] = useState(45);

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
    <main className="flex justify-center items-start min-h-[70vh] px-4">
      <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="px-6 sm:px-10 py-6 space-y-6">
          {/* Заголовок + Інфо */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              Крок 2: Дані про сезон
            </h2>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-blue-600 hover:text-blue-800 transition"
              title="Інформація"
            >
              <Info size={24} />
            </button>
          </div>

          {showInfo && (
            <div className="bg-blue-50 border border-blue-200 text-sm text-gray-700 p-4 rounded-md">
              Вкажіть точку відліку (дату початку розрахунків) та період розрахунку. 
              Період не може перевищувати 15 днів від поточної дати.
            </div>
          )}

          {/* Поля вводу */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Точка відліку (дата початку розрахунків):
              </label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Дата висадки або останнього внесення фунгіциду
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Період розрахунку (в днях):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max={maxPeriod}
                  value={calculationPeriod}
                  onChange={handleCalculationPeriodChange}
                  onBlur={handleCalculationPeriodBlur}
                  className="w-24 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600">
                  днів (макс.: {maxPeriod})
                </span>
              </div>
              
              {plantingDate && calculationPeriod && parseInt(calculationPeriod) > 0 && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    <strong>Дата завершення:</strong> {getEndDateDisplay()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Чекбокси хвороб */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block font-medium text-gray-800 mb-3">
              Оберіть хвороби для моделювання:
            </label>
            
            {/* Кнопка "Вибрати всі" */}
            <div className="mb-4">
              <button
                onClick={toggleSelectAll}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-medium ${
                  isAllSelected
                    ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                    : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                {isAllSelected ? (
                  <CheckSquare size={18} className="text-green-600" />
                ) : (
                  <Square size={18} className="text-gray-500" />
                )}
                {isAllSelected ? "Всі обрані" : "Вибрати всі"}
              </button>
            </div>

            <div className="space-y-2">
              {[
                { id: "lateBlight", name: "Фітофтороз" },
                { id: "grayMold", name: "Сіра гниль" },
                { id: "alternaria", name: "Альтернаріоз" },
                { id: "bacteriosis", name: "Бактеріоз" },
              ].map((d) => (
                <label key={d.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={diseases.includes(d.id)}
                    onChange={() => toggleDisease(d.id)}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-gray-700">{d.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-between pt-4">
            <button
              onClick={onBack}
              className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Назад
            </button>
            <button
              onClick={handleNext}
              disabled={!plantingDate || !calculationPeriod || parseInt(calculationPeriod) < 1 || diseases.length === 0}
              className={`px-6 py-2 rounded-lg text-white font-medium transition flex items-center gap-2 ${
                plantingDate && calculationPeriod && parseInt(calculationPeriod) > 0 && diseases.length > 0
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Продовжити
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}