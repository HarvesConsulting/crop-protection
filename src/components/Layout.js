import React, { useState } from "react";
import LogoutButton from "./LogoutButton";

export default function Layout({ children, step, onLogout }) {
  const [showInfo, setShowInfo] = useState(false);
  const steps = ["Місто", "Сезон", "Розрахунок", "Результати"];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-green-700 text-white shadow">
        <div className="flex items-center gap-3 text-lg font-semibold">
          🍅 Crop Protection
          <button
            className="hover:text-yellow-200 transition"
            onClick={() => setShowInfo(!showInfo)}
            title="Інформація про застосунок"
          >
            ℹ️
          </button>
        </div>
        <LogoutButton onLogout={onLogout} />
      </header>

      {/* Info Box */}
      {showInfo && (
        <div className="bg-yellow-100 text-sm text-gray-700 p-4 shadow-inner">
          <p>
            Застосунок для аграріїв: прогнозує дати обробки томатів від фітофторозу, сірої гнилі,
            альтернаріозу та бактеріозу на основі погодних даних.
          </p>
        </div>
      )}

      {/* Stepper */}
      <div className="flex justify-around bg-white py-3 shadow-md text-sm">
        {steps.map((label, i) => (
          <div
            key={i}
            className={`px-2 py-1 rounded ${
              i + 1 === step
                ? "bg-green-200 text-green-900 font-semibold"
                : "text-gray-500"
            }`}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      {/* Main */}
      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-md p-6">{children}</div>
      </main>
    </div>
  );
}
