import ProductCard from './ProductCard';
/** Consistent grid: 2 cols mobile, 3 tablet, 4 desktop (override with `cols`). */
export default function ProductGrid({ products, cols = 'lg:grid-cols-4' }) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 ${cols}`}>
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
