/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Redefining standard Tailwind colors to match your new desired palette
        green: {
          50: '#F0F9F4',
          100: '#E1F1E9',
          500: '#5CC78C', // Brighter Mint
          600: '#4DBA7E',
          700: '#4A6256',
          800: '#2D4438',
          900: '#1F3429',
        },
        yellow: {
          50: '#FDFEEB',
          100: '#F9FCD3',
          400: '#E6F0A3',
          500: '#DCEB8C', // Primary Lime/Yellow
          600: '#CDDC7A',
          700: '#A6B54F',
          800: '#8A993E',
          900: '#6C7A2E',
        },
        primary: {
          50: '#F0F9F4',
          100: '#E1F1E9',
          200: '#C2E3D3',
          300: '#93CEAD',
          400: '#6DD99E',
          500: '#5CC78C', // Brighter Primary
          600: '#4DBA7E',
          700: '#4A6256',
          800: '#2D4438',
          900: '#1F3429',
        },
        accent: {
          DEFAULT: '#DCEB8C',
          hover: '#CDDC7A',
        },
        'primary-accent': '#4F46E5',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F7F8FA',
        },
        border: {
          DEFAULT: '#E0E0E0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'premium': '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
      }
    },
  },
  plugins: [],
}
