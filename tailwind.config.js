/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // розпізнавання Tailwind класів
  ],
  theme: {
    extend: {
      keyframes: {
        tractorMove: {
          '0%': { transform: 'translateX(-130px)' },  // Починає за межами зліва
          '100%': { transform: 'translateX(100%)' },  // До правого краю контейнера
        },
        sprayPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.6 },
          '50%': { transform: 'scale(1.2)', opacity: 1 },
        },
      },
      animation: {
        tractorMove: 'tractorMove 5s linear infinite',
        sprayPulse: 'sprayPulse 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
