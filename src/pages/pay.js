import { useState } from "react";
import './PayPage.css'; // використовуємо актуальний шлях

export default function PayPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      window.location.href = "https://secure.wayforpay.com/button/bf4278ccc53ee";
    } catch (err) {
      console.error("Помилка надсилання:", err);
    }
  };

  return (
    <div className="pay-wrapper">
      {/* Декоративний фон */}
      <div className="pay-background-elements">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="leaf leaf-1">🍃</div>
        <div className="leaf leaf-2">🌿</div>
      </div>

      {/* Контент */}
      <div className="pay-logo">
        <span className="logo-icon">🍅</span>
        <span className="logo-text">Crop Protection</span>
      </div>

      <form className="pay-form" onSubmit={handleSubmit}>
        <label htmlFor="email">Введіть email для отримання доступу після оплати:</label>
        <input
          id="email"
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Оплатити через WayForPay</button>
      </form>
    </div>
  );
}
