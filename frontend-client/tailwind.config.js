/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}", // In case files are in root
        "./components/**/*.{js,ts,jsx,tsx}" // Explicitly include components if in root
    ],
    theme: {
        extend: {
            colors: {
                // Custom fintech colors if needed
            }
        },
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
    },
    plugins: [],
}
