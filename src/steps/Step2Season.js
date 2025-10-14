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
      <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="px-6 sm:px-8 py-6 space-y-6">
          {/* Заголовок */}
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
              Вкажіть початок і кінець сезону для аналізу ризиків захворювань
            </div>
          )}

          {/* Кнопка для відкриття календаря на десктопі */}
          <div className="hidden md:block">
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <Calendar size={18} />
              {plantingDate && harvestDate ? "Змінити період" : "Обрати період у календарі"}
            </button>
          </div>

          {/* Календар для десктопу */}
          {showCalendar && (
            <div className="hidden md:block border border-gray-200 rounded-lg p-4">
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
              <div className="text-sm text-gray-500 text-center mt-3">
                Натисніть на дату висадки, потім на дату збирання
              </div>
            </div>
          )}

          {/* Поля дат для мобільних та альтернатива на десктопі */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата висадки або останньої обробки:
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={plantingDate}
                  onChange={(e) => setPlantingDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <Calendar size={18} className="absolute right-4 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата збирання врожаю:
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <Calendar size={18} className="absolute right-4 top-3.5 text-gray-400" />
              </div>
            </div>

            {/* Інформація про обраний період */}
            {(plantingDate || harvestDate) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-sm text-green-700">
                  <div><strong>Висадка:</strong> {plantingDate ? new Date(plantingDate).toLocaleDateString('uk-UA') : '—'}</div>
                  <div><strong>Збирання:</strong> {harvestDate ? new Date(harvestDate).toLocaleDateString('uk-UA') : '—'}</div>
                </div>
              </div>
            )}

            {isDateValid && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">
                  Дата збирання не може бути раніше дати висадки
                </p>
              </div>
            )}
          </div>

          {/* Вибір хвороб */}
          <div className="border border-gray-200 rounded-lg p-5">
            <label className="block font-medium text-gray-800 mb-4">
              Оберіть хвороби для моделювання:
            </label>
            
            <button
              onClick={toggleSelectAll}
              className={`w-full mb-4 px-4 py-3 rounded-lg border transition-colors text-sm font-medium ${
                diseases.length === allDiseases.length
                  ? "bg-green-100 border-green-500 text-green-700"
                  : "bg-gray-100 border-gray-300 text-gray-700"
              }`}
            >
              {diseases.length === allDiseases.length ? "Скасувати вибір усіх" : "Вибрати всі хвороби"}
            </button>

            <div className="space-y-3">
              {[
                { id: "lateBlight", name: "Фітофтороз" },
                { id: "grayMold", name: "Сіра гниль" },
                { id: "alternaria", name: "Альтернаріоз" },
                { id: "bacteriosis", name: "Бактеріоз" },
              ].map((d) => (
                <label key={d.id} className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    checked={diseases.includes(d.id)}
                    onChange={() => toggleDisease(d.id)}
                    className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-base text-gray-800">{d.name}</span>
                </label>
              ))}
            </div>

            {diseases.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Обрано хвороб: {diseases.length} з {allDiseases.length}
                </p>
              </div>
            )}
          </div>

          {/* Кнопки навігації */}
          <div className="flex justify-between gap-4 pt-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition font-medium text-gray-800"
            >
              Назад
            </button>
            <button
              onClick={handleNext}
              disabled={!plantingDate || !harvestDate || diseases.length === 0 || isDateValid}
              className={`px-6 py-3 rounded-lg text-white font-medium transition flex items-center gap-2 ${
                plantingDate && harvestDate && diseases.length > 0 && !isDateValid
                  ? "bg-green-600 hover:bg-green-700"
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