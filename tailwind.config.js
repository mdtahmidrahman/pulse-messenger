import forms from '@tailwindcss/forms';
import daisyui from 'daisyui';
import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            keyframes: {
                pop: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                'slide-left': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                'slide-up': {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                }
            },
            animation: {
                pop: 'pop 0.15s ease-out',
                'slide-left': 'slide-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                'slide-up': 'slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                'fade-in': 'fade-in 0.2s ease-out',
            },
        },
    },

    plugins: [forms, daisyui],
    daisyui: {
        themes: ['light', 'dark'],
    },
};
