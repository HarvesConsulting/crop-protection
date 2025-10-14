import React, { useState } from "react";
import { Info, ArrowRight } from "lucide-react";
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

  // Функція для форматування дати у зрозумілий вигляд
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  // Функція для форматування дати для передачі в наступний крок
  const formatDateForStorage = (date) => {
    if (!date) return "";
    // Повертаємо дату у форматі YYYY-MM-DD (без часу)
    return date.toISOString().split('T')[0];
  };

  // Обробник зміни дат у календарі
  const handleDateChange = (dates) => {
    const [start, end] = dates;
    // Конвертуємо Date об'єкти в рядки у форматі YYYY-MM-DD
    setPlantingDate(start ? formatDateForStorage(start) : "");
    setHarvestDate(end ? formatDateForStorage(end) : "");
  };

  // Перевірка готовності до переходу
  const isReadyForNext = () => {
    return plantingDate && harvestDate && diseases.length > 0;
  };

  // Обробник кнопки "Продовжити"
  const handleNext = () => {
    if (!isReadyForNext()) {
      alert("Будь ласка, оберіть період сезону та хоча б одну хворобу");
      return;
    }
    
    // Форматуємо дати для передачі в наступний крок
    const formattedData = {
      diseases,
      plantingDate: formatDateForDisplay(plantingDate),
      harvestDate: formatDateForDisplay(harvestDate),
      // Також передаємо оригінальні дати для обчислень, якщо потрібно
      rawPlantingDate: plantingDate,
      rawHarvestDate: harvestDate
    };
    
    onNext(formattedData);
  };

  // Конвертуємо рядки назад в Date об'єкти для календаря
  const plantingDateObj = plantingDate ? new Date(plantingDate) : null;
  const harvestDateObj = harvestDate ? new Date(harvestDate) : null;

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

          {/* Календар */}
          <div className="flex justify-center">
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
              isClearable={false}
              className="react-datepicker-custom"
            />
          </div>

          {/* Інформація про обраний період */}
          {(plantingDate || harvestDate) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Дата висадки:</div>
                  <div className="font-medium text-green-700">
                    {formatDateForDisplay(plantingDate)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Дата збирання:</div>
                  <div className="font-medium text-green-700">
                    {formatDateForDisplay(harvestDate)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Вибір хвороб */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <label className="block font-medium text-gray-800 mb-3">
              Оберіть хвороби для моделювання:
            </label>

            {/* Кнопка "Вибрати всі" */}
            <button
              onClick={toggleSelectAll}
              className={`mb-4 px-4 py-2 rounded-full text-sm font-medium transition 
                ${diseases.length === allDiseases.length 
                  ? "bg-green-600 text-white hover:bg-green-700" 
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
            >
              {diseases.length === allDiseases.length ? "Скасувати вибір" : "Вибрати всі"}
            </button>

            {/* Список хвороб у форматі тегів */}
            <div className="flex flex-wrap gap-3">
              {[
                { id: "lateBlight", name: "Фітофтороз", emoji: "🥔" },
                { id: "grayMold", name: "Сіра гниль", emoji: "💀" },
                { id: "alternaria", name: "Альтернаріоз", emoji: "🌫️" },
                { id: "bacteriosis", name: "Бактеріоз", emoji: "🧬" },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDisease(d.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border font-medium transition 
                    ${diseases.includes(d.id)
                      ? "bg-green-600 border-green-600 text-white shadow-md hover:bg-green-700"
                      : "bg-gray-100 border-gray-300 text-gray-800 hover:bg-gray-200"
                    }`}
                >
                  <span>{d.emoji}</span>
                  {d.name}
                </button>
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
              onClick={handleNext}
              disabled={!isReadyForNext()}
              className={`px-6 py-2 rounded-lg text-white font-medium transition flex items-center gap-2 ${
                isReadyForNext()
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