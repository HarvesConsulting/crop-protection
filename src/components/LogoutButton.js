// src/components/LogoutButton.js
import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function LogoutButton({ onLogout }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      if (onLogout) onLogout();
    } catch (error) {
      console.error("Помилка при виході:", error);
    }
  };

  return (
    <button onClick={handleLogout} style={buttonStyle}>
      🚪 Вийти з акаунту
    </button>
  );
}

const buttonStyle = {
  padding: "10px 16px",
  fontSize: "14px",
  backgroundColor: "#ccc",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "20px",
};
