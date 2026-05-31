/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Identidade Maria Films
        ink: '#000000',
        bone: '#f4f1ea',     // texto editorial creme
        pink: {
          DEFAULT: '#ff007f',
          soft: 'rgba(255,0,127,0.4)',
          glow: 'rgba(255,0,127,0.25)',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        tech: ['Sora', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 16px 45px 0 rgba(0,0,0,0.6)',
        'glass-sm': '0 8px 32px 0 rgba(0,0,0,0.3)',
        'pink-glow': '0 0 25px rgba(255,0,127,0.4)',
      },
      backdropBlur: {
        glass: '24px',
      },
      letterSpacing: {
        hud: '0.3em',
      },
      transitionTimingFunction: {
        'in-cine': 'cubic-bezier(0.16, 1, 0.3, 1)',
        camera: 'cubic-bezier(0.83, 0, 0.17, 1)',
      },
    },
  },
  plugins: [],
}
