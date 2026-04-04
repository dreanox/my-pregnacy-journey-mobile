/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#E91E8C',
        'primary-soft': '#FFF0F5',
        'text-primary': '#1a1a2e',
        'text-secondary': '#666',
        'text-muted': '#888',
        'text-placeholder': '#999',
        surface: '#FAFAFA',
        card: '#FFFFFF',
        'card-alt': '#FEFEFE',
        'card-subtle': '#F9F9F9',
        'surface-muted': '#F5F5F5',
        border: '#F0F0F0',
        'border-strong': '#E0E0E0',
        'icon-muted': '#ccc',
        success: '#4CAF50',
        overlay: 'rgba(0,0,0,0.5)',
        'overlay-light': 'rgba(0,0,0,0.4)',
        'white-translucent': 'rgba(255,255,255,0.8)',
      },
    },
  },
  plugins: [],
};
