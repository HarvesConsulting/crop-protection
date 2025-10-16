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
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
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
          <div style={headerStyle}>
            <div style={logoStyle}>
              <div style={logoIconStyle}>⚡</div>
            </div>
            <h2 style={titleStyle}>
              {isRegistering ? "Створити акаунт" : "Ласкаво просимо"}
            </h2>
            <p style={subtitleStyle}>
              {isRegistering 
                ? "Зареєструйтесь, щоб почати роботу" 
                : "Увійдіть у свій акаунт"}
            </p>
          </div>

          <div style={formStyle}>
            <div style={inputGroupStyle}>
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
            
            <div style={inputGroupStyle}>
              <div style={passwordContainerStyle}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={{ ...inputStyle, paddingRight: 50 }}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={eyeButtonStyle}
                  title={showPassword ? "Сховати пароль" : "Показати пароль"}
                  disabled={isLoading}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button 
              onClick={handleAuth} 
              style={isLoading ? { ...buttonStyle, ...buttonLoadingStyle } : buttonStyle}
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <div style={spinnerStyle} />
              ) : (
                isRegistering ? "Створити акаунт" : "Увійти"
              )}
            </button>

            {error && (
              <div style={errorStyle}>
                <span style={errorIconStyle}>⚠</span>
                <span style={errorTextStyle}>
                  {error.includes("invalid-credential") 
                    ? "Невірний email або пароль" 
                    : error.includes("email-already-in-use")
                    ? "Користувач з таким email вже існує"
                    : error.includes("weak-password")
                    ? "Пароль повинен містити щонайменше 6 символів"
                    : "Сталася помилка. Спробуйте ще раз"}
                </span>
              </div>
            )}

            <div style={dividerStyle}>
              <span style={dividerTextStyle}>або</span>
            </div>

            <p 
              onClick={() => !isLoading && setIsRegistering(!isRegistering)} 
              style={isLoading ? { ...toggleStyle, ...disabledStyle } : toggleStyle}
            >
              {isRegistering
                ? "Вже є акаунт? Увійти"
                : "Ще немає акаунта? Зареєструватись"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🎨 ОНОВЛЕНІ СТИЛІ
const wrapperStyle = {
  position: "relative",
  width: "100%",
  height: "100vh",
  overflow: "hidden",
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
};

const backgroundStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundSize: "cover",
  backgroundPosition: "center",
  transition: "background-image 1.2s ease-in-out",
  zIndex: 0,
};

const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "linear-gradient(135deg, rgba(16, 57, 150, 0.85) 0%, rgba(52, 152, 219, 0.8) 100%)",
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
  borderRadius: "20px",
  boxShadow: `
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2)
  `,
  width: "100%",
  maxWidth: "440px",
  animation: "slideUp 0.6s ease-out",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "32px",
};

const logoStyle = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "16px",
};

const logoIconStyle = {
  width: "60px",
  height: "60px",
  borderRadius: "16px",
  background: "linear-gradient(135deg, #2d6cdf 0%, #3498db 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
  color: "white",
  boxShadow: "0 8px 20px rgba(45, 108, 223, 0.3)",
};

const titleStyle = {
  fontSize: "28px",
  fontWeight: "700",
  color: "#1a202c",
  margin: "0 0 8px 0",
  letterSpacing: "-0.5px",
};

const subtitleStyle = {
  fontSize: "16px",
  color: "#718096",
  margin: 0,
  fontWeight: "400",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const inputStyle = {
  width: "100%",
  padding: "16px 20px",
  border: "2px solid #e2e8f0",
  borderRadius: "12px",
  fontSize: "16px",
  boxSizing: "border-box",
  transition: "all 0.2s ease",
  background: "white",
  outline: "none",
  fontFamily: "inherit",
};

const passwordContainerStyle = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const eyeButtonStyle = {
  position: "absolute",
  right: "12px",
  background: "none",
  border: "none",
  fontSize: "20px",
  cursor: "pointer",
  padding: "8px",
  borderRadius: "8px",
  transition: "background-color 0.2s ease",
  color: "#718096",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const buttonStyle = {
  width: "100%",
  padding: "16px 24px",
  background: "linear-gradient(135deg, #2d6cdf 0%, #3498db 100%)",
  color: "white",
  fontWeight: "600",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "16px",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 15px rgba(45, 108, 223, 0.3)",
  fontFamily: "inherit",
  position: "relative",
  overflow: "hidden",
};

const buttonLoadingStyle = {
  opacity: 0.8,
  cursor: "not-allowed",
};

const spinnerStyle = {
  width: "20px",
  height: "20px",
  border: "2px solid transparent",
  borderTop: "2px solid white",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
  margin: "0 auto",
};

const errorStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px",
  background: "#fed7d7",
  border: "1px solid #feb2b2",
  borderRadius: "12px",
  color: "#c53030",
};

const errorIconStyle = {
  fontSize: "18px",
  flexShrink: 0,
};

const errorTextStyle = {
  fontSize: "14px",
  fontWeight: "500",
  lineHeight: "1.4",
};

const dividerStyle = {
  position: "relative",
  textAlign: "center",
  margin: "8px 0",
};

const dividerTextStyle = {
  display: "inline-block",
  padding: "0 16px",
  background: "rgba(255, 255, 255, 0.95)",
  color: "#718096",
  fontSize: "14px",
  fontWeight: "500",
};

const toggleStyle = {
  textAlign: "center",
  color: "#2d6cdf",
  cursor: "pointer",
  fontWeight: "600",
  fontSize: "15px",
  transition: "color 0.2s ease",
  margin: 0,
  padding: "12px",
  borderRadius: "8px",
};

const disabledStyle = {
  opacity: 0.5,
  cursor: "not-allowed",
};

// Додаємо CSS анімації
const styles = `
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
    border-color: #2d6cdf !important;
    box-shadow: 0 0 0 3px rgba(45, 108, 223, 0.1) !important;
    transform: translateY(-1px);
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(45, 108, 223, 0.4);
  }

  p:hover:not(:disabled) {
    color: #1a56db;
  }

  button:active:not(:disabled) {
    transform: translateY(0);
  }

  .eye-button:hover {
    background-color: #f7fafc;
  }
`;

// Додаємо стилі в документ
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);