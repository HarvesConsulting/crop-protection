import React from "react";
import { useTranslation } from "react-i18next";

export default function Stepper({ currentStep }) {
  const { t } = useTranslation();

  const stepIds = [1, 2, 3, 4];

  return (
    <ol className="stepper">
      {stepIds.map((id, index) => (
        <li
          key={id}
          className={`step ${currentStep === id ? "active" : ""} ${
            currentStep > id ? "completed" : ""
          }`}
        >
          <div className="circle">{id}</div>
          <span className="label">
            {t(`step.${["city", "season", "calculation", "results"][index]}`)}
          </span>
          {index < stepIds.length - 1 && <div className="line"></div>}
        </li>
      ))}
    </ol>
  );
}
