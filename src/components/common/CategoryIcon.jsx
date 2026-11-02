import { Leaf, Sparkles, Flame, Soup, ChefHat, Zap, Timer, Package, Wheat, Star } from 'lucide-react';
/** Map of icon names usable in data/categories.js (`icon` field). */
export const CATEGORY_ICONS = { Leaf, Sparkles, Flame, Soup, ChefHat, Zap, Timer, Package, Wheat, Star };
export default function CategoryIcon({ name, size = 16, className }) {
  const Icon = CATEGORY_ICONS[name] || Sparkles;
  return <Icon size={size} className={className} />;
}
