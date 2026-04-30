/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(230, 85%, 60%)",
        secondary: "hsl(280, 80%, 65%)",
        "surface-glass": "rgba(15, 23, 42, 0.7)",
        "status-online": "#10b981",
      },
      fontFamily: {
        "geist-sans": ["Geist Sans", "Inter", "system-ui", "sans-serif"],
      },
      spacing: {
        "glow-xs": "4px",
        "glow-sm": "8px",
        "glow-md": "12px",
        "glow-lg": "24px",
      },
      backdropBlur: {
        glass: "24px",
      },
      boxShadow: {
        glass: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        glow: "0 0 20px rgba(99, 102, 241, 0.3)",
        "glow-purple": "0 0 20px rgba(168, 85, 247, 0.3)",
      },
      animation: {
        "stagger-fade-up": "staggerFadeUp 0.6s ease-out",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "thinking-pulse": "thinkingPulse 1.5s ease-in-out infinite",
        "morph-transition": "morphTransition 0.4s ease-in-out",
        "slide-horizontal": "slideHorizontal 0.3s ease-out",
        "float-in": "floatIn 0.4s ease-out",
      },
      keyframes: {
        staggerFadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        thinkingPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.05)", opacity: "0.8" },
        },
        morphTransition: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideHorizontal: {
          "0%": { transform: "translateX(8px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        floatIn: {
          "0%": { transform: "translateY(12px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}