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
                'parley-red': '#8B1E1E',     // El color del círculo exterior
                'parley-gold': '#B38B4D',    // El color de las espigas y herraduras
                'parley-cream': '#FDF8F1',   // El color del fondo de las letras
                'parley-brown': '#2A1B15',   // Para el texto y sombras
            }


        },
    },

    plugins: [forms],
};
