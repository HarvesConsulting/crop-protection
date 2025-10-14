import React, { useState } from "react";
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
              Вкажіть початок і кінець сезону, а також оберіть хвороби для прогнозування.
            </div>
          )}

          {/* Поля дат */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата висадки (або останнє внесення фунгіциду):
              </label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата збирання:
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Чекбокси хвороб */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block font-medium text-gray-800 mb-3">
              Оберіть хвороби для моделювання:
            </label>
            
            <div className="mb-3">
              <label className="flex items-center gap-2 font-medium text-gray-900">
                <input
                  type="checkbox"
                  checked={diseases.length === allDiseases.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-green-600 rounded"
                />
                Вибрати всі
              </label>
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
              disabled={!plantingDate || !harvestDate || diseases.length === 0}
              className={`px-6 py-2 rounded-lg text-white font-medium transition flex items-center gap-2 ${
                plantingDate && harvestDate && diseases.length > 0
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