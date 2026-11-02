/**
 * PLACEHOLDER ILLUSTRATIONS
 * Drawn in SVG so the demo never shows a broken image. Replace with real
 * photography by setting `src` in assets/images.js, data/banners.js,
 * data/recipes.js or product `images` — these components are then bypassed.
 */
import { memo, useMemo } from 'react';

function rng(seed) {
  let a = 0; for (let i = 0; i < seed.length; i++) a = (a * 31 + seed.charCodeAt(i)) | 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const SCENES = {
  bowls: { bg: '#2E2622', surface: '#3A2F29', spices: ['#E5A52B', '#A92324', '#8A9A45', '#8A5A2B', '#5A2A1C', '#C2362F'] },
  pure: { bg: '#F3E3C6', surface: '#EAD3AC', spices: ['#E5A52B', '#B5281F', '#8A9A45', '#9C7A3C'] },
  blend: { bg: '#3B2A22', surface: '#4A3529', spices: ['#6B3A24', '#A92324', '#C46A1F', '#E5A52B'] },
  maharashtra: { bg: '#5E1416', surface: '#741B1D', spices: ['#C0392B', '#28231F', '#E5A52B', '#8B1C1D'] },
  south: { bg: '#24402B', surface: '#2D4F35', spices: ['#B5541E', '#C2462B', '#E5A52B', '#3A3330'] },
  north: { bg: '#4A2A1C', surface: '#5A3322', spices: ['#5A2A1C', '#C46A1F', '#B42A1E', '#E5A52B'] },
  instant: { bg: '#E9F0E4', surface: '#D7E4CF', spices: ['#315C3B', '#7A4A2A', '#E5A52B', '#A92324'] },
  ready: { bg: '#F6E2C4', surface: '#EED2A8', spices: ['#D2691E', '#C77A2A', '#A92324', '#315C3B'] },
  combo: { bg: '#A92324', surface: '#B83234', spices: ['#E5A52B', '#FFF8ED', '#5A2A1C', '#315C3B'] },
  festive: { bg: '#7A1718', surface: '#8B1C1D', spices: ['#E5A52B', '#C46A1F', '#FFF8ED', '#A92324'], diyas: true },
};

const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v + amt));
  return `#${((c(n >> 16) << 16) | (c((n >> 8) & 255) << 8) | c(n & 255)).toString(16).padStart(6, '0')}`;
};

function Bowl({ x, y, r, color, rand, rim = '#7A5232' }) {
  const dots = useMemo(() => Array.from({ length: Math.round(r * 0.9) }, () => {
    const a = rand() * Math.PI * 2; const d = Math.sqrt(rand()) * r * 0.7;
    return { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, s: 1 + rand() * 2.2, o: rand() };
  }), [x, y, r, rand]);
  return (
    <g>
      <circle cx={x + 6} cy={y + 10} r={r * 1.02} fill="rgba(0,0,0,.25)" />
      <circle cx={x} cy={y} r={r} fill={rim} />
      <circle cx={x} cy={y} r={r * 0.86} fill={shade(rim, -30)} />
      <circle cx={x} cy={y} r={r * 0.78} fill={color} />
      <ellipse cx={x - r * 0.15} cy={y - r * 0.2} rx={r * 0.45} ry={r * 0.32} fill={shade(color, 22)} opacity=".55" />
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.s} fill={d.o > 0.5 ? shade(color, 40) : shade(color, -40)} opacity=".55" />)}
      <path d={`M${x - r * 0.62} ${y - r * 0.5} A ${r * 0.8} ${r * 0.8} 0 0 1 ${x + r * 0.2} ${y - r * 0.82}`} stroke="rgba(255,255,255,.25)" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}

