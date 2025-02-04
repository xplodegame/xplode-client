// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {
//       keyframes: {
//         modal: {
//           '0%': { transform: 'scale(0.95)', opacity: '0' },
//           '100%': { transform: 'scale(1)', opacity: '1' },
//         },
//         'spin-slow': {
//           '0%': { transform: 'rotate(0deg)' },
//           '100%': { transform: 'rotate(360deg)' },
//         },
//         'pulse-slow': {
//           '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
//           '50%': { opacity: '0.8', transform: 'scale(1.1)' },
//         },
//         float: {
//           '0%, 100%': { transform: 'translateY(0)' },
//           '50%': { transform: 'translateY(-10px)' },
//         }
//       },
//       animation: {
//         modal: 'modal 0.3s ease-out forwards',
//         'spin-slow': 'spin-slow 20s linear infinite',
//         'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
//         float: 'float 6s ease-in-out infinite',
//       },
//     },
//   },
//   plugins: [],
// }


/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'neon-blue': '#00f3ff',
        'neon-purple': '#b026ff',
        'neon-cyan': '#0ff0fc',
        'game-dark': '#0a0b0f',
        'game-dark-light': '#141625',
      },
      fontFamily: {
        'game': ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 10px #00f3ff, 0 0 20px #00f3ff, 0 0 30px #00f3ff' },
          '100%': { textShadow: '0 0 20px #b026ff, 0 0 30px #b026ff, 0 0 40px #b026ff' },
        },
      },
    },
  },
  plugins: [],
};