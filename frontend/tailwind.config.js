export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Accent (~10% of the UI): one hue, three steps
        primary: { DEFAULT: '#F25C19', dark: '#D94A0B' },
        tint: '#FDF0E8',
        deep: '#111111',
        accent: { DEFAULT: '#F25C19', dark: '#D94A0B' },  // public pages: landing + auth
        cream: '#F6F2EC',
        night: '#111111',            // dark hero panels and the login side
        // Warm neutrals shared by the public pages and the dashboard
        page: '#F6F2EC',
        line: 'rgba(17,17,17,0.12)',
        ink: '#111111',
        muted: '#6B665D',
        // Semantic colors, reserved for meaning only
        success: '#C2410C', warning: '#B45309', danger: '#DC2626',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Inter Tight"', 'Inter', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: { card: '0 1px 2px rgba(15,23,42,0.04), 0 2px 6px rgba(15,23,42,0.04)' },
      borderRadius: { xl: '14px' },
    },
  },
  plugins: [],
}
