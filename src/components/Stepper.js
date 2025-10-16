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
    <ol className="stepper">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className={`step ${currentStep === step.id ? "active" : ""} ${
            currentStep > step.id ? "completed" : ""
          }`}
        >
          <div className="circle">{step.id}</div>
          <span className="label">{step.name}</span>
          {index < steps.length - 1 && <div className="line"></div>}
        </li>
      ))}
    </ol>
  );
}