import React, { useState, useEffect } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
  const images = [
    "/images/bg1.png",
    "/images/bg2.png",
    "/images/bg3.png",
    "/images/bg4.png",
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

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
      <div
        style={{
          ...backgroundStyle,
          backgroundImage: `url(${images[currentImageIndex]})`,
        }}
      />
      <div style={overlayStyle} />
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h2 style={{ textAlign: "center", marginBottom: 20 }}>
            {isRegistering ? "Реєстрація" : "Вхід"}
          </h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <div style={{ position: "relative", marginBottom: "14px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: 40, marginBottom: 0 }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={eyeIconStyle}
              title={showPassword ? "Сховати пароль" : "Показати пароль"}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
          <button onClick={handleAuth} style={buttonStyle}>
            {isRegistering ? "Зареєструватись" : "Увійти"}
          </button>
          <p onClick={() => setIsRegistering(!isRegistering)} style={toggleStyle}>
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
    </div>
  );
}

// 🧱 СТИЛІ
const wrapperStyle = {
  position: "relative",
  width: "100%",
  height: "100vh",
  overflow: "hidden",
};

const backgroundStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundSize: "cover",
  backgroundPosition: "center",
  transition: "background-image 1s ease-in-out",
  zIndex: 0,
};

const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  zIndex: 1,
};

const containerStyle = {
  position: "relative",
  zIndex: 2,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
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
  padding: "14px 16px",
  marginBottom: "20px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "16px",
  boxSizing: "border-box",
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

const eyeIconStyle = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  cursor: "pointer",
  fontSize: 20,
  userSelect: "none",
  lineHeight: 1,
  color: "#444",
};
