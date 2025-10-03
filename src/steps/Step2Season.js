import React, { useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Info } from "lucide-react";
import uk from "date-fns/locale/uk";

registerLocale("uk", uk); // локалізація

export default function Step2Season({
  plantingDate,
  setPlantingDate,
  harvestDate,
  setHarvestDate,
  onNext,
  onBack,
}) {
  const [diseases, setDiseases] = useState(["lateBlight"]);
  const [showInfo, setShowInfo] = useState(false);

  const toggleDisease = (disease) => {
    setDiseases((prev) =>
      prev.includes(disease)
        ? prev.filter((d) => d !== disease)
        : [...prev, disease]
    );
  };

  const isDateInvalid =
    plantingDate && harvestDate && harvestDate < plantingDate;

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-md p-6 space-y-6">

      {/* Заголовок з інфо-кнопкою */}
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

      {/* Інформаційний блок */}
      {showInfo && (
        <div className="bg-blue-50 border border-blue-200 text-sm text-gray-700 p-4 rounded-md shadow-sm">
          Вкажіть початок і кінець сезону, а також оберіть хвороби для прогнозування.
        </div>
      )}

      {/* Дати */}
      <div className="flex flex-col sm:flex-row sm:gap-6 gap-4">
        <div className="flex flex-col w-full sm:w-1/2">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Дата висадки (або останнє внесення фунгіциду):
          </label>
          <DatePicker
            selected={plantingDate}
            onChange={(date) => setPlantingDate(date)}
            dateFormat="dd.MM.yyyy"
            placeholderText="Оберіть дату"
            locale="uk"
            maxDate={new Date()}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex flex-col w-full sm:w-1/2">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Дата збирання:
          </label>
          <DatePicker
            selected={harvestDate}
            onChange={(date) => setHarvestDate(date)}
            dateFormat="dd.MM.yyyy"
            placeholderText="Оберіть дату"
            locale="uk"
            minDate={plantingDate}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-[16px] focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Помилка при некоректних датах */}
      {isDateInvalid && (
        <div className="text-sm text-red-600">
          ⚠️ Дата збирання не може бути раніше дати висадки.
        </div>
      )}

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

      {/* Кнопки */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Назад
        </button>
        <button
          onClick={() => onNext({ diseases })}
          disabled={!plantingDate || !harvestDate || isDateInvalid}
          className={`px-4 py-2 rounded text-white font-medium transition ${
            !plantingDate || !harvestDate || isDateInvalid
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          Продовжити
        </button>
      </div>
    </div>
  );
}
