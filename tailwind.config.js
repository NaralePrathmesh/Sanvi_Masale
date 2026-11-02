/** Design tokens. Colour values live in src/styles/themes.css (one block per theme). */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Colours come from CSS variables (src/styles/themes.css) so the visitor can switch themes.
      colors: {
        chilli: { DEFAULT: 'rgb(var(--chilli) / <alpha-value>)', 50: 'rgb(var(--chilli-50) / <alpha-value>)', 100: 'rgb(var(--chilli-100) / <alpha-value>)', 600: 'rgb(var(--chilli) / <alpha-value>)', 700: 'rgb(var(--chilli-700) / <alpha-value>)', 800: 'rgb(var(--chilli-800) / <alpha-value>)', deep: 'rgb(var(--chilli-deep) / <alpha-value>)' },
        turmeric: { DEFAULT: 'rgb(var(--turmeric) / <alpha-value>)', 50: 'rgb(var(--turmeric-50) / <alpha-value>)', 100: 'rgb(var(--turmeric-100) / <alpha-value>)', 600: 'rgb(var(--turmeric) / <alpha-value>)', 700: 'rgb(var(--turmeric-700) / <alpha-value>)' },
        cream: { DEFAULT: 'rgb(var(--cream) / <alpha-value>)', 100: 'rgb(var(--cream) / <alpha-value>)', 200: 'rgb(var(--cream-200) / <alpha-value>)', 300: 'rgb(var(--cream-300) / <alpha-value>)' },
        leaf: { DEFAULT: 'rgb(var(--leaf) / <alpha-value>)', 50: 'rgb(var(--leaf-50) / <alpha-value>)', 100: 'rgb(var(--leaf-100) / <alpha-value>)', 600: 'rgb(var(--leaf) / <alpha-value>)', 700: 'rgb(var(--leaf-700) / <alpha-value>)' },
        charcoal: { DEFAULT: 'rgb(var(--charcoal) / <alpha-value>)', 400: 'rgb(var(--charcoal-400) / <alpha-value>)', 500: 'rgb(var(--charcoal-500) / <alpha-value>)', 600: 'rgb(var(--charcoal-600) / <alpha-value>)', 700: 'rgb(var(--charcoal) / <alpha-value>)' },
        line: 'rgb(var(--line) / <alpha-value>)',
        bar: 'rgb(var(--bar) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['Manrope', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        brand: ['"Yatra One"', '"Noto Serif Devanagari"', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(40,37,34,.04)',
        soft: '0 6px 24px -8px rgba(40,37,34,.12)',
        lift: '0 12px 32px -12px rgba(40,37,34,.18)',
      },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'none' } },
        slideIn: { '0%': { transform: 'translateX(100%)' }, '100%': { transform: 'none' } },
        kenburns: { '0%': { transform: 'scale(1)' }, '100%': { transform: 'scale(1.09) translate(-1%, -1%)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        
        wiggle: { '0%,100%': { transform: 'rotate(0)' }, '20%': { transform: 'rotate(-18deg) translateX(-2px)' }, '40%': { transform: 'rotate(14deg) translateX(2px)' }, '60%': { transform: 'rotate(-8deg)' } },
        bubbleIn: { '0%': { opacity: 0, transform: 'translateY(10px) scale(.96)' }, '100%': { opacity: 1, transform: 'none' } },
        heroIn: { '0%': { opacity: 0, transform: 'translateY(22px)' }, '100%': { opacity: 1, transform: 'none' } },
        pageIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        bump: { '0%,100%': { transform: 'scale(1)' }, '40%': { transform: 'scale(1.35)' } },
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        drift: { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(24px,-18px) scale(1.06)' } },
        draw: { '0%': { strokeDashoffset: '300' }, '100%': { strokeDashoffset: '0' } },
        shine: { '0%': { transform: 'translateX(-120%) skewX(-20deg)' }, '100%': { transform: 'translateX(220%) skewX(-20deg)' } },
        scrollCue: { '0%': { transform: 'translateY(0)', opacity: 1 }, '80%': { transform: 'translateY(10px)', opacity: 0 }, '100%': { opacity: 0 } },
      },
      animation: {
        fadeUp: 'fadeUp .4s ease-out both', slideIn: 'slideIn .3s ease-out both', kenburns: 'kenburns 9s ease-out both',
        marquee: 'marquee 40s linear infinite', wiggle: 'wiggle 1.6s ease-in-out infinite', bubbleIn: 'bubbleIn .45s cubic-bezier(.2,.7,.2,1) both', heroIn: 'heroIn .8s cubic-bezier(.2,.7,.2,1) both', pageIn: 'pageIn .35s ease-out both',
        bump: 'bump .45s ease-out', float: 'float 6s ease-in-out infinite', drift: 'drift 18s ease-in-out infinite',
        draw: 'draw 1.2s .6s ease-out both', shine: 'shine .9s ease-out', shimmer: 'shimmer 1.3s linear infinite', scrollCue: 'scrollCue 1.6s ease-in-out infinite',
      },
      transitionTimingFunction: { smooth: 'cubic-bezier(.2,.7,.2,1)' },
    },
  },
  plugins: [],
};
