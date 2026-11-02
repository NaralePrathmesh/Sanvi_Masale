import { useCallback } from 'react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from './useLocalized';

/** Shared add-to-cart / wishlist / compare actions with localized toasts. */
export function useProductActions() {
  const cart = useCart();
  const wishlist = useWishlist();
  const compare = useCompare();
  const { toast } = useUI();
  const { t, l } = useLocalized();

  const addToCart = useCallback((product, size, qty = 1, { silent = false } = {}) => {
    cart.add(product.id, size || product.packs[0].size, qty);
    if (!silent) toast(t('product.addedToCart', { name: l(product.name) }), 'success', { to: '/cart', label: t('actions.viewCart') });
  }, [cart, toast, t, l]);

  const toggleWishlist = useCallback((product) => {
    const added = wishlist.toggle(product.id);
    toast(added ? t('product.addedToWishlist') : t('product.removedFromWishlist'), added ? 'success' : 'info', added ? { to: '/wishlist', label: t('header.wishlist') } : undefined);
  }, [wishlist, toast, t]);

  const toggleCompare = useCallback((product) => {
    const res = compare.toggle(product.id);
    if (res === 'full') toast(t('product.compareFull'), 'error', { to: '/compare', label: t('nav.compare') });
    else toast(res === 'added' ? t('product.addedToCompare') : t('product.removedFromCompare'), 'info', res === 'added' ? { to: '/compare', label: t('nav.compare') } : undefined);
  }, [compare, toast, t]);

  return { addToCart, toggleWishlist, toggleCompare, inWishlist: wishlist.has, inCompare: compare.has };
}
