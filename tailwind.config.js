/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  // важливо: вимикаємо reset від Tailwind
  corePlugins: { preflight: false },
  theme: { extend: {} },
  plugins: [],
};
