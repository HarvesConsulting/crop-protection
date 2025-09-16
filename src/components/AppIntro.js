// src/components/AppIntro.js

export default function AppIntro() {
  return (
    <div className="mb-6 px-4 py-3 bg-blue-50 rounded-xl shadow-sm">
      <h1 className="text-2xl font-bold mb-2 text-blue-800">
        🌾 Crop Protection – Порадник обробок
      </h1>
      <p className="text-gray-700 text-base leading-relaxed">
        Цей застосунок допомагає агрономам, фермерам та консультантам ухвалювати рішення щодо захисту рослин.
        Ми аналізуємо погодні дані, обчислюємо індекси ризику захворювань (DSV) та прогнозуємо доцільні дати обробки.
      </p>
      <p className="text-gray-600 text-sm mt-2">
        Усього за кілька кроків ви отримаєте індивідуальні рекомендації з урахуванням погоди у вашій місцевості.
      </p>
    </div>
  );
}
