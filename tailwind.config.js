extend: {
  keyframes: {
    tractorMove: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' },
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
