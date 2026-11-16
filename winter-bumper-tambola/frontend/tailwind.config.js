/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        winter: {
          bg: '#dbeafe',
          bgDeep: '#bfdbfe',
          snow: '#eff6ff',
        },
      },
      fontFamily: {
        display: ['"Nunito"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'snow-fall': 'snowFall 6s linear infinite',
        'number-pop': 'numberPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'winner-pop': 'winnerPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        snowFall: {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: '0' },
        },
        numberPop: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        winnerPop: {
          '0%': { transform: 'scale(0.3) rotate(-10deg)', opacity: '0' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
      },
      boxShadow: {
        'card': '0 4px 24px rgba(109, 40, 217, 0.15)',
        'number': '0 2px 8px rgba(109, 40, 217, 0.3)',
        'glow': '0 0 20px rgba(167, 139, 250, 0.4)',
      },
    },
  },
  plugins: [],
};
