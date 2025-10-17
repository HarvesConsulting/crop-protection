import React, { useState, useEffect } from "react";
import { Info, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Step2Season({
  plantingDate,
  setPlantingDate,
  harvestDate,
  setHarvestDate,
  onNext,
  onBack,
}) {
  const { t } = useTranslation();
  const allDiseases = ["lateBlight", "grayMold", "alternaria", "bacteriosis"];
  const [diseases, setDiseases] = useState(["lateBlight"]);
  const [showInfo, setShowInfo] = useState(false);
  const [calculationPeriod, setCalculationPeriod] = useState("15");
  const [maxPeriod, setMaxPeriod] = useState(45);

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    if (!plantingDate) {
      setPlantingDate(formattedDate);
    }
  }, [plantingDate, setPlantingDate]);

  useEffect(() => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 14);

    if (plantingDate) {
      const startDate = new Date(plantingDate);
      const diffTime = maxDate - startDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setMaxPeriod(Math.max(1, diffDays));
    } else {
      setMaxPeriod(45);
    }
  }, [plantingDate]);

  useEffect(() => {
    if (plantingDate && calculationPeriod && parseInt(calculationPeriod) > 0) {
      const period = parseInt(calculationPeriod);
      const startDate = new Date(plantingDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + period);
      const formattedDate = endDate.toISOString().split('T')[0];
      setHarvestDate(formattedDate);
    }
  }, [plantingDate, calculationPeriod, setHarvestDate]);

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

  const handleCalculationPeriodChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^\d+$/.test(value)) {
      const numValue = value === "" ? "" : parseInt(value);
      if (numValue !== "") {
        if (numValue < 1) {
          setCalculationPeriod("1");
        } else if (numValue > maxPeriod) {
          setCalculationPeriod(maxPeriod.toString());
        } else {
          setCalculationPeriod(value);
        }
      } else {
        setCalculationPeriod("");
      }
    }
  };

  const handleCalculationPeriodBlur = () => {
    if (calculationPeriod === "" || parseInt(calculationPeriod) < 1) {
      setCalculationPeriod("1");
    } else if (parseInt(calculationPeriod) > maxPeriod) {
      setCalculationPeriod(maxPeriod.toString());
    }
  };

  const setMaxPeriodToField = () => {
    setCalculationPeriod(maxPeriod.toString());
  };

  const handleNext = () => {
    if (!plantingDate || !calculationPeriod || parseInt(calculationPeriod) < 1) {
      alert(t("step2_alert_invalid"));
      return;
    }
    if (diseases.length === 0) {
      alert(t("step2_alert_diseases"));
      return;
    }
    onNext({ diseases });
  };

  const isAllSelected = diseases.length === allDiseases.length;

  return (
    <main className="flex justify-center items-start min-h-[70vh] px-3 sm:px-4">
      <div className="w-full max-w-xl mx-auto bg-white rounded-xl shadow-lg">
        <div className="px-4 sm:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 leading-tight">
              {t("step2_title")}
            </h2>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-blue-600 hover:text-blue-800 transition p-1"
              title={t("info")}
            >
              <Info size={22} />
            </button>
          </div>

          {showInfo && (
            <div className="bg-blue-50 border border-blue-200 text-sm text-gray-700 p-3 sm:p-4 rounded-lg leading-relaxed">
              <p className="mb-2">{t("step2_info_1")}</p>
              <p>{t("step2_info_2")}</p>
            </div>
          )}

          <div className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
                {t("step2_label_start")}
              </label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2 sm:mb-3">
                {t("step2_label_period")}
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={maxPeriod}
                    value={calculationPeriod}
                    onChange={handleCalculationPeriodChange}
                    onBlur={handleCalculationPeriodBlur}
                    className="w-24 border border-gray-300 rounded-xl px-4 py-3 text-base text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 whitespace-nowrap">
                      {t("step2_days")}
                    </span>
                    <button
                      onClick={setMaxPeriodToField}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium px-3 py-2 rounded-lg border border-blue-200 transition-colors whitespace-nowrap"
                      title={t("step2_max", { days: maxPeriod })}
                    >
                      {t("step2_max", { days: maxPeriod })}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 sm:p-5">
            <label className="block font-semibold text-gray-800 mb-3 text-sm sm:text-base">
              {t("step2_select_disease")}
            </label>

            <button
              onClick={toggleSelectAll}
              className={`w-full border border-gray-300 rounded-xl px-4 py-3 text-base font-medium transition-all mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                isAllSelected
                  ? "bg-green-50 text-green-700 hover:bg-green-100"
                  : "bg-white text-gray-800 hover:bg-gray-50"
              }`}
            >
              {isAllSelected ? t("step2_all_selected") : t("step2_select_all")}
            </button>

            <div className="grid grid-cols-2 gap-3">
              {["lateBlight", "grayMold", "alternaria", "bacteriosis"].map((id) => (
                <label
                  key={id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={diseases.includes(id)}
                    onChange={() => toggleDisease(id)}
                    className="w-5 h-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                  <span className="text-gray-800 text-sm">{t(`disease_${id}`)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition font-semibold text-gray-800 text-sm sm:text-base order-2 sm:order-1"
            >
              {t("button_back")}
            </button>
            <button
              onClick={handleNext}
              disabled={
                !plantingDate ||
                !calculationPeriod ||
                parseInt(calculationPeriod) < 1 ||
                diseases.length === 0
              }
              className={`px-6 py-3 rounded-xl text-white font-semibold transition flex items-center justify-center gap-2 text-sm sm:text-base order-1 sm:order-2 ${
                plantingDate &&
                calculationPeriod &&
                parseInt(calculationPeriod) > 0 &&
                diseases.length > 0
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {t("button_continue")}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
