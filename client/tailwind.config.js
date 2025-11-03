/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B4F6C',
          light: '#1A6B8A',
          dark: '#053B52'
        },
        accent: {
          DEFAULT: '#D97706',
          light: '#F59E0B',
          dark: '#B45309'
        },
        emerald: {
          DEFAULT: '#059669',
          light: '#10B981',
          dark: '#047857'
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'Lato', 'Open Sans', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'gokkola': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L45 15L30 30L15 15L30 0z M30 30L45 45L30 60L15 45L30 30z' fill='%230B4F6C' fill-opacity='0.03'/%3E%3C/svg%3E\")"
      },
      borderRadius: {
        'bridge': '0 0 50% 50%',
        'arch': '50% 50% 0 0'
      },
      boxShadow: {
        'bridge': '0 4px 20px rgba(11, 79, 108, 0.15)',
        'hover': '0 8px 30px rgba(11, 79, 108, 0.25)'
      }
    }
  },
  plugins: []
};
