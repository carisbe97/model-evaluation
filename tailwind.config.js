/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0D11',
          darker: '#060709',
          card: '#13161F',
          cardHover: '#181C26',
          border: '#232936',
          gold: '#D4AF37',
          goldLight: '#F5E7B2',
          goldDark: '#997B1A',
          champagne: '#F8EED9',
          muted: '#8A94A6',
          danger: '#E63946',
          success: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cinzel"', 'serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.25)',
        'card-glow': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
