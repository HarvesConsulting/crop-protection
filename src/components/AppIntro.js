// src/components/AppIntro.js

export default function AppIntro() {
  return (
    <div style={{ padding: "16px", backgroundColor: "#f0f4ff", borderRadius: "12px", marginBottom: "24px" }}>
      <h2 style={{ marginBottom: "10px", color: "#2d6cdf" }}>🌾 Crop Protection – Порадник обробок</h2>
      <p style={{ marginBottom: "6px" }}>
        Цей застосунок допомагає агрономам, фермерам та консультантам ухвалювати рішення щодо захисту рослин.
        Ми аналізуємо погодні дані, обчислюємо індекси ризику захворювань (DSV) та прогнозуємо доцільні дати обробки.
      </p>
      <p style={{ fontSize: "0.9em", color: "#555" }}>
        Усього за кілька кроків ви отримаєте індивідуальні рекомендації з урахуванням погоди у вашій місцевості.
      </p>
    </div>
  );
}
