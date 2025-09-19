import React, { useState } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = async () => {
    try {
      setError("");
      let userCredential;

      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email,
          devices: [],
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      onLogin(userCredential.user);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          {isRegistering ? "Реєстрація" : "Вхід"}
        </h2>

        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          inputMode="text"
          autoComplete="current-password"
          autoCapitalize="none"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleAuth} style={buttonStyle}>
          {isRegistering ? "Зареєструватись" : "Увійти"}
        </button>

        <p
          onClick={() => setIsRegistering(!isRegistering)}
          style={toggleStyle}
        >
          {isRegistering
            ? "У вас вже є акаунт? Увійти"
            : "Немає акаунта? Зареєструйтесь"}
        </p>

        {error && (
          <p style={{ color: "red", marginTop: 10, textAlign: "center" }}>
            ⚠ {error}
          </p>
        )}
      </div>
    </div>
  );
}

// Стилі
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100dvh", // 🆕 замість minHeight: "100vh"
  background: "#f0f4f8",
  padding: "20px",
};

const cardStyle = {
  background: "#fff",
  padding: "30px",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: "400px",
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginBottom: "14px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "16px",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  backgroundColor: "#2d6cdf",
  color: "white",
  fontWeight: "bold",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "16px",
};

const toggleStyle = {
  textAlign: "center",
  marginTop: "15px",
  color: "#2d6cdf",
  cursor: "pointer",
};
