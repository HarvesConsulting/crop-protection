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
    <button
      onClick={handleLogout}
      className="bg-white text-green-700 px-4 py-2 rounded hover:bg-green-100 transition text-sm font-medium shadow-sm border border-green-700"
      title="Вийти з акаунту"
    >
      🔓 Вийти
    </button>
  );
}
