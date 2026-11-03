import { LayoutDashboard, Package, Boxes, ShoppingCart, Users, Ticket, LayoutTemplate, MessageSquareHeart, Settings } from 'lucide-react';

/** Admin navigation, grouped. `end` = exact match for the active state. */
export const ADMIN_NAV = [
  { group: 'Overview', items: [{ perm: 'dashboard:read', to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, desc: 'Sales, orders and store health at a glance' }] },
  { group: 'Catalogue', items: [
    { perm: 'products:read', to: '/admin/products', label: 'Products', icon: Package, desc: 'Add, edit, hide or delete products & categories' },
    { perm: 'inventory:write', to: '/admin/inventory', label: 'Inventory', icon: Boxes, desc: 'Stock per pack size, restock and low-stock alerts' },
  ] },
  { group: 'Sales', items: [
    { perm: 'orders:read', to: '/admin/orders', label: 'Orders', icon: ShoppingCart, desc: 'Order board, status updates and invoices' },
    { perm: 'customers:read', to: '/admin/customers', label: 'Customers', icon: Users, desc: 'Customer list, segments and order history' },
    { perm: 'coupons:write', to: '/admin/coupons', label: 'Coupons', icon: Ticket, desc: 'Discount codes and offers' },
  ] },
  { group: 'Storefront', items: [
    { perm: 'content:write', to: '/admin/content', label: 'Content', icon: LayoutTemplate, desc: 'Hero banners, announcement bar, homepage sections, recipes' },
    { perm: 'reviews:moderate', to: '/admin/reviews', label: 'Reviews', icon: MessageSquareHeart, desc: 'Approve, pin, hide, add or delete customer reviews' },
  ] },
  { group: 'System', items: [{ perm: 'settings:write', to: '/admin/settings', label: 'Settings', icon: Settings, desc: 'Store info, WhatsApp & phone, delivery, theme, backup' }] },
];
export const NAV_FLAT = ADMIN_NAV.flatMap((g) => g.items);
export const navTitle = (pathname) => NAV_FLAT.find((n) => (n.end ? pathname === n.to : pathname.startsWith(n.to)))?.label || 'Admin';