const Star = ({ x, y, s, rot, fill }) => {
  const pts = Array.from({ length: 16 }, (_, i) => { const a = (i * Math.PI) / 8; const rr = i % 2 ? s * 0.38 : s; return `${x + Math.cos(a) * rr},${y + Math.sin(a) * rr}`; }).join(' ');
  return <polygon points={pts} fill={fill} transform={`rotate(${rot} ${x} ${y})`} />;
};
const Chilli = ({ x, y, s, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M0 0 C 20 -6, 50 -4, 70 10 C 60 6, 30 8, 4 8 Z" fill="#B5281F" />
    <path d="M-2 2 C -8 -2, -10 -6, -14 -4" stroke="#315C3B" strokeWidth="3" fill="none" strokeLinecap="round" />
  </g>
);
const Leaf = ({ x, y, s, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M0 0 C 12 -14, 34 -14, 46 0 C 34 14, 12 14, 0 0 Z" fill="#3E7A47" />
    <path d="M2 0 L 44 0" stroke="#2A5532" strokeWidth="1.5" />
  </g>
);
const Pod = ({ x, y, s, rot }) => <ellipse cx={x} cy={y} rx={9 * s} ry={5 * s} fill="#7FA35A" transform={`rotate(${rot} ${x} ${y})`} />;
const Diya = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx="0" cy="-28" rx="7" ry="14" fill="#FFD27A" /><ellipse cx="0" cy="-26" rx="3.5" ry="8" fill="#FFF3D1" />
    <path d="M-34 -8 Q 0 26 34 -8 Z" fill="#C46A1F" /><path d="M-34 -8 Q 0 0 34 -8" stroke="#E5A52B" strokeWidth="3" fill="none" />
  </g>
);

const LAYOUT = [
  { x: 0.24, y: 0.36, r: 0.17 }, { x: 0.55, y: 0.27, r: 0.13 }, { x: 0.8, y: 0.45, r: 0.16 },
  { x: 0.42, y: 0.72, r: 0.15 }, { x: 0.12, y: 0.82, r: 0.1 }, { x: 0.74, y: 0.84, r: 0.11 },
];

/** Top-down "spice bowls" scene. `variant` selects a palette. */
export const SceneArt = memo(function SceneArt({ variant = 'bowls', className = '', bowls = 5, title }) {
  const sc = SCENES[variant] || SCENES.bowls;
  const W = 800; const H = 600;
  const rand = useMemo(() => rng(variant + bowls), [variant, bowls]);
  const items = useMemo(() => {
    const r2 = rng(`${variant}-items`);
    return Array.from({ length: 16 }, (_, i) => ({ k: i % 4, x: r2() * W, y: r2() * H, rot: r2() * 360, s: 0.6 + r2() * 0.6 }));
  }, [variant]);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className={`h-full w-full ${className}`} role="img" aria-label={title || 'Spice illustration'}>
      <rect width={W} height={H} fill={sc.bg} />
      <rect width={W} height={H} fill={sc.surface} opacity=".45" />
      {Array.from({ length: 9 }, (_, i) => <line key={i} x1="0" x2={W} y1={i * 72 + 20} y2={i * 72 + 34} stroke="rgba(0,0,0,.06)" strokeWidth="18" />)}
      {items.map((it, i) => (it.k === 0 ? <Star key={i} x={it.x} y={it.y} s={14 * it.s} rot={it.rot} fill="#5A3322" />
        : it.k === 1 ? <Chilli key={i} x={it.x} y={it.y} s={it.s} rot={it.rot} />
        : it.k === 2 ? <Leaf key={i} x={it.x} y={it.y} s={it.s} rot={it.rot} />
        : <Pod key={i} x={it.x} y={it.y} s={it.s * 1.2} rot={it.rot} />))}
      {LAYOUT.slice(0, bowls).map((b, i) => (
        <Bowl key={i} x={b.x * W} y={b.y * H} r={b.r * W} color={sc.spices[i % sc.spices.length]} rand={rand} rim={i % 2 ? '#8C6A4A' : '#6E4A2E'} />
      ))}
      {sc.diyas && [[120, 540], [400, 560], [680, 540]].map(([x, y], i) => <Diya key={i} x={x} y={y} s={1.1} />)}
    </svg>
  );
});

/** Top-down plated dish for recipes. art = { curry, garnish, bowl } */
export const DishArt = memo(function DishArt({ art = {}, seed = 'dish', className = '', title }) {
  const { curry = '#C46A1F', garnish = '#315C3B', bowl = '#8C8C8C' } = art;
  const r = useMemo(() => rng(seed), [seed]);
  const bits = useMemo(() => Array.from({ length: 26 }, () => ({ a: r() * Math.PI * 2, d: Math.sqrt(r()) * 150, s: 3 + r() * 6, rot: r() * 180, g: r() > 0.5 })), [r]);
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className={`h-full w-full ${className}`} role="img" aria-label={title || 'Dish illustration'}>
      <rect width="800" height="600" fill="#F3E3C6" />
      {Array.from({ length: 8 }, (_, i) => <line key={i} x1="0" x2="800" y1={i * 80} y2={i * 80 + 20} stroke="rgba(90,58,40,.06)" strokeWidth="26" />)}
      <ellipse cx="600" cy="120" rx="150" ry="40" fill="#E9D2A6" transform="rotate(-20 600 120)" />
      <circle cx="640" cy="470" r="70" fill="#8C6A4A" /><circle cx="640" cy="470" r="58" fill="#E5A52B" />
      <circle cx="140" cy="110" r="52" fill="#6E4A2E" /><circle cx="140" cy="110" r="42" fill="#A92324" />
      <Leaf x={120} y={470} s={1.4} rot={-30} /><Leaf x={170} y={520} s={1.1} rot={20} /><Chilli x={560} y={60} s={1.3} rot={160} />
      <circle cx="406" cy="312" r="222" fill="rgba(0,0,0,.18)" />
      <circle cx="400" cy="300" r="220" fill={bowl} />
      <circle cx="400" cy="300" r="196" fill={shade(bowl, -25)} />
      <circle cx="400" cy="300" r="182" fill={curry} />
      <ellipse cx="350" cy="250" rx="90" ry="60" fill={shade(curry, 24)} opacity=".5" />
      {bits.map((b, i) => (b.g
        ? <ellipse key={i} cx={400 + Math.cos(b.a) * b.d} cy={300 + Math.sin(b.a) * b.d} rx={b.s * 1.6} ry={b.s * 0.8} fill={garnish} transform={`rotate(${b.rot} ${400 + Math.cos(b.a) * b.d} ${300 + Math.sin(b.a) * b.d})`} />
        : <circle key={i} cx={400 + Math.cos(b.a) * b.d} cy={300 + Math.sin(b.a) * b.d} r={b.s * 0.6} fill={shade(curry, -45)} opacity=".7" />))}
      <path d="M260 160 A 200 200 0 0 1 420 102" stroke="rgba(255,255,255,.35)" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
});
