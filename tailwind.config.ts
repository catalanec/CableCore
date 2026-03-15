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
                brand: {
                    black: '#09090b',
                    dark: '#111113',
                    card: '#1a1a1d',
                    gold: '#c9a84c',
                    'gold-light': '#e2c36a',
                    'gold-dark': '#a08535',
                    'gold-muted': '#8a8677',
                },
                surface: {
                    primary: '#09090b',
                    secondary: '#111113',
                    card: 'rgba(255, 255, 255, 0.03)',
                    'card-hover': 'rgba(201, 168, 76, 0.06)',
                    glass: 'rgba(9, 9, 11, 0.85)',
                },
                border: {
                    subtle: 'rgba(255, 255, 255, 0.06)',
                    accent: 'rgba(201, 168, 76, 0.3)',
                },
            },
            fontFamily: {
                heading: ['var(--font-outfit)', 'sans-serif'],
                body: ['var(--font-inter)', 'sans-serif'],
            },
            animation: {
                'pulse-border': 'pulse-border 3s ease-in-out infinite',
                'fade-in': 'fade-in 0.6s ease forwards',
                'slide-up': 'slide-up 0.6s ease forwards',
                'phone-ring': 'phone-ring 2s ease-in-out infinite',
            },
            keyframes: {
                'pulse-border': {
                    '0%, 100%': { borderColor: 'rgba(201, 168, 76, 0.15)' },
                    '50%': { borderColor: 'rgba(201, 168, 76, 0.4)' },
                },
                'fade-in': {
                    from: { opacity: '0' },
                    to: { opacity: '1' },
                },
                'slide-up': {
                    from: { opacity: '0', transform: 'translateY(30px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'phone-ring': {
                    '0%, 100%': { transform: 'rotate(0deg)' },
                    '10%': { transform: 'rotate(15deg)' },
                    '20%': { transform: 'rotate(-15deg)' },
                    '30%': { transform: 'rotate(10deg)' },
                    '40%': { transform: 'rotate(-10deg)' },
                    '50%': { transform: 'rotate(0deg)' },
                },
            },
            backgroundImage: {
                'gradient-gold': 'linear-gradient(135deg, #e2c36a, #c9a84c, #a08535)',
                'gradient-hero': 'linear-gradient(180deg, rgba(201, 168, 76, 0.06) 0%, transparent 60%)',
                'gradient-card': 'linear-gradient(145deg, rgba(201, 168, 76, 0.04), rgba(160, 133, 53, 0.02))',
            },
            boxShadow: {
                glow: '0 0 30px rgba(201, 168, 76, 0.12)',
                'glow-strong': '0 0 60px rgba(201, 168, 76, 0.2)',
            },
        },
    },
    plugins: [],
};

export default config;
