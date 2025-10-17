import React from "react";
import { useTranslation } from "react-i18next";

export default function Stepper({ currentStep }) {
  const { t } = useTranslation();

  const steps = [
    { id: 1, name: t("step.city") },
    { id: 2, name: t("step.season") },
    { id: 3, name: t("step.calculation") },
    { id: 4, name: t("step.results") },
  ];

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
