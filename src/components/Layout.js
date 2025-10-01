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

      {/* Info Box (без бітого скла) */}
      {showInfo && (
        <div className="bg-yellow-50 border border-yellow-200 text-sm text-gray-800 px-6 py-4">
          <p>
            Застосунок для аграріїв: прогнозує дати обробки томатів від фітофторозу, сірої гнилі,
            альтернаріозу та бактеріозу на основі погодних даних.
          </p>
        </div>
      )}

      {/* Stepper */}
      <div className="flex justify-around bg-white py-3 shadow text-sm">
        {steps.map((label, i) => (
          <div
            key={i}
            className={`px-3 py-1 rounded-full transition ${
              i + 1 === step
                ? "bg-green-100 text-green-800 font-semibold border border-green-400"
                : "text-gray-500"
            }`}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      {/* Main content without extra "glass" wrapper */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
