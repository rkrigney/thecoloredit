/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm cream backgrounds (inspired by F&B)
        cream: {
          50: '#FAF8F5',
          100: '#F5F2ED',
          200: '#EDE8E0',
          300: '#E0D8CC',
        },
        // Deep charcoal for text
        charcoal: {
          DEFAULT: '#2D2D2D',
          light: '#4A4A4A',
          lighter: '#6B6B6B',
        },
        // Muted sage green (F&B signature)
        sage: {
          DEFAULT: '#5B6B5A',
          light: '#6E7E6D',
          dark: '#4A5A49',
          50: '#F2F4F2',
          100: '#E5EAE5',
        },
        // Warm blush/terracotta accent
        blush: {
          DEFAULT: '#C9A992',
          light: '#E5D4C7',
          dark: '#B08B72',
        },
        // Gold accent (refined)
        gold: {
          DEFAULT: '#B5A27A',
          light: '#D4C9A8',
          dark: '#968660',
        },
      },
      fontFamily: {
        // Elegant serif for headlines
        serif: ['Cormorant Garamond', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        // Clean sans for body
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        // Refined type scale
        'display': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'headline': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'title': ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
        'subtitle': ['1.125rem', { lineHeight: '1.4' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
