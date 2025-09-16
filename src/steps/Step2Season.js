import React from "react";

export default function Step2Season({
  plantingDate,
  setPlantingDate,
  harvestDate,
  setHarvestDate,
  useForecast,
  setUseForecast,
  onNext,
  onBack,
}) {
  return (
    <div>
      <h2>Крок 2: Дані про сезон</h2>
      <p className="text-sm text-gray-600 mb-4">
  Вкажіть початкову дату сезону або дату останньої обробки фунгіцидом та оберіть режим: прогноз на 14 днів або моделювання за архівними даними.
</p>

      {/* Перемикач режиму */}
      <label style={{ display: "block", marginBottom: 12 }}>
        <input
          type="checkbox"
          checked={useForecast}
          onChange={(e) => setUseForecast(e.target.checked)}
        />{" "}
        Використати історичну модель (NASA POWER)
      </label>

      {/* Дата початку */}
      <div style={{ marginBottom: 12 }}>
        <label>Дата початку вегетації:</label>
        <input
          type="date"
          value={plantingDate}
          onChange={(e) => setPlantingDate(e.target.value)}
          style={{
            display: "block",
            padding: "10px",
            width: "100%",
            fontSize: "16px",
            marginTop: "4px",
          }}
        />
      </div>

      {/* Дата завершення — тільки якщо модель */}
      {useForecast && (
        <div style={{ marginBottom: 12 }}>
          <label>Дата збору врожаю:</label>
          <input
            type="date"
            value={harvestDate}
            onChange={(e) => setHarvestDate(e.target.value)}
            style={{
              display: "block",
              padding: "10px",
              width: "100%",
              fontSize: "16px",
              marginTop: "4px",
            }}
          />
        </div>
      )}

      {/* Кнопки навігації */}
      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button
          onClick={onBack}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            background: "#eee",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Назад
        </button>

        <button
          onClick={onNext}
          disabled={
            !plantingDate || (useForecast && !harvestDate)
          }
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            background: (!plantingDate || (useForecast && !harvestDate)) ? "#ccc" : "#2d6cdf",
            color: "#fff",
            borderRadius: "6px",
            cursor: (!plantingDate || (useForecast && !harvestDate)) ? "not-allowed" : "pointer",
          }}
        >
          Продовжити
        </button>
      </div>
    </div>
  );
}
