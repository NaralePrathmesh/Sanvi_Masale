import SmartImage from '@/components/common/SmartImage';
import PackShot from './PackShot';
import { useLocalized } from '@/hooks/useLocalized';
import { photo } from '@/assets/images';

/**
 * All real photos for a product, in order: explicit product.images first, otherwise
 * public/images/products/<slug>-1 … -4 (whichever exist). Empty → pack mockup is used.
 */
export function productPhotos(product) {
  if (product.images?.length) return product.images.map((src) => ({ src }));
  return [1, 2, 3, 4].map((n) => (photo(`products/${product.slug}-${n}`) ? { key: `products/${product.slug}-${n}` } : null)).filter(Boolean);
}
export const productPhotoCount = (product) => productPhotos(product).length;

/** Product image, fixed 4:5 ratio. `index` selects a photo; falls back to a generated pack mockup. */
export default function ProductImage({ product, index = 0, size, className = '', compact = false, eager = false, zoom = false, sizes = '(min-width:1024px) 25vw, 50vw' }) {
  const { l } = useLocalized();
  const name = l(product.name);
  const p = productPhotos(product)[index];
  return (
    <SmartImage
      src={p?.src}
      photo={p?.key}
      alt={name}
      eager={eager}
      sizes={sizes}
      zoom={zoom}
      className={`aspect-[4/5] w-full bg-[#FEFDF8] ${className}`}
      imgClassName="h-full w-full object-cover"
      fallback={<PackShot product={product} name={name} size={size ?? product.packs?.[0]?.size} compact={compact} />}
    />
  );
}
