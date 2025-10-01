import React, { useState } from "react";

export default function Step2Season({
  plantingDate,
  setPlantingDate,
  harvestDate,
  setHarvestDate,
  onNext,
  onBack,
}) {
  const [diseases, setDiseases] = useState(["lateBlight"]);

  const toggleDisease = (disease) => {
    setDiseases((prev) =>
      prev.includes(disease)
        ? prev.filter((d) => d !== disease)
        : [...prev, disease]
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Крок 2: Дані про сезон 🌿
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Вкажіть початок і кінець сезону, а також оберіть хвороби для прогнозування.
      </p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Дата висадки (або останнє внесення фунгіциду):
        </label>
        <input
          type="date"
          value={plantingDate}
          onChange={(e) => setPlantingDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Дата збирання:
        </label>
        <input
          type="date"
          value={harvestDate}
          onChange={(e) => setHarvestDate(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-6">
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
          className={`px-4 py-2 rounded text-white transition ${
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
