import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        living: {
          bg: '#F8F5F0',
          surface: '#FFFFFF',
          muted: '#EFEAE1',
          border: '#E2DAD0',
          ink: '#1A1715',
          espresso: '#2C221E',
          terracotta: '#B85D3B',
          brass: '#C59B27',
          sage: '#3E5C4E',
          slate: '#2A3B4C',
          vinyl: '#141210',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
