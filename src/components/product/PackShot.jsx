import { memo } from 'react';
import { brand } from '@/config/brand';

/**
 * Generated packaging mockup used until real product photos are added
 * (set product.images in data/products.js or via /admin/products).
 * Rendered in HTML so Hindi/Marathi names wrap correctly.
 */
function PackShot({ product, name, size, compact = false }) {
  const [primary, accent] = product.color || ['#A92324', '#E5A52B'];
  const isCombo = product.type === 'combo';
  return (
    <div className="flex h-full w-full items-center justify-center p-[8%]" style={{ background: `radial-gradient(circle at 50% 35%, #fff 0%, #FFF8ED 70%)` }}>
      <div className="relative flex h-full max-h-full w-[78%] flex-col overflow-hidden rounded-[14px] shadow-lift" style={{ background: primary }}>
        {/* top seal */}
        <div className="h-[7%] w-full" style={{ background: `repeating-linear-gradient(90deg, ${accent} 0 6px, transparent 6px 10px)`, opacity: 0.8 }} />
        <div className="flex flex-1 flex-col items-center justify-between px-[8%] pb-[8%] pt-[6%] text-center">
          <div className="flex items-center gap-1 rounded-full bg-black/15 px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
            <span className={`font-brand text-white ${compact ? 'text-[7px]' : 'text-[9px] sm:text-[10px]'}`}>{brand.name}</span>
          </div>
          {/* spice mound window */}
          <div className="relative my-[6%] aspect-square w-[62%] rounded-full border-[3px] border-white/70 shadow-inner" style={{ background: `radial-gradient(circle at 40% 35%, ${accent} 0%, ${accent} 30%, ${shade(primary)} 100%)` }}>
            {isCombo && <div className="absolute inset-[22%] rounded-full border-2 border-dashed border-white/60" />}
          </div>
          <div className="w-full">
            <p className={`font-display font-bold leading-tight text-white ${compact ? 'text-[10px]' : 'text-[13px] sm:text-sm'}`} style={{ textWrap: 'balance' }}>{name}</p>
            {size && <p className={`mt-1 inline-block rounded-full px-2 py-0.5 font-semibold ${compact ? 'text-[8px]' : 'text-[10px]'}`} style={{ background: accent, color: isLight(accent) ? '#28231F' : '#FFFFFF' }}>{size}</p>}
          </div>
        </div>
        <div className="h-[4%] w-full" style={{ background: accent }} />
      </div>
    </div>
  );
}

function isLight(hex) {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 140;
}

function shade(hex) {
  const n = parseInt(hex.slice(1), 16); const c = (v) => Math.max(0, v - 50);
  return `rgb(${c(n >> 16)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`;
}

export default memo(PackShot);
