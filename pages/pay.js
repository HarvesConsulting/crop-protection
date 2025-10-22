// pages/pay.js

import { useState } from 'react';

export default function PayPage() {
  const [email, setEmail] = useState('');

  const handleBeforeRedirect = async (event) => {
    event.preventDefault();

    if (!email) return;

    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      // Переадресація після успіху
      window.location.href = 'https://secure.wayforpay.com/button/bf4278ccc53ee';
    } catch (error) {
      console.error('Помилка при надсиланні email:', error);
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Оплата за Crop Protection</h2>
      <p>Введіть email для отримання доступу після оплати:</p>

      <input
        type="email"
        placeholder="Ваша електронна пошта"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={{ padding: 8, marginBottom: 10, display: 'block' }}
      />

      <button
        onClick={handleBeforeRedirect}
        style={{
          backgroundColor: '#2B3160',
          color: 'white',
          padding: '12px 24px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Оплатити через WayForPay
      </button>
    </div>
  );
}
