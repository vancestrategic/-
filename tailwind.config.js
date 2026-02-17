/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        'pp-neue': ['PPNeueMontreal-Regular'],
        'pp-neue-medium': ['PPNeueMontreal-Medium'],
      },
    },
  },
  plugins: [],
}
