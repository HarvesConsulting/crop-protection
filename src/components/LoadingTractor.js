import React from "react";
import { Tractor } from "lucide-react";

export default function LoadingTractor() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      {/* Дорога + анімація */}
      <div className="relative w-screen overflow-hidden h-16 bg-green-50 rounded-lg shadow-inner">
        <div className="animate-tractorMove inline-flex items-center space-x-4">
          
          {/* 👾 Монстр тікає */}
          <div
            className="w-8 h-8 animate-monsterShake text-2xl transform -scale-x-100"
            title="Хвороба тікає!"
          >
            👾
          </div>

          {/* 🚜 Трактор їде за ним */}
          <Tractor size={36} className="text-green-600" />
        </div>
      </div>

      {/* Підпис */}
      <p className="text-gray-700 text-lg font-medium">
        Обчислення системи захисту...
      </p>
    </div>
  );
}
