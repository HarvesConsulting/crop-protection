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
      <h2>Крок 2: Дані про сезон 🌿</h2>
      <p className="text-sm text-gray-600 mb-4">
        Вкажіть початок і кінець сезону, а також оберіть хвороби для прогнозування.
      </p>

      <div style={{ marginBottom: 12 }}>
        <label>Дата висадки (початок сезону) або дата останнього внесення фунгіциду:</label>
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

      <div style={{ marginBottom: 12 }}>
        <label>Дата збирання:</label>
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
          disabled={!plantingDate || !harvestDate}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            background: (!plantingDate || !harvestDate) ? "#ccc" : "#2d6cdf",
            color: "#fff",
            borderRadius: "6px",
            cursor: (!plantingDate || !harvestDate) ? "not-allowed" : "pointer",
          }}
        >
          Продовжити
        </button>
      </div>
    </div>
  );
}
