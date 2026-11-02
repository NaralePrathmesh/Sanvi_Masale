import { Link } from 'react-router-dom';
import ProductImage from '@/components/product/ProductImage';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { formatINR } from '@/utils/format';

export default function OrderItems({ items }) {
  const { getProduct } = useStore();
  const { t, l } = useLocalized();
  return (
    <ul className="divide-y divide-line">
      {items.map((it, i) => {
        const p = getProduct(it.productId);
        return (
          <li key={i} className="flex items-center gap-3 py-3">
            <div className="w-14 shrink-0 overflow-hidden rounded-lg">{p ? <ProductImage product={p} size={it.size} compact /> : <div className="aspect-[4/5] bg-cream" />}</div>
            <div className="min-w-0 flex-1">
              {p ? <Link to={`/product/${p.slug}`} className="font-semibold hover:text-chilli">{l(p.name)}</Link> : <span className="font-semibold">{l(it.name) || it.productId}</span>}
              <p className="text-xs text-charcoal-500">{it.size} · {t('order.qty')}: {it.qty}{it.comboPct ? ` · ${t('cart.comboTag', { pct: it.comboPct })}` : ''}</p>
            </div>
            <span className="text-sm font-semibold">{formatINR(it.price * it.qty)}</span>
          </li>
        );
      })}
    </ul>
  );
}
