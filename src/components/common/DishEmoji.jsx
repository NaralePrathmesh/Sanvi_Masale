/** Small round icon for Spice Finder dish options (swap for real thumbnails later). */
const MAP = { paneer: ['🧀', '#FDF6E7'], biryani: ['🍛', '#FBEDED'], pavBhaji: ['🥘', '#FBEDED'], misal: ['🌶️', '#FBEDED'], dal: ['🥣', '#FDF6E7'], chickenCurry: ['🍗', '#FDF6E7'], vegetables: ['🥦', '#EAF2EC'], snacks: ['🥟', '#EAF2EC'] };
export function DishEmoji({ dish, size = 'h-14 w-14 text-3xl' }) {
  const [e, bg] = MAP[dish] || ['🍲', '#FDF6E7'];
  return <span className={`flex ${size} items-center justify-center rounded-full`} style={{ background: bg }} aria-hidden="true">{e}</span>;
}
