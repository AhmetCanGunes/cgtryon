import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './index.html',
    './**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Brand - CSS variable tabanlı */
        primary: 'var(--primary)',
        'primary-light': 'var(--primary-light)',
        'primary-dim': 'var(--primary-dim)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        'accent-dim': 'var(--accent-dim)',

        /* Mode-aware accent */
        'mode-accent': 'var(--mode-accent)',
        'mode-accent-dim': 'var(--mode-accent-dim)',

        /* Background scale */
        'bg-base': 'var(--bg-base)',
        'bg-surface': 'var(--bg-surface)',
        'bg-elevated': 'var(--bg-elevated)',

        /* Border scale */
        'border-subtle': 'var(--border-subtle)',
        'border-default': 'var(--border-default)',
        'border-strong': 'var(--border-strong)',

        /* Semantic */
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',

        /* Legacy aliases (geriye uyumluluk) */
        'background-light': '#E9EEF2',
        'background-dark': 'var(--bg-base)',
        'card-dark': 'var(--glass-bg)',
        'border-dark': 'var(--border-subtle)',
      },
      backgroundImage: {
        'grid-pattern': 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '12px',
        xl: '20px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
