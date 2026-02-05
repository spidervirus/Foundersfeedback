import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "var(--primary)",
                    light: "var(--primary-light)",
                    dark: "var(--primary-dark)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    light: "var(--secondary-light)",
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    light: "var(--accent-light)",
                },
                surface: {
                    DEFAULT: "var(--surface)",
                    light: "var(--surface-light)",
                    lighter: "var(--surface-lighter)",
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
