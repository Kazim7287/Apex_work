/** @type {import('tailwindcss').Config} */
export default {
  // Preflight is disabled to prevent ANY global CSS conflicts with Ant Design or Admin/Teacher/Student dashboards!
  corePlugins: {
    preflight: false,
  },
  content: [
    "./index.html",
    "./src/public/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apex: {
          navy: '#0b1b3d',
          'navy-dark': '#061129',
          'navy-deep': '#040b1b',
          'navy-light': '#1e3a8a',
          gold: '#d4af37',
          'gold-light': '#fdfaf2',
          'gold-hover': '#b8860b',
          'gold-glow': 'rgba(212, 175, 55, 0.25)',
          'gold-muted': '#c5a059',
          parchment: '#efe8db',
          'parchment-light': '#f7f4ee',
          'parchment-soft': '#fbf9f5',
          cream: '#faf8f5',
          paper: '#f7f1e6',
          ink: '#12110e',
          'ink-soft': '#23211b',
          'ink-muted': '#5c5850',
          'ink-faint': '#8a857b',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        cinzel: ['Cinzel', 'serif'],
        outfit: ['Outfit', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 50px -12px rgba(11, 27, 61, 0.12)',
        'luxury-lg': '0 30px 70px -15px rgba(11, 27, 61, 0.2)',
        'luxury-dark': '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
        'gold-glow': '0 4px 20px rgba(212, 175, 55, 0.3)',
      },
      letterSpacing: {
        'widest-plus': '0.22em',
      }
    },
  },
  plugins: [],
}
