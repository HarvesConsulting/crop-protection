import React from "react";
import { Tractor } from "lucide-react"; // Іконка трактора з lucide-react

export default function LoadingTractor() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      {/* Анімація з монстром і трактором */}
      <div className="w-full overflow-hidden">
        <div className="animate-tractorMove inline-flex items-center space-x-4">
          {/* Монстр — хвороба, яка тікає */}
          <div
            className="w-8 h-8 text-red-600 animate-monsterShake text-2xl"
            title="Хвороба втікає!"
          >
            👾
          </div>

          {/* Тракторець — їде захищати урожай */}
          <Tractor size={36} className="text-green-600" />
        </div>
      </div>

      {/* Текстове повідомлення */}
      <p className="text-gray-700 text-lg font-medium">
        Обчислення системи захисту...
      </p>
    </div>
  );
}
