/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Graphik', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      screens: {
        xs: '375px',
        sm: '480px',
        md: '768px',
        lg: '976px',
        xl: '1440px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-horizontal': 'slideHorizontal 6s ease-in-out infinite',
        'logo-dance': 'logoDance 8s ease-in-out infinite',
        'left-right': 'leftRight 5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(34, 197, 94, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.8)' },
        },
        slideHorizontal: {
          '0%, 100%': { transform: 'translateX(0px)' },
          '50%': { transform: 'translateX(15px)' },
        },
        logoDance: {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '25%': { transform: 'translateX(10px) translateY(-5px)' },
          '50%': { transform: 'translateX(0px) translateY(-10px)' },
          '75%': { transform: 'translateX(-10px) translateY(-5px)' },
        },
        leftRight: {
          '0%, 100%': { transform: 'translateX(0px)' },
          '25%': { transform: 'translateX(-15px)' },
          '75%': { transform: 'translateX(15px)' },
        },
      },
    },
  },
  plugins: [],
};
