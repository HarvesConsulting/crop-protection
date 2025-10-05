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
      },
      animation: {
        tractorMove: 'tractorMove 4s linear infinite',
      },
    },
  },
  plugins: [],
};
