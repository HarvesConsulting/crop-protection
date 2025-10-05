/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Шлях до файлів
  ],
  theme: {
    extend: {
      keyframes: {
        tractorMove: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(120vw)' }, // Їде за межі екрану
        },
        monsterShake: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        tractorMove: 'tractorMove 5s linear infinite',
        monsterShake: 'monsterShake 0.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
