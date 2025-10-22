// pages/pay.js

import { useState } from "react";

export default function PayPage() {
  const [email, setEmail] = useState("");

  const handleBeforeRedirect = async (event) => {
    event.preventDefault();
    if (!email) return;

    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      window.location.href = "https://secure.wayforpay.com/button/bf4278ccc53ee";
    } catch (error) {
      console.error("Помилка при надсиланні email:", error);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <img src="/logo1.png" alt="Crop Protection" style={styles.logo} />

        <h1 style={styles.title}>Crop Protection</h1>
        <p style={styles.subtitle}>Введіть email для отримання доступу після оплати:</p>

        <input
          type="email"
          placeholder="Ваша електронна пошта"
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
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #3C8C3C, #4CAF50)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    background: "#fff",
    padding: "40px 30px",
    borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    textAlign: "center",
    maxWidth: 400,
    width: "100%",
  },
  logo: {
    width: 64,
    height: 64,
    objectFit: "contain",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2b2b2b",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  input: {
    padding: 10,
    width: "100%",
    borderRadius: 8,
    border: "1px solid #ccc",
    marginBottom: 20,
    fontSize: 14,
  },
  button: {
    backgroundColor: "#2B3160",
    color: "#fff",
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: 14,
  },
};
