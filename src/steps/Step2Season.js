import React, { useState } from "react";
import { Info, Calendar, ArrowRight } from "lucide-react";

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

  // Розрахунок тривалості сезону
  const getSeasonDuration = () => {
    if (!plantingDate || !harvestDate) return 0;
    const start = new Date(plantingDate);
    const end = new Date(harvestDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  };

  // Форматування дати для відображення
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long"
    });
  };

  const seasonDuration = getSeasonDuration();

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
            <div className="bg-blue-50 border border-blue-200 text-sm text-gray-700 p-4 rounded-md shadow-sm">
              Вкажіть початок і кінець сезону, а також оберіть хвороби для прогнозування.
            </div>
          )}

          {/* ТАЙМЛАЙН */}
          {(plantingDate || harvestDate) && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Calendar size={18} />
                Тривалість сезону
              </h3>
              
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700">
                  {plantingDate ? formatDisplayDate(plantingDate) : "Оберіть дату"}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {harvestDate ? formatDisplayDate(harvestDate) : "Оберіть дату"}
                </div>
              </div>

              {/* Шкала часу */}
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                  style={{ 
                    width: plantingDate && harvestDate ? '100%' : '0%' 
                  }}
                />
                
                {/* Маркери */}
                {plantingDate && (
                  <div className="absolute top-1/2 left-0 w-3 h-3 bg-white border-2 border-green-600 rounded-full transform -translate-y-1/2 -translate-x-1/2 shadow-sm" />
                )}
                {harvestDate && (
                  <div className="absolute top-1/2 right-0 w-3 h-3 bg-white border-2 border-blue-600 rounded-full transform -translate-y-1/2 translate-x-1/2 shadow-sm" />
                )}
              </div>

              {/* Інформація про тривалість */}
              {seasonDuration > 0 && (
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-600">
                    Початок: <strong>{formatDisplayDate(plantingDate)}</strong>
                  </span>
                  <span className="text-xs font-medium bg-white px-2 py-1 rounded border">
                    {seasonDuration} днів
                  </span>
                  <span className="text-xs text-gray-600">
                    Кінець: <strong>{formatDisplayDate(harvestDate)}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Поля дат */}
          <div className="flex flex-col sm:flex-row items-end gap-4 sm:gap-6">
            <div className="flex flex-col w-full">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Дата висадки (або останнє внесення фунгіциду):
              </label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>

            <div className="flex flex-col w-full">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Дата збирання:
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>
          </div>

          {/* Чекбокси */}
          <div>
            <label className="block font-medium text-gray-800 mb-2">
              Оберіть хвороби для моделювання:
            </label>
            <div className="space-y-2 pl-2">
              {/* Вибрати всі */}
              <label className="flex items-center gap-2 font-medium text-gray-900">
                <input
                  type="checkbox"
                  checked={diseases.length === allDiseases.length}
                  onChange={toggleSelectAll}
                />
                Вибрати всі
              </label>

              {/* Список хвороб */}
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
                  />
                  {d.name}
                </label>
              ))}
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex justify-between pt-4">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition flex items-center gap-2"
            >
              Назад
            </button>
            <button
              onClick={() => onNext({ diseases })}
              disabled={!plantingDate || !harvestDate}
              className={`px-4 py-2 rounded text-white font-medium transition flex items-center gap-2 ${
                plantingDate && harvestDate
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