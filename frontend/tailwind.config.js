/** @type {import('tailwindcss').Config} */
export default {
  content: ["src/**/*.{html,jsx}", "app/**/*.{ts,tsx,jsx}", "components/**/*.{ts,tsx, jsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("tw-elements/dist/plugin.cjs")],
}

