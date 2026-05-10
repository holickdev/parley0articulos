import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                'parley-blue': '#0047FF',    // Electric Blue (Primary)
                'parley-cyan': '#00EAFF',    // High contrast accent
                'parley-light': '#F0F7FF',   // Light background instead of cream
                'parley-dark': '#001A40',    // Deep dark blue for text/contrast
                // Mapping old names to new palette to maintain compatibility while shifting the theme
                'parley-red': '#0047FF',     // Map red to electric blue
                'parley-gold': '#00EAFF',    // Map gold to cyan
                'parley-cream': '#F0F7FF',   // Map cream to light blue
                'parley-brown': '#001A40',   // Map brown to dark blue
            }


        },
    },

    plugins: [forms],
};
