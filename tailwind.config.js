module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}",
      "./public/index.html"
    ],
    theme: {
      extend: {
        colors: {
          'pokemon-red': '#FF0000',
          'pokemon-blue': '#3B4CCA',
          'pokemon-yellow': '#FFDE00',
          'pokemon-light': '#B3A125'
        },
        animation: {
          'flip': 'flip 1s ease-in-out',
        },
        keyframes: {
          flip: {
            '0%': { transform: 'rotateY(0deg)' },
            '100%': { transform: 'rotateY(180deg)' }
          }
        }
      },
    },
    plugins: [],
  }