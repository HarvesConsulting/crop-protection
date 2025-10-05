module.exports = {
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
};
