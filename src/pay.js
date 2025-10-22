// src/pages/pay.js

import { useState } from 'react';

export default function PayPage() {
  const [email, setEmail] = useState('');

  const handleBeforeRedirect = async () => {
    // Надсилаємо email в Resend через наш API
    if (!email) return;

    try {
      await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
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

      <a
        href="https://secure.wayforpay.com/button/bf4278ccc53ee"
        onClick={handleBeforeRedirect}
        style={{
          display: 'inline-block',
          background:
            '#2B3160 url("https://s3.eu-central-1.amazonaws.com/w4p-merch/button/bg5x2.png") no-repeat center right',
          backgroundSize: 'cover',
          width: '256px',
          height: '54px',
          border: 'none',
          borderRadius: '14px',
          padding: '18px',
          textDecoration: 'none',
          boxShadow: '3px 2px 8px rgba(71,66,66,0.22)',
          textAlign: 'left',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            fontFamily: 'Verdana,Arial,sans-serif',
            fontWeight: 'bold',
            fontSize: '14px',
            color: '#ffffff',
            lineHeight: '18px',
            verticalAlign: 'middle',
          }}
        >
          Оплатити
        </span>
      </a>
    </div>
  );
}
