/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ❗️ВАЖЛИВО: каже Tailwind'у, де шукати класи
  ],
  theme: {
    extend: {
      keyframes: {
        tractorMove: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        monsterShake: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        tractorMove: 'tractorMove 4s linear infinite',
        monsterShake: 'monsterShake 0.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
