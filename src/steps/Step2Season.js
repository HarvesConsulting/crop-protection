import React, { useState } from "react";
import { Info, ArrowRight, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { uk } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

registerLocale('uk', uk);

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
  const [showCalendar, setShowCalendar] = useState(false);

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

  // Конвертація рядків в Date об'єкти для календаря
  const plantingDateObj = plantingDate ? new Date(plantingDate) : null;
  const harvestDateObj = harvestDate ? new Date(harvestDate) : null;

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setPlantingDate(start ? start.toISOString() : "");
    setHarvestDate(end ? end.toISOString() : "");
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

  const isDateValid = plantingDate && harvestDate && new Date(harvestDate) <= new Date(plantingDate);

  return (
    <main className="flex justify-center items-start min-h-[70vh] px-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="px-5 py-5 space-y-5">
          {/* Заголовок */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Крок 2: Дані про сезон
            </h2>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-gray-500 hover:text-gray-700 transition"
              title="Інформація"
            >
              <Info size={18} />
            </button>
          </div>

          {showInfo && (
            <div className="bg-gray-50 border border-gray-200 text-xs text-gray-600 p-3 rounded">
              Вкажіть початок і кінець сезону для аналізу ризиків захворювань
            </div>
          )}

          {/* Кнопка для відкриття календаря на десктопі */}
          <div className="hidden md:block">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <Calendar size={14} />
              {plantingDate && harvestDate ? "Змінити період" : "Обрати період у календарі"}
            </button>
          </div>

          {/* Календар для десктопу */}
          {showCalendar && (
            <div className="hidden md:block border border-gray-200 rounded p-3">
              <DatePicker
                selected={plantingDateObj}
                onChange={handleDateChange}
                startDate={plantingDateObj}
                endDate={harvestDateObj}
                selectsRange
                inline
                monthsShown={2}
                locale={uk}
                dateFormat="dd.MM.yyyy"
                shouldCloseOnSelect={false}
                className="react-datepicker-custom"
              />
              <div className="text-xs text-gray-500 text-center mt-2">
                Натисніть на дату висадки, потім на дату збирання
              </div>
            </div>
          )}

          {/* Поля дат для мобільних та альтернатива на десктопі */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Дата висадки або останньої обробки:
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
                <Calendar size={14} className="absolute right-3 top-2.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Дата збирання врожаю:
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                />
                <Calendar size={14} className="absolute right-3 top-2.5 text-gray-400" />
              </div>
            </div>

            {/* Інформація про обраний період */}
            {(plantingDate || harvestDate) && (
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <div className="text-xs text-green-700">
                  <div>Висадка: {plantingDate ? new Date(plantingDate).toLocaleDateString('uk-UA') : '—'}</div>
                  <div>Збирання: {harvestDate ? new Date(harvestDate).toLocaleDateString('uk-UA') : '—'}</div>
                </div>
              </div>
            )}

            {isDateValid && (
              <div className="bg-red-50 border border-red-200 rounded p-2">
                <p className="text-red-600 text-xs">
                  Дата збирання не може бути раніше дати висадки
                </p>
              </div>
            )}
          </div>

          {/* Вибір хвороб */}
          <div className="border border-gray-200 rounded p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Хвороби для моделювання:
            </label>
            
            <button
              onClick={toggleSelectAll}
              className={`w-full mb-3 px-3 py-2 rounded border transition-colors text-xs font-medium ${
                diseases.length === allDiseases.length
                  ? "bg-green-50 border-green-400 text-green-700"
                  : "bg-gray-50 border-gray-300 text-gray-600"
              }`}
            >
              {diseases.length === allDiseases.length ? "Скасувати вибір усіх" : "Вибрати всі хвороби"}
            </button>

            <div className="space-y-2">
              {[
                { id: "lateBlight", name: "Фітофтороз" },
                { id: "grayMold", name: "Сіра гниль" },
                { id: "alternaria", name: "Альтернаріоз" },
                { id: "bacteriosis", name: "Бактеріоз" },
              ].map((d) => (
                <label key={d.id} className="flex items-center gap-2 py-1">
                  <input
                    type="checkbox"
                    checked={diseases.includes(d.id)}
                    onChange={() => toggleDisease(d.id)}
                    className="w-3.5 h-3.5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{d.name}</span>
                </label>
              ))}
            </div>

            {diseases.length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Обрано: {diseases.length} з {allDiseases.length}
                </p>
              </div>
            )}
          </div>

          {/* Кнопки навігації */}
          <div className="flex justify-between gap-3 pt-4">
            <button
              onClick={onBack}
              className="flex-1 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition text-sm font-medium text-gray-700"
            >
              Назад
            </button>
            <button
              onClick={handleNext}
              disabled={!plantingDate || !harvestDate || diseases.length === 0 || isDateValid}
              className={`flex-1 px-4 py-2 rounded text-white text-sm font-medium transition flex items-center justify-center gap-1 ${
                plantingDate && harvestDate && diseases.length > 0 && !isDateValid
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Далі
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}