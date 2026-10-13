import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Light beige — primary canvas
        beige: {
          50: '#FDFBF5',
          100: '#F8F3E6',
          200: '#EFE6D1',
          300: '#E2D5B6',
          400: '#CDBB92',
        },
        // Forest green — brand primary
        forest: {
          50: '#EDF5EF',
          100: '#D5E7DA',
          200: '#AACFBA',
          300: '#74AE8C',
          400: '#458C66',
          500: '#2F6E4D',
          600: '#24583E',
          700: '#1C4632',
          800: '#143527',
          900: '#0C221A',
        },
        // Dark olive green — accent / ranking
        olive: {
          100: '#E7E5D4',
          300: '#B7B48C',
          500: '#7C7A4E',
          700: '#4E4D2C',
          900: '#2A2A16',
        },
        gold: {
          300: '#F0CE7A',
          400: '#E3B554',
          500: '#D19A2C',
        },
        ink: '#1B1F1C',
      },
      fontFamily: {
        sans: ['var(--font-cairo)', 'system-ui', 'sans-serif'],
        display: ['var(--font-tajawal)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(28,70,50,0.06), 0 8px 24px -12px rgba(28,70,50,0.25)',
        lift: '0 2px 4px rgba(28,70,50,0.08), 0 24px 48px -20px rgba(28,70,50,0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;