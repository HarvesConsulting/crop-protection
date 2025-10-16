import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Visibility, VisibilityOff, Email, Lock } from "@mui/icons-material";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
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
      setIsLoading(true);
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email,
          devices: [],
          createdAt: new Date(),
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(userCredential.user);
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (code) => {
    const messages = {
      "auth/invalid-email": "Невірний формат email",
      "auth/user-disabled": "Акаунт заблоковано",
      "auth/user-not-found": "Користувача не знайдено",
      "auth/wrong-password": "Невірний пароль",
      "auth/email-already-in-use": "Цей email вже використовується",
      "auth/weak-password": "Пароль занадто простий",
      "auth/network-request-failed": "Помилка мережі",
    };
    return messages[code] || "Сталася помилка. Спробуйте ще раз.";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAuth();
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
          {/* Заголовок з іконкою */}
          <div style={headerStyle}>
            <div style={logoStyle}>🍅</div>
            <h1 style={titleStyle}>Crop Protection</h1>
            <p style={subtitleStyle}>
              {isRegistering ? "Створіть новий акаунт" : "Увійдіть у свій акаунт"}
            </p>
          </div>

          {/* Форма */}
          <div style={formStyle}>
            <div style={inputContainerStyle}>
              <Email style={inputIconStyle} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                style={inputStyle}
                disabled={isLoading}
              />
            </div>

            <div style={inputContainerStyle}>
              <Lock style={inputIconStyle} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{ ...inputStyle, paddingRight: 50 }}
                disabled={isLoading}
              />
              <div 
                style={eyeIconStyle}
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Сховати пароль" : "Показати пароль"}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </div>
            </div>

            <button 
              onClick={handleAuth} 
              style={buttonStyle}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <div style={spinnerStyle}></div>
              ) : (
                isRegistering ? "Зареєструватись" : "Увійти"
              )}
              {!isLoading && (isRegistering ? " →" : " →")}
            </button>

            {error && (
              <div style={errorStyle}>
                ⚠ {error}
              </div>
            )}
          </div>

          {/* Перемикач */}
          <div style={toggleContainerStyle}>
            <p style={toggleTextStyle}>
              {isRegistering ? "Вже маєте акаунт?" : "Ще не маєте акаунта?"}
            </p>
            <button 
              onClick={() => setIsRegistering(!isRegistering)}
              style={toggleButtonStyle}
              disabled={isLoading}
            >
              {isRegistering ? "Увійти" : "Зареєструватись"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🎨 ПОКРАЩЕНІ СТИЛІ
const wrapperStyle = {
  position: "relative",
  width: "100%",
  height: "100vh",
  overflow: "hidden",
  fontFamily: "'Segoe UI', system-ui, sans-serif",
};

const backgroundStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundSize: "cover",
  backgroundPosition: "center",
  transition: "background-image 1.5s ease-in-out",
  zIndex: 0,
};

const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "linear-gradient(135deg, rgba(45, 80, 22, 0.85) 0%, rgba(74, 124, 42, 0.8) 100%)",
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
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(20px)",
  padding: "40px",
  borderRadius: "24px",
  boxShadow: `
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6)
  `,
  width: "100%",
  maxWidth: "440px",
  border: "1px solid rgba(255, 255, 255, 0.3)",
  animation: "slideUp 0.6s ease-out",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "32px",
};

const logoStyle = {
  fontSize: "48px",
  marginBottom: "16px",
  filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "800",
  color: "#1a202c",
  margin: "0 0 8px 0",
  background: "linear-gradient(135deg, #2d5016 0%, #4a7c2a 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
};

const subtitleStyle = {
  fontSize: "16px",
  color: "#718096",
  margin: 0,
  fontWeight: "500",
};

const formStyle = {
  marginBottom: "24px",
};

const inputContainerStyle = {
  position: "relative",
  marginBottom: "20px",
};

const inputIconStyle = {
  position: "absolute",
  left: "16px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#a0aec0",
  fontSize: "20px",
  zIndex: 1,
};

const inputStyle = {
  width: "100%",
  padding: "16px 16px 16px 48px",
  border: "2px solid #e2e8f0",
  borderRadius: "12px",
  fontSize: "16px",
  boxSizing: "border-box",
  backgroundColor: "rgba(255, 255, 255, 0.8)",
  transition: "all 0.3s ease",
  outline: "none",
  fontFamily: "inherit",
};

const eyeIconStyle = {
  position: "absolute",
  right: "16px",
  top: "50%",
  transform: "translateY(-50%)",
  cursor: "pointer",
  color: "#a0aec0",
  zIndex: 1,
  transition: "color 0.2s ease",
};

const buttonStyle = {
  width: "100%",
  padding: "16px 24px",
  background: "linear-gradient(135deg, #2d5016 0%, #4a7c2a 100%)",
  color: "white",
  fontWeight: "700",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "16px",
  fontFamily: "inherit",
  transition: "all 0.3s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  boxShadow: "0 4px 16px rgba(45, 80, 22, 0.3)",
  position: "relative",
  overflow: "hidden",
};

const spinnerStyle = {
  width: "20px",
  height: "20px",
  border: "2px solid transparent",
  borderTop: "2px solid white",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const errorStyle = {
  background: "linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)",
  color: "#c53030",
  padding: "12px 16px",
  borderRadius: "8px",
  marginTop: "16px",
  fontSize: "14px",
  fontWeight: "500",
  border: "1px solid #fc8181",
  textAlign: "center",
};

const toggleContainerStyle = {
  textAlign: "center",
  paddingTop: "20px",
  borderTop: "1px solid #e2e8f0",
};

const toggleTextStyle = {
  color: "#718096",
  margin: "0 0 12px 0",
  fontSize: "14px",
};

const toggleButtonStyle = {
  background: "none",
  border: "none",
  color: "#2d5016",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  textDecoration: "underline",
  fontFamily: "inherit",
  transition: "color 0.2s ease",
};

// Додайте ці анімації до вашого глобального CSS
const globalStyles = `
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

input:focus {
  border-color: #4a7c2a !important;
  box-shadow: 0 0 0 3px rgba(74, 124, 42, 0.1) !important;
  background: white !important;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(45, 80, 22, 0.4);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.eye-icon:hover {
  color: #4a7c2a;
}

.toggle-button:hover {
  color: #4a7c2a;
}
`;

// Додайте глобальні стилі
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(globalStyles, styleSheet.cssRules.length);