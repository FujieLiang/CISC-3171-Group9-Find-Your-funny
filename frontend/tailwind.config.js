/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Find Your Funny — Underground Speakeasy palette
        // (names preserved for backwards-compat; values are now dark-mode speakeasy)
        cream: '#0B0906',      // deep warm near-black — canvas
        paper: '#13100C',      // primary surface
        ticket: '#1C1812',     // elevated surface
        oxblood: '#C7F542',    // ELECTRIC LIME — primary vibrant accent
        marigold: '#C8A35C',   // BRASS GOLD — secondary warmth
        hotpink: '#FF5F3E',    // CORAL — urgent pop / live indicator
        stark: '#F2EDE1',      // warm off-white — default text
        dim: '#2E2721',        // border / muted
      },
      fontFamily: {
        heading: ['"Fraunces"', 'serif'],
        display: ['"Fraunces"', 'serif'],
        sub: ['"Fraunces"', 'serif'],
        serif: ['"Fraunces"', 'serif'],
        body: ['"Manrope"', 'sans-serif'],
        sans: ['"Manrope"', 'sans-serif'],
        accent: ['"Unbounded"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        stub: '6px 6px 0px #1A1A1A',
        'stub-sm': '4px 4px 0px #1A1A1A',
        'stub-lg': '10px 10px 0px #1A1A1A',
        'stub-red': '6px 6px 0px #7A1022',
      },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
        'bulb-flicker': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 6px rgba(255, 184, 0, 0.9))' },
          '50%': { opacity: '0.65', filter: 'drop-shadow(0 0 2px rgba(255, 184, 0, 0.4))' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'bulb-flicker': 'bulb-flicker 2.4s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.25, 1, 0.5, 1) both',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
