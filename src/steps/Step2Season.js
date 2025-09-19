import React, { useState } from "react";

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
  const [diseases, setDiseases] = useState(["lateBlight"]);
  const [showInfo, setShowInfo] = useState(false); // 👈 стан для опису

  const toggleDisease = (disease) => {
    setDiseases((prev) =>
      prev.includes(disease)
        ? prev.filter((d) => d !== disease)
        : [...prev, disease]
    );
  };

  return (
    <div>
      {/* Заголовок + іконка ℹ️ */}
      <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
        Крок 2: Дані про сезон{" "}
        <span
          onClick={() => setShowInfo(!showInfo)}
          style={{
            cursor: "pointer",
            fontSize: "18px",
            color: "#2d6cdf",
            userSelect: "none"
          }}
          title={showInfo ? "Сховати опис" : "Показати опис"}
        >
          ℹ️
        </span>
      </h2>

      {/* Опис — показується лише якщо showInfo === true */}
      {showInfo && (
        <p className="text-sm text-gray-600 mb-4" style={{ marginTop: -10 }}>
          Вкажіть початкову дату сезону або дату останньої обробки фунгіцидом та оберіть режим: прогноз на 14 днів або моделювання за архівними даними. За замовчуванням стоїть розрахунок прогнозу на 14 діб. Для моделювання сезонної системи захисту оберіть "Використати історичну модель".
        </p>
      )}

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
        <label>Дата початку вегетації або дата останньої обробки:</label>
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

      {/* Дата завершення — якщо обрано історичну модель */}
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

      {/* Вибір хвороб */}
      <div style={{ marginBottom: 20 }}>
        <label><strong>Оберіть хвороби для моделювання:</strong></label>
        <div style={{ paddingLeft: 10, marginTop: 8 }}>
          {[
            { id: "lateBlight", name: "Фітофтороз" },
            { id: "grayMold", name: "Сіра гниль" },
            { id: "alternaria", name: "Альтернаріоз" },
            { id: "bacteriosis", name: "Бактеріоз" },
          ].map((disease) => (
            <label key={disease.id} style={{ display: "block", marginBottom: 6 }}>
              <input
                type="checkbox"
                checked={diseases.includes(disease.id)}
                onChange={() => toggleDisease(disease.id)}
              />{" "}
              {disease.name}
            </label>
          ))}
        </div>
      </div>

      {/* Кнопки */}
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
          onClick={() => onNext({ diseases })}
          disabled={!plantingDate || (useForecast && !harvestDate)}
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
