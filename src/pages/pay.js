// pages/pay.js

import { useState } from 'react';

export default function PayPage() {
  const [email, setEmail] = useState('');

  const handleBeforeRedirect = async (event) => {
    event.preventDefault();
    if (!email) return alert('Будь ласка, введіть email');

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
      alert('Сталася помилка при надсиланні email');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Оплата за <span style={{ color: '#2B3160' }}>Crop Protection</span></h2>
        <p style={styles.subtitle}>Введіть email для отримання доступу після оплати:</p>

        <input
          type="email"
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <button onClick={handleBeforeRedirect} style={styles.button}>
          Оплатити через WayForPay
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f4f6f8',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
  },
  title: {
    marginBottom: '10px',
    fontSize: '24px',
  },
  subtitle: {
    fontSize: '16px',
    marginBottom: '20px',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    marginBottom: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
  },
  button: {
    backgroundColor: '#2B3160',
    color: 'white',
    fontSize: '16px',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    width: '100%',
  },
};
