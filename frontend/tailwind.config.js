export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        canvas: '#F6F5F2',
        surface: '#FFFFFF',
        ink: '#16181B',
        muted: '#6B6F74',
        faint: '#9A9EA3',
        line: '#E7E4DE',
        accent: {
          DEFAULT: '#2E4F43',
          hover: '#254137',
          soft: '#E8EEEA',
          ring: 'rgba(46, 79, 67, 0.28)',
        },
        warn: {
          DEFAULT: '#8A6320',
          soft: '#F5EEE0',
        },
        danger: {
          DEFAULT: '#8C3A32',
          soft: '#F6E8E5',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'sans-serif',
        ],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(20, 22, 26, 0.04), 0 10px 28px -16px rgba(20, 22, 26, 0.14)',
        lift: '0 2px 4px rgba(20, 22, 26, 0.04), 0 18px 44px -20px rgba(20, 22, 26, 0.22)',
        inset: 'inset 0 0 0 1px rgba(20, 22, 26, 0.05)',
      },
      borderRadius: {
        '4xl': '1.75rem',
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      maxWidth: {
        shell: '76rem',
      },
    },
  },
  plugins: [],
}
