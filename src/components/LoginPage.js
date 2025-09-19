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
    <div style={wrapperStyle}>
      <h2>{isRegistering ? "Реєстрація" : "Вхід"}</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        readOnly
        onFocus={(e) => {
          e.target.removeAttribute("readOnly");
          console.log("🔵 Email focused");
        }}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Пароль"
        value={password}
        readOnly
        onFocus={(e) => {
          e.target.removeAttribute("readOnly");
          console.log("🟣 Password focused");
        }}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />

      <button onClick={handleAuth} style={buttonStyle}>
        {isRegistering ? "Зареєструватись" : "Увійти"}
      </button>

      <p onClick={() => setIsRegistering(!isRegistering)} style={toggleStyle}>
        {isRegistering ? "У вас вже є акаунт? Увійти" : "Немає акаунта? Зареєструйтесь"}
      </p>

      {error && <p style={errorStyle}>⚠ {error}</p>}
    </div>
  );
}

// Стилі
const wrapperStyle = {
  padding: 20,
  background: "#fff",
  maxWidth: 400,
  margin: "40px auto",
  fontFamily: "sans-serif",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: 12,
  marginBottom: 12,
  fontSize: 16,
};

const buttonStyle = {
  width: "100%",
  padding: 14,
  backgroundColor: "#2d6cdf",
  color: "white",
  fontWeight: "bold",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: 16,
};

const toggleStyle = {
  textAlign: "center",
  marginTop: 15,
  color: "#2d6cdf",
  cursor: "pointer",
};

const errorStyle = {
  color: "red",
  textAlign: "center",
  marginTop: 10,
};
