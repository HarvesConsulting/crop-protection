import React from "react";
import { Tractor } from "lucide-react";

export default function LoadingTractor() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8 w-full">
      
      {/* Доріжка (в межах glass-container) */}
      <div className="relative w-full max-w-xl overflow-hidden h-16 bg-green-50 rounded-lg shadow-inner">
        <div
          className="absolute left-[-150px] top-1/2 -translate-y-1/2 animate-tractorMove flex items-center space-x-4 w-[120px]"
        >
          {/* 💦 Крапелька */}
          <div
            className="w-8 h-8 animate-sprayPulse text-2xl z-10 text-blue-400"
            title="Обприскування"
          >
            💦
          </div>

          {/* 🚜 Трактор */}
          <Tractor size={36} className="text-green-600 z-10" />
        </div>
      </div>

      <p className="text-gray-700 text-lg font-medium">
        Обчислення системи захисту...
      </p>
    </div>
  );
}
