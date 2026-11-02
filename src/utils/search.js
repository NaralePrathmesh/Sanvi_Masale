/** Simple scored search across all language names, tags, category and ingredients. */
export function searchProducts(products, query) {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  const words = q.split(/\s+/);
  return products
    .map((p) => {
      const names = Object.values(p.name).join(' ').toLowerCase();
      const hay = `${names} ${Object.values(p.short).join(' ')} ${(p.tags || []).join(' ')} ${p.category} ${p.region} ${(p.ingredients || []).join(' ')} ${(p.dishes || []).join(' ')}`.toLowerCase();
      let score = 0;
      if (names.includes(q)) score += 10;
      if (Object.values(p.name).some((n) => n.toLowerCase().startsWith(q))) score += 5;
      words.forEach((w) => { if (hay.includes(w)) score += 2; });
      if (!words.every((w) => hay.includes(w))) score = names.includes(q) ? score : 0;
      return { p, score: score + p.popularity / 100 };
    })
    .filter((x) => x.score >= 1)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}
