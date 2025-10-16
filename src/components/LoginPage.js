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
      setError(getErrorMessage(err.code));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/invalid-credential': 'Невірний email або пароль',
      'auth/wrong-password': 'Невірний пароль',
      'auth/user-not-found': 'Користувача не знайдено',
      'auth/email-already-in-use': 'Цей email вже використовується',
      'auth/weak-password': 'Пароль повинен містити щонайменше 6 символів',
      'auth/invalid-email': 'Невірний формат email',
      'auth/network-request-failed': 'Помилка мережі. Перевірте підключення',
    };
    return errorMessages[errorCode] || 'Сталася помилка. Спробуйте ще раз';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && email && password && !isLoading) {
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
            <div style={iconWrapperStyle}>
              <div style={iconStyle}>⚡</div>
            </div>
            <h2 style={titleStyle}>
              {isRegistering ? "Створення акаунта" : "Вхід в систему"}
            </h2>
            <p style={subtitleStyle}>
              {isRegistering 
                ? "Заповніть форму для реєстрації" 
                : "Введіть ваші облікові дані"}
            </p>
          </div>

          {/* Форма */}
          <div style={formStyle}>
            <div style={inputContainerStyle}>
              <input
                type="email"
                placeholder="Введіть ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                style={inputStyle}
                disabled={isLoading}
              />
            </div>
            
            <div style={inputContainerStyle}>
              <div style={passwordWrapperStyle}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Введіть пароль"
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
              style={ 
                isLoading ? { ...buttonStyle, ...buttonDisabledStyle } :
                !email || !password ? { ...buttonStyle, ...buttonDisabledStyle } :
                buttonStyle
              }
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <div style={loadingContainerStyle}>
                  <div style={spinnerStyle}></div>
                  <span>Завантаження...</span>
                </div>
              ) : (
                isRegistering ? "Створити акаунт" : "Увійти"
              )}
            </button>

            {error && (
              <div style={errorStyle}>
                <div style={errorIconStyle}>⚠</div>
                <div style={errorTextStyle}>{error}</div>
              </div>
            )}

            <div style={dividerStyle}></div>

            <p 
              onClick={() => !isLoading && setIsRegistering(!isRegistering)} 
              style={isLoading ? { ...toggleStyle, ...disabledStyle } : toggleStyle}
            >
              {isRegistering
                ? "Вже маєте акаунт? Увійти"
                : "Не маєте акаунта? Зареєструватись"}
            </p>
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
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
  backgroundColor: "rgba(0, 0, 0, 0.5)",
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
  background: "#ffffff",
  padding: "40px 35px",
  borderRadius: "16px",
  boxShadow: `
    0 10px 40px rgba(0, 0, 0, 0.15),
    0 2px 10px rgba(0, 0, 0, 0.05)
  `,
  width: "100%",
  maxWidth: "420px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
};

const headerStyle = {
  textAlign: "center",
  marginBottom: "32px",
};

const iconWrapperStyle = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "20px",
};

const iconStyle = {
  width: "64px",
  height: "64px",
  borderRadius: "16px",
  backgroundColor: "#2d6cdf",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
  color: "white",
  boxShadow: "0 4px 12px rgba(45, 108, 223, 0.3)",
};

const titleStyle = {
  fontSize: "24px",
  fontWeight: "600",
  color: "#1a202c",
  margin: "0 0 8px 0",
  lineHeight: "1.3",
};

const subtitleStyle = {
  fontSize: "15px",
  color: "#718096",
  margin: 0,
  fontWeight: "400",
  lineHeight: "1.5",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const inputContainerStyle = {
  position: "relative",
};

const inputStyle = {
  width: "100%",
  padding: "16px 18px",
  border: "2px solid #e2e8f0",
  borderRadius: "12px",
  fontSize: "15px",
  boxSizing: "border-box",
  transition: "all 0.2s ease",
  backgroundColor: "white",
  outline: "none",
  fontFamily: "inherit",
  color: "#2d3748",
};

const passwordWrapperStyle = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const eyeButtonStyle = {
  position: "absolute",
  right: "12px",
  background: "none",
  border: "none",
  fontSize: "18px",
  cursor: "pointer",
  padding: "6px",
  borderRadius: "6px",
  transition: "all 0.2s ease",
  color: "#718096",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "32px",
  height: "32px",
};

const buttonStyle = {
  width: "100%",
  padding: "16px 24px",
  backgroundColor: "#2d6cdf",
  color: "white",
  fontWeight: "600",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontSize: "15px",
  transition: "all 0.2s ease",
  fontFamily: "inherit",
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 2px 8px rgba(45, 108, 223, 0.2)",
};

const buttonDisabledStyle = {
  opacity: 0.6,
  cursor: "not-allowed",
  transform: "none",
};

const loadingContainerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
};

const spinnerStyle = {
  width: "16px",
  height: "16px",
  border: "2px solid transparent",
  borderTop: "2px solid white",
  borderRadius: "50%",
  animation: "spin 1s linear infinite",
};

const errorStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  padding: "14px",
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "10px",
  color: "#dc2626",
};

const errorIconStyle = {
  fontSize: "16px",
  flexShrink: 0,
  marginTop: "1px",
};

const errorTextStyle = {
  fontSize: "14px",
  fontWeight: "500",
  lineHeight: "1.4",
  flex: 1,
};

const dividerStyle = {
  height: "1px",
  background: "linear-gradient(90deg, transparent 0%, #e2e8f0 50%, transparent 100%)",
  margin: "5px 0",
};

const toggleStyle = {
  textAlign: "center",
  color: "#2d6cdf",
  cursor: "pointer",
  fontWeight: "500",
  fontSize: "14px",
  transition: "all 0.2s ease",
  margin: 0,
  padding: "8px",
  borderRadius: "6px",
};

const disabledStyle = {
  opacity: 0.5,
  cursor: "not-allowed",
};

// Додаємо CSS анімації
const styles = `
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
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(45, 108, 223, 0.3);
    background-color: #2563eb !important;
  }

  p:hover:not(:disabled) {
    color: #1e40af;
    background-color: #f8fafc;
  }

  button:active:not(:disabled) {
    transform: translateY(0);
  }

  .eye-button:hover:not(:disabled) {
    background-color: #f7fafc;
    transform: scale(1.1);
  }
`;

// Додаємо стилі в документ
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);