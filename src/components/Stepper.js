// src/components/Stepper.js
import React from "react";

const steps = [
  { id: 1, name: "Місто" },
  { id: 2, name: "Сезон" },
  { id: 3, name: "Розрахунок" },
  { id: 4, name: "Результати" },
];

export default function Stepper({ currentStep }) {
  return (
    <div className="progress-bar">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`progress-step ${currentStep === step.id ? "active" : ""}`}
        >
          {step.id}. {step.name}
        </div>
      ))}
    </div>
  );
}