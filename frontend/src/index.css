@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Manrope:wght@300;400;500;600;700;800&family=Unbounded:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Underground speakeasy — dark canvas */
    --background: 30 17% 3%;            /* #0B0906 */
    --foreground: 39 33% 92%;
    --card: 30 23% 6%;                  /* #13100C */
    --card-foreground: 39 33% 92%;
    --popover: 30 23% 6%;
    --popover-foreground: 39 33% 92%;
    --primary: 73 89% 61%;              /* electric lime */
    --primary-foreground: 30 17% 3%;
    --secondary: 37 49% 57%;            /* brass gold */
    --secondary-foreground: 30 17% 3%;
    --muted: 30 16% 12%;
    --muted-foreground: 35 14% 55%;
    --accent: 9 100% 62%;               /* coral */
    --accent-foreground: 30 17% 3%;
    --destructive: 0 82% 58%;
    --destructive-foreground: 39 33% 92%;
    --border: 32 16% 18%;
    --input: 30 21% 9%;
    --ring: 73 89% 61%;
    --chart-1: 73 89% 61%;
    --chart-2: 37 49% 57%;
    --chart-3: 9 100% 62%;
    --chart-4: 28 56% 52%;
    --chart-5: 35 14% 55%;
    --radius: 0.125rem;
  }
  .dark {
    --background: 30 17% 3%;
    --foreground: 39 33% 92%;
    --card: 30 23% 6%;
    --card-foreground: 39 33% 92%;
    --popover: 30 23% 6%;
    --popover-foreground: 39 33% 92%;
    --primary: 73 89% 61%;
    --primary-foreground: 30 17% 3%;
    --secondary: 37 49% 57%;
    --secondary-foreground: 30 17% 3%;
    --muted: 30 16% 12%;
    --muted-foreground: 35 14% 55%;
    --accent: 9 100% 62%;
    --accent-foreground: 30 17% 3%;
    --destructive: 0 82% 58%;
    --destructive-foreground: 39 33% 92%;
    --border: 32 16% 18%;
    --input: 30 21% 9%;
    --ring: 73 89% 61%;
  }
}

@layer base {
  * { @apply border-border; }
  html { color-scheme: dark; }
  body {
    @apply bg-cream text-stark antialiased;
    font-family: 'Manrope', sans-serif;
    background-image:
      radial-gradient(ellipse 80% 60% at 20% -10%, rgba(199, 245, 66, 0.08) 0%, rgba(11, 9, 6, 0) 55%),
      radial-gradient(ellipse 60% 50% at 90% 5%, rgba(200, 163, 92, 0.10) 0%, rgba(11, 9, 6, 0) 60%),
      radial-gradient(ellipse 100% 100% at 50% 120%, rgba(255, 95, 62, 0.05) 0%, rgba(11, 9, 6, 0) 70%);
    background-attachment: fixed;
  }
  ::selection { background: #C7F542; color: #0B0906; }

  h1, h2, h3, h4 {
    font-family: 'Fraunces', serif;
    letter-spacing: -0.02em;
    font-feature-settings: "ss01";
  }

  /* Film-grain overlay on the whole page */
  body::before {
    content: "";
    position: fixed; inset: 0; pointer-events: none; z-index: 1;
    opacity: 0.04;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
    mix-blend-mode: overlay;
  }
  /* Keep app content above the grain overlay */
  .App { position: relative; z-index: 2; }
}

@layer utilities {
  /* Typography */
  .font-display { font-family: 'Fraunces', serif; font-variation-settings: "opsz" 144, "SOFT" 50; }
  .font-serif { font-family: 'Fraunces', serif; }
  .font-serif-italic { font-family: 'Fraunces', serif; font-style: italic; font-variation-settings: "opsz" 144, "SOFT" 100; }
  .font-sans { font-family: 'Manrope', sans-serif; }
  .font-accent { font-family: 'Unbounded', sans-serif; letter-spacing: -0.01em; }
  .font-mono-accent { font-family: 'JetBrains Mono', monospace; }

  .eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: #C8A35C;
  }
  .eyebrow-muted {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: rgba(242, 237, 225, 0.45);
  }

  /* ——— Surfaces ——— */
  .ticket-card {
    background: #13100C;
    border: 1px solid #2E2721;
    transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
    position: relative;
  }
  .ticket-card:hover {
    border-color: rgba(199, 245, 66, 0.4);
    transform: translateY(-3px);
    box-shadow:
      0 0 0 1px rgba(199, 245, 66, 0.2),
      0 20px 40px -20px rgba(199, 245, 66, 0.25),
      0 8px 24px -8px rgba(0, 0, 0, 0.6);
  }
  .soft-card {
    background: rgba(19, 16, 12, 0.7);
    border: 1px solid rgba(46, 39, 33, 0.8);
    backdrop-filter: blur(10px);
    transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .soft-card:hover {
    border-color: rgba(200, 163, 92, 0.5);
    background: rgba(28, 24, 18, 0.9);
    transform: translateY(-2px);
  }

  .ticket-perforation-h {
    background-image: linear-gradient(to right, rgba(200, 163, 92, 0.35) 50%, transparent 50%);
    background-size: 6px 1px;
    background-repeat: repeat-x;
    height: 1px;
  }

  /* ——— Buttons ——— */
  .btn-primary {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
    background: #C7F542;
    color: #0B0906;
    border: 1px solid #C7F542;
    padding: 0.8rem 1.4rem;
    font-family: 'Unbounded', sans-serif;
    font-weight: 600;
    font-size: 0.82rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    position: relative;
    overflow: hidden;
    transition: all 0.25s cubic-bezier(0.25, 1, 0.5, 1);
    box-shadow: 0 0 0 rgba(199, 245, 66, 0);
  }
  .btn-primary::after {
    content: "";
    position: absolute; inset: 0;
    background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%);
    transform: translateX(-120%);
    transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 30px rgba(199, 245, 66, 0.4), 0 8px 20px -8px rgba(199, 245, 66, 0.3);
  }
  .btn-primary:hover::after { transform: translateX(120%); }
  .btn-primary:active { transform: translateY(0); }

  .btn-secondary {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
    background: transparent;
    color: #C8A35C;
    border: 1px solid rgba(200, 163, 92, 0.6);
    padding: 0.8rem 1.4rem;
    font-family: 'Unbounded', sans-serif;
    font-weight: 500;
    font-size: 0.82rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition: all 0.2s ease;
  }
  .btn-secondary:hover {
    background: rgba(200, 163, 92, 0.08);
    border-color: #C8A35C;
    color: #F2EDE1;
  }

  .btn-ghost {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
    background: transparent;
    color: rgba(242, 237, 225, 0.8);
    border: 1px solid rgba(242, 237, 225, 0.15);
    padding: 0.7rem 1.2rem;
    font-family: 'Manrope', sans-serif;
    font-weight: 500;
    font-size: 0.85rem;
    transition: all 0.2s ease;
  }
  .btn-ghost:hover {
    border-color: rgba(242, 237, 225, 0.5);
    color: #F2EDE1;
  }

  .btn-sm {
    display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
    background: #C7F542;
    color: #0B0906;
    border: 1px solid #C7F542;
    padding: 0.5rem 0.9rem;
    font-family: 'Unbounded', sans-serif;
    font-weight: 600;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    transition: all 0.2s ease;
  }
  .btn-sm:hover {
    background: #d9ff5f;
    box-shadow: 0 0 18px rgba(199, 245, 66, 0.45);
  }

  /* Legacy aliases */
  .marquee-btn { @apply btn-primary; }
  .marquee-btn-sm { @apply btn-sm; }
  .marquee-btn-light { @apply btn-secondary; }

  /* ——— Chips / Tabs ——— */
  .chip {
    display: inline-flex; align-items: center; gap: 0.45rem;
    padding: 0.4rem 0.85rem;
    border: 1px solid rgba(242, 237, 225, 0.15);
    background: rgba(19, 16, 12, 0.6);
    color: rgba(242, 237, 225, 0.75);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    border-radius: 999px;
    transition: all 0.2s ease;
  }
  .chip:hover {
    color: #F2EDE1;
    border-color: rgba(200, 163, 92, 0.5);
  }
  .chip-active {
    background: #C7F542;
    color: #0B0906;
    border-color: #C7F542;
    box-shadow: 0 0 18px rgba(199, 245, 66, 0.3);
  }

  /* ——— Inputs ——— */
  .retro-input {
    width: 100%;
    background: rgba(19, 16, 12, 0.9);
    border: 1px solid rgba(46, 39, 33, 0.9);
    color: #F2EDE1;
    padding: 0.7rem 0.9rem;
    font-family: 'Manrope', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    border-radius: 2px;
  }
  .retro-input::placeholder { color: rgba(242, 237, 225, 0.35); }
  .retro-input:focus {
    border-color: #C7F542;
    box-shadow: 0 0 0 1px #C7F542, 0 0 24px -6px rgba(199, 245, 66, 0.4);
  }

  /* ——— Live pulse ——— */
  .live-dot {
    width: 8px; height: 8px; border-radius: 9999px;
    background: #FF5F3E;
    box-shadow: 0 0 0 0 rgba(255, 95, 62, 0.7);
    animation: pulse 1.8s cubic-bezier(0.25, 1, 0.5, 1) infinite;
  }
  .lime-dot {
    width: 6px; height: 6px; border-radius: 9999px;
    background: #C7F542;
    box-shadow: 0 0 10px rgba(199, 245, 66, 0.8);
  }
  /* Back-compat for old retro bulbs */
  .bulb {
    width: 5px; height: 5px; border-radius: 9999px;
    background: #C8A35C;
    box-shadow: 0 0 6px rgba(200, 163, 92, 0.7);
  }
  .marquee-bulbs { display: flex; gap: 8px; align-items: center; }

  /* ——— Decorative ——— */
  .dashed-divider { border-top: 1px dashed rgba(200, 163, 92, 0.25); }
  .hairline { border-top: 1px solid rgba(242, 237, 225, 0.08); }
  .hairline-gold { border-top: 1px solid rgba(200, 163, 92, 0.35); }

  .spotlight-overlay {
    background:
      radial-gradient(ellipse 60% 40% at 50% 0%, rgba(200, 163, 92, 0.12) 0%, rgba(11, 9, 6, 0) 60%),
      radial-gradient(ellipse 40% 30% at 80% 20%, rgba(199, 245, 66, 0.06) 0%, rgba(11, 9, 6, 0) 70%);
  }

  .vignette {
    box-shadow: inset 0 0 120px 20px rgba(0, 0, 0, 0.7);
  }

  .tag-stamp {
    display: inline-block;
    border: 1px solid rgba(200, 163, 92, 0.6);
    color: #C8A35C;
    background: rgba(11, 9, 6, 0.6);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    padding: 0.2rem 0.55rem;
    backdrop-filter: blur(4px);
  }

  /* Kinetic scrolling ticker */
  .ticker-wrap {
    overflow: hidden;
    mask-image: linear-gradient(to right, transparent, #000 4%, #000 96%, transparent);
  }
  .ticker-track {
    display: flex; gap: 3rem;
    animation: ticker 32s linear infinite;
    white-space: nowrap;
  }

  .glow-lime { box-shadow: 0 0 40px rgba(199, 245, 66, 0.25); }
  .glow-gold { box-shadow: 0 0 30px rgba(200, 163, 92, 0.2); }

  /* Gold underline for inline emphasis */
  .goldline {
    background-image: linear-gradient(to top, rgba(200, 163, 92, 0.4) 0 30%, transparent 30%);
  }
}

/* Animations */
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 95, 62, 0.7); }
  70% { box-shadow: 0 0 0 12px rgba(255, 95, 62, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 95, 62, 0); }
}
@keyframes ticker {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
@keyframes fade-up {
  0% { opacity: 0; transform: translateY(14px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-up { animation: fade-up 0.6s cubic-bezier(0.25, 1, 0.5, 1) both; }

@keyframes flicker-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* visual-edits passthrough */
@layer base {
  [data-debug-wrapper="true"] { display: contents !important; }
  [data-debug-wrapper="true"] > * {
    margin-left: inherit; margin-right: inherit; margin-top: inherit; margin-bottom: inherit;
    padding-left: inherit; padding-right: inherit; padding-top: inherit; padding-bottom: inherit;
    column-gap: inherit; row-gap: inherit; gap: inherit;
    border-left-width: inherit; border-right-width: inherit; border-top-width: inherit; border-bottom-width: inherit;
    border-left-style: inherit; border-right-style: inherit; border-top-style: inherit; border-bottom-style: inherit;
    border-left-color: inherit; border-right-color: inherit; border-top-color: inherit; border-bottom-color: inherit;
  }
}
