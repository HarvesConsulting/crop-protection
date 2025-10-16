import React, { useState } from "react";
import LogoutButton from "./LogoutButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { IconButton, Tooltip } from "@mui/material";

export default function Layout({ children, step, onLogout }) {
  const [showInfo, setShowInfo] = useState(false);
  const steps = ["Місто", "Сезон", "Розрахунок", "Результати"];

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span>🍅</span>
          Crop Protection
          <Tooltip 
            title="Інформація про застосунок" 
            arrow
            placement="bottom"
          >
            <IconButton
              onClick={() => setShowInfo(!showInfo)}
              size="small"
              sx={{ 
                color: "white",
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <InfoOutlinedIcon />
            </IconButton>
          </Tooltip>
        </div>
        <LogoutButton onLogout={onLogout} />
      </header>

      {/* Info Box */}
      {showInfo && (
        <div className="info-box">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm leading-6">
              <strong>Застосунок для аграріїв:</strong> прогнозує дати обробки томатів від основних хвороб - 
              фітофторозу, сірої гнилі, альтернаріозу та бактеріозу на основі аналізу 
              погодних даних. Будує систему захисту з рекомендованими датами, препаратами і годинами для обробки. 
              Незамінний помічник в підвищенні врожайності та якості продукції.
            </p>
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="progress-bar">
        {steps.map((label, i) => (
          <div
            key={i}
            className={`progress-step ${
              i + 1 === step ? "active" : ""
            }`}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      {/* Main content */}
      <main className="main-content">
        <div className="glass-container">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="byline">
          <em>by</em> HarvestConsulting
        </div>
      </footer>
    </div>
  );
}