/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        'zt-bg': '#0D0D0D',
        'zt-panel': '#1A1A1A',
        'zt-accent': '#6A0DAD',
        'zt-accent-2': '#9A4DFF',
        'zt-text': '#FFFFFF',
        'zt-muted': '#B3B3B3',
        'zt-border': '#2E2E2E',
        'zt-hover': '#2B0F45',
      },
    },
  },
  plugins: [],
};
