import React, { useState } from "react";
import LogoutButton from "./LogoutButton";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { IconButton, Tooltip } from "@mui/material";
import Stepper from "./Stepper";

export default function Layout({ children, step, onLogout }) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <span>🍅</span>
          Crop Protection
          <Tooltip title="Інформація про застосунок">
            <IconButton
              onClick={() => setShowInfo(!showInfo)}
              size="small"
              sx={{ 
                color: "white",
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
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
          <p>
            <strong>Застосунок для аграріїв:</strong> прогнозує дати обробки томатів від основних хвороб...
          </p>
        </div>
      )}

      {/* Stepper */}
      <Stepper currentStep={step} />

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