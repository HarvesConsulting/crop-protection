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

      window.location.href = 'https://secure.wayforpay.com/button/bf4278ccc53ee';
    } catch (error) {
      console.error('Помилка при надсиланні email:', error);
      alert('Сталася помилка при надсиланні email');
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <img src="/logo1.png" alt="Crop Protection Logo" style={styles.logo} />
        <h2 style={styles.title}>Crop Protection</h2>
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
  wrapper: {
    height: '100vh',
    background: 'linear-gradient(to bottom right, #3C8C3C, #4CAF50)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  card: {
    background: 'white',
    padding: '40px 30px',
    borderRadius: '18px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  },
  logo: {
    width: '64px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#2B2B2B',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#555',
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  button: {
    backgroundColor: '#2B3160',
    color: 'white',
    padding: '14px 24px',
    fontSize: '16px',
    borderRadius: '8px',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
  },
};
