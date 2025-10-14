import React, { useState } from "react";
import { Info, ArrowRight, Calendar } from "lucide-react";

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
  const [activeDateField, setActiveDateField] = useState(null);

  const toggleDisease = (disease) => {
    setDiseases((prev) =>
      prev.includes(disease)
        ? prev.filter((d) => d !== disease)
        : [...prev, disease]
    );
  };

  const toggleSelectAll = () => {
    setDiseases(diseases.length === allDiseases.length ? [] : allDiseases);
  };

  // Функція для форматування дати для відображення
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "Не обрано";
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const handleNext = () => {
    if (!plantingDate || !harvestDate) {
      alert("Будь ласка, оберіть дати сезону");
      return;
    }
    if (diseases.length === 0) {
      alert("Будь ласка, оберіть хоча б одну хворобу");
      return;
    }
    onNext({ diseases });
  };

  // Перевірка чи дата збирання не раніше дати висадки
  const isDateValid = plantingDate && harvestDate && new Date(harvestDate) <= new Date(plantingDate);

  return (
    <main className="flex justify-center items-start min-h-[70vh] px-4">
      <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="px-4 sm:px-6 py-6 space-y-6">
          {/* Заголовок + Інфо */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
              Крок 2: Дані про сезон
            </h2>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-blue-600 hover:text-blue-800 transition p-1"
              title="Інформація"
            >
              <Info size={20} />
            </button>
          </div>

          {showInfo && (
            <div className="bg-blue-50 border border-blue-200 text-sm text-gray-700 p-3 rounded-md">
              <p className="mb-2"><strong>Дата висадки:</strong> день посадки рослин або останньої обробки фунгіцидом</p>
              <p><strong>Дата збирання:</strong> очікуваний день збору врожаю</p>
            </div>
          )}

          {/* Поля дат з покращеним мобільним UX */}
          <div className="space-y-4">
            <div 
              className={`border-2 rounded-lg p-3 transition-colors ${
                activeDateField === 'planting' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200'
              }`}
              onClick={() => setActiveDateField('planting')}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📅 Дата висадки або останньої обробки:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                  onFocus={() => setActiveDateField('planting')}
                  onBlur={() => setActiveDateField(null)}
                  className="flex-1 border-0 bg-transparent focus:outline-none text-base"
                />
                <Calendar size={18} className="text-gray-400" />
              </div>
              {plantingDate && (
                <div className="text-sm text-green-600 mt-1">
                  Обрано: {formatDateForDisplay(plantingDate)}
                </div>
              )}
            </div>

            <div 
              className={`border-2 rounded-lg p-3 transition-colors ${
                activeDateField === 'harvest' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200'
              }`}
              onClick={() => setActiveDateField('harvest')}
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🗓️ Дата збирання врожаю:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  onFocus={() => setActiveDateField('harvest')}
                  onBlur={() => setActiveDateField(null)}
                  className="flex-1 border-0 bg-transparent focus:outline-none text-base"
                />
                <Calendar size={18} className="text-gray-400" />
              </div>
              {harvestDate && (
                <div className="text-sm text-blue-600 mt-1">
                  Обрано: {formatDateForDisplay(harvestDate)}
                </div>
              )}
            </div>

            {/* Попередження про некоректні дати */}
            {isDateValid && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">
                  ⚠️ Дата збирання не може бути раніше дати висадки
                </p>
              </div>
            )}
          </div>

          {/* Чекбокси хвороб з покращеним мобільним виглядом */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block font-medium text-gray-800 mb-4 text-lg">
              🦠 Оберіть хвороби для моделювання:
            </label>
            
            {/* Кнопка "Вибрати всі" */}
            <button
              onClick={toggleSelectAll}
              className={`w-full mb-4 px-4 py-3 rounded-lg border transition-colors text-sm font-medium ${
                diseases.length === allDiseases.length
                  ? "bg-green-100 border-green-500 text-green-700"
                  : "bg-gray-100 border-gray-300 text-gray-700"
              }`}
            >
              {diseases.length === allDiseases.length ? "✅ Скасувати вибір усіх" : "☑️ Вибрати всі хвороби"}
            </button>

            {/* Список хвороб у вигляді великих кнопок для мобільних */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: "lateBlight", name: "Фітофтороз", icon: "🍅" },
                { id: "grayMold", name: "Сіра гниль", icon: "🍄" },
                { id: "alternaria", name: "Альтернаріоз", icon: "🥬" },
                { id: "bacteriosis", name: "Бактеріоз", icon: "🦠" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => toggleDisease(d.id)}
                  className={`p-3 rounded-lg border-2 transition-all text-left ${
                    diseases.includes(d.id)
                      ? "border-green-500 bg-green-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      diseases.includes(d.id) 
                        ? "bg-green-500 border-green-500" 
                        : "bg-white border-gray-300"
                    }`}>
                      {diseases.includes(d.id) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </div>
                    <span className="text-2xl">{d.icon}</span>
                    <span className="font-medium text-gray-800 flex-1">{d.name}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Індикатор вибраних хвороб */}
            {diseases.length > 0 && (
              <div className="mt-4 p-2 bg-gray-50 rounded text-sm text-gray-600">
                Обрано хвороб: {diseases.length} з {allDiseases.length}
              </div>
            )}
          </div>

          {/* Кнопки навігації з фіксованим положенням на мобільних */}
          <div className="flex justify-between gap-3 pt-4 sticky bottom-4 bg-white p-2 rounded-lg shadow-lg">
            <button
              onClick={onBack}
              className="flex-1 px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition font-medium text-gray-800"
            >
              Назад
            </button>
            <button
              onClick={handleNext}
              disabled={!plantingDate || !harvestDate || diseases.length === 0 || isDateValid}
              className={`flex-1 px-4 py-3 rounded-lg text-white font-medium transition flex items-center justify-center gap-2 ${
                plantingDate && harvestDate && diseases.length > 0 && !isDateValid
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Далі
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}