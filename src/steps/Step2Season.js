import React, { useState } from "react";
import { Info, ArrowRight, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { uk } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

// Реєструємо українську локаль
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

  // Обробник зміни дат у календарі
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setPlantingDate(start);
    setHarvestDate(end);
  };

  // Форматування дати для відображення
  const formatDisplayDate = (date) => {
    if (!date) return "Не обрано";
    return date.toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <main className="flex justify-center items-start min-h-[70vh] px-4">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
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
              Оберіть період сезону: перший клік - дата висадки, другий клік - дата збирання. Весь період між датами буде автоматично виділено.
            </div>
          )}

          {/* Календар з виділенням періоду */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-green-600" />
              <h3 className="font-semibold text-gray-800">Оберіть період сезону</h3>
            </div>
            
            {/* Інформація про обраний період */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Дата висадки:</div>
                <div className="font-medium text-green-700">
                  {formatDisplayDate(plantingDate)}
                </div>
              </div>
              <div className="bg-white p-3 rounded border">
                <div className="text-sm text-gray-600">Дата збирання:</div>
                <div className="font-medium text-blue-700">
                  {formatDisplayDate(harvestDate)}
                </div>
              </div>
            </div>

            {/* Календар */}
            <div className="flex justify-center">
              <DatePicker
                selected={plantingDate}
                onChange={handleDateChange}
                startDate={plantingDate}
                endDate={harvestDate}
                selectsRange
                inline
                monthsShown={2}
                locale={uk}
                minDate={new Date()}
                dateFormat="dd.MM.yyyy"
                shouldCloseOnSelect={false}
                isClearable={false}
                className="react-datepicker-custom"
              />
            </div>

            {/* Інструкція */}
            <div className="text-xs text-gray-500 text-center mt-3">
              💡 Натисніть на дату висадки, потім на дату збирання. Період буде автоматично виділено.
            </div>
          </div>

          {/* Чекбокси хвороб */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block font-medium text-gray-800 mb-3">
              Оберіть хвороби для моделювання:
            </label>
            <div className="space-y-2 pl-2">
              {/* Вибрати всі */}
              <label className="flex items-center gap-2 font-medium text-gray-900">
                <input
                  type="checkbox"
                  checked={diseases.length === allDiseases.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
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
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
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
              className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition flex items-center gap-2 font-medium"
            >
              Назад
            </button>
            <button
              onClick={() => onNext({ diseases })}
              disabled={!plantingDate || !harvestDate}
              className={`px-6 py-2 rounded-lg text-white font-medium transition flex items-center gap-2 ${
                plantingDate && harvestDate
                  ? "bg-green-600 hover:bg-green-700 shadow-md"
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