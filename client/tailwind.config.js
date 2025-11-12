/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // make sure Tailwind scans all React files
  ],
  theme: {
    extend: {
       colors: {
        slateDark: '#2B2B2B',       // Main dark background
        lavenderSoft: '#C9A0DC',    // Accent/mystical highlights
        goldAccent: '#FFD700',       // Luxury touch
      },
      fontFamily: {
        serifLogo: ['Playfair Display', 'serif'],  // For headings/logo
        sansBody: ['Poppins', 'sans-serif'],       // For body text
      },
      letterSpacing: {
        widest: ".3em", // slightly more spaced-out than default widest
      },
       animation: {
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
};
