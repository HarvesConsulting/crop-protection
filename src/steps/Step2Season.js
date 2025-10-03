import React, { useState } from "react";
import { Info } from "lucide-react"; // ⬅️ переконайся, що встановлено: npm i lucide-react

export default function Step2Season({
  plantingDate,
  setPlantingDate,
  harvestDate,
  setHarvestDate,
  onNext,
  onBack,
}) {
  const [diseases, setDiseases] = useState(["lateBlight"]);
  const [showInfo, setShowInfo] = useState(false); // ⬅️ новий стейт

  const toggleDisease = (disease) => {
    setDiseases((prev) =>
      prev.includes(disease)
        ? prev.filter((d) => d !== disease)
        : [...prev, disease]
    );
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-md pl-8 pr-4 sm:pl-10 sm:pr-6 py-6 space-y-6">
      {/* Заголовок з кнопкою "Інфо" */}
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

      {/* Інфо-бокс */}
      {showInfo && (
        <div className="bg-blue-50 border border-blue-200 text-sm text-gray-700 p-4 rounded-md shadow-sm">
          Вкажіть початок і кінець сезону, а також оберіть хвороби для прогнозування.
        </div>
      )}

      {/* Поля для введення дат */}
     <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
  {/* Перша колонка */}
  <div className="flex flex-col flex-1">
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

  {/* Друга колонка */}
  <div className="flex flex-col flex-1 ml-2 sm:ml-4">
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
          {[
            { id: "lateBlight", name: "Фітофтороз" },
            { id: "grayMold", name: "Сіра гниль" },
            { id: "alternaria", name: "Альтернаріоз" },
            { id: "bacteriosis", name: "Бактеріоз" },
          ].map((disease) => (
            <label key={disease.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={diseases.includes(disease.id)}
                onChange={() => toggleDisease(disease.id)}
              />
              {disease.name}
            </label>
          ))}
        </div>
      </div>

      {/* Кнопки навігації */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Назад
        </button>
        <button
          onClick={() => onNext({ diseases })}
          disabled={!plantingDate || !harvestDate}
          className={`px-4 py-2 rounded text-white font-medium transition ${
            plantingDate && harvestDate
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Продовжити
        </button>
      </div>
    </div>
  );
}
