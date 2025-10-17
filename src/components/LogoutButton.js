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
      className="logout-btn-glass p-2"
      title="Вийти з акаунту"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1"
        />
      </svg>
    </button>
  );
}