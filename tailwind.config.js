/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0e14',
          panel: '#11151f',
          raised: '#161b27',
          hover: '#1b2130',
        },
        border: {
          DEFAULT: '#1f2735',
          soft: '#171d29',
        },
        accent: {
          DEFAULT: '#f0b429',
          dim: '#8a661f',
        },
        buy: {
          DEFAULT: '#22c55e',
          dim: '#16341f',
          soft: 'rgba(34,197,94,0.12)',
        },
        sell: {
          DEFAULT: '#ef4444',
          dim: '#3a1a1a',
          soft: 'rgba(239,68,68,0.12)',
        },
        wait: {
          DEFAULT: '#eab308',
          soft: 'rgba(234,179,8,0.12)',
        },
        ink: {
          DEFAULT: '#e2e8f0',
          muted: '#7c8aa0',
          faint: '#4b5567',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans Arabic"', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.85)' },
        },
        'flash-up': {
          '0%': { backgroundColor: 'rgba(34,197,94,0.35)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'flash-down': {
          '0%': { backgroundColor: 'rgba(239,68,68,0.35)' },
          '100%': { backgroundColor: 'transparent' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
        'flash-up': 'flash-up 0.9s ease-out',
        'flash-down': 'flash-down 0.9s ease-out',
        'toast-in': 'toast-in 0.2s ease-out',
      },
    },
  },
  plugins: [],
};
