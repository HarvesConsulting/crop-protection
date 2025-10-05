import React from "react";
import { Tractor } from "lucide-react"; // Можна замінити на SVG або кастомну анімацію

export default function LoadingTractor() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      {/* Анімація */}
      <div className="w-full overflow-hidden">
        <div className="animate-tractorMove inline-flex items-center space-x-2">
          <Tractor size={36} className="text-green-600" />
          <div className="w-24 h-4 bg-green-300 rounded-full" />
          <div className="w-6 h-4 bg-green-400 rounded-sm" />
        </div>
      </div>

      {/* Текст */}
      <p className="text-gray-700 text-lg font-medium">
        Обчислення системи захисту...
      </p>
    </div>
  );
}
