# सान्वी मसाले (Saanvi Masale) — Indian Masala E-Commerce (Phase 1: Frontend)

A premium, fully responsive storefront and admin dashboard for an Indian masala & spices brand.
**Phase 1 is frontend only.** All payments, logins, orders, deliveries and admin changes are
**demo functionality** that runs in the browser with mock data and `localStorage`.

> सान्वी मसाले (Saanvi Masale) is an original brand. It is not affiliated with MDH, Everest, Suhana
> or any other brand. All products, prices, reviews and customers are fictional demo data.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
npm run images     # re-scan public/images after adding photos (also runs before dev/build)
npm run build:preview  # single-file shareable preview (preview-build/)
```

Requires Node 18+.

### Demo logins
| Area | URL | Email | Password |
|---|---|---|---|
| Customer | `/login` | `demo@saanvimasale.example` | `demo123` (or any email + 6-char password) |
| Admin | `/admin/login` | `admin@saanvimasale.example` | `admin123` |

Demo coupons: `WELCOME10`, `SPICE20` (min ₹799), `FESTIVE15` (min ₹499), `FLAT50` (expired, for testing).
Demo serviceable PINs: any PIN starting with 411, 400, 110, 560, 600 … (see `src/config/site.js`). Try `999999` to see the "not serviceable" state.
Demo order IDs for tracking: `RR260001` – `RR260009`.

Reset everything: Account → Settings → "Reset all demo data", or Admin → Settings → Data & backup → "Reset store data".

## Admin panel (`/admin`)

A premium admin studio built with **GSAP** (number count-ups, staggered entrances, sparkline drawing, login backdrop) and **Framer Motion** (page transitions, slide-over drawers, shared-layout pills, list/board animations, drag feedback). Everything you change is applied to the storefront instantly.

| Section | What you can do |
|---|---|
| Dashboard | Revenue/orders/AOV KPIs with trends, revenue chart, orders-by-status donut, top sellers, stock alerts, latest reviews, recent orders |
| Products | Grid/table views, filters (live/hidden/low/out of stock), bulk show/hide/bestseller/delete, duplicate, tabbed editor (3-language name & description, pack sizes/prices/MRP/stock, images, badges), categories |
| Inventory | Stock per pack size with inline +/-, quick restock (+10/+50/+100), restock-all-low, low-stock threshold |
| Orders | Drag-and-drop status board or list, order drawer with status stepper, call/WhatsApp the customer, printable invoice, cancel |
| Customers | VIP / repeat / new segments, lifetime value, order history, email/WhatsApp |
| Coupons | Ticket-style cards, create/edit/pause/delete, live/scheduled/expired states |
| Content | Hero banners (image upload), announcement bar, featured products, homepage section toggles, recipes |
| Reviews | Hide/show, pin to top, edit, delete, add real customer reviews, remove all sample reviews |
| Settings | Store info, **calling & WhatsApp numbers** (used by the floating buttons), delivery charges, **default website theme** + visitor theme picker, backup download/restore, reset |

Extras: ⌘K / Ctrl+K command palette (jump to pages, products, orders, customers, quick actions), notifications bell (new orders, low stock, new reviews), collapsible sidebar, fully responsive.

> DEMO: admin data lives in this browser's localStorage. Use Settings → Data & backup to download a backup. Real accounts, roles and a database arrive with the Phase 2 backend.

## Tech stack
React 18 · Vite 5 · Tailwind CSS 3 · React Router 6 · Context API · i18next / react-i18next · Lucide icons · Recharts, GSAP 3 and Framer Motion 11 (admin panel only — loaded lazily, never in the storefront bundle).
No backend, database, payment gateway, OTP or courier integration.

## Where to change things (replace demo content)

| What | File |
|---|---|
| Brand name, logo, tagline, contact, social links | `src/config/brand.js` (set `logo.src` to use a real logo file in `/public/brand/`) |
| Colours & fonts | `tailwind.config.js`, `index.html` (Google Fonts) |
| Products (names ×3 languages, packs, prices, stock, ingredients, images) | `src/data/products.js` |
| Categories, product types, regions | `src/data/categories.js` |
| Recipes (×3 languages) and Cook & Shop masalas | `src/data/recipes.js` |
| Spice Journal articles | `src/data/journal.js` |
| Policy pages (shipping, returns, privacy, terms) and store locations | `src/data/pages.js` |
| Site URL for sitemap.xml | `SITE_URL` env var or `scripts/sitemap.mjs` |
| Hero banners, announcement bar, homepage sections | `src/data/banners.js` (also editable in `/admin/content`) |
| Testimonials / demo reviews | `src/data/testimonials.js`, `src/data/reviews.js` |
| Coupons, delivery charges, free-shipping threshold, serviceable PINs | `src/config/site.js` (also editable in admin) |
| All UI text | `src/i18n/en`, `src/i18n/hi`, `src/i18n/mr` (identical keys) |
| Category / region / page images | `src/assets/images.js` |

### Images (real photos)
Drop photos into `public/images/` using the names listed in **`public/images/EXPECTED.md`** (134 slots), e.g.
`public/images/hero/b1.webp`, `public/images/products/turmeric-powder-1.webp`, `public/images/recipes/puneri-misal-pav.webp`.
Then run `npm run images` (automatic on `npm run dev` / `npm run build`). The site picks them up with no code changes.

- Formats: `.webp` preferred (also `.jpg`, `.png`, `.avif`). Add an optional `-800` copy (e.g. `b1-800.webp`) for mobile `srcset`.
- Sizes: hero 16:9 (1920×1080) · category 1:1 · region 3:2 · product 4:5 (1000×1250) · recipe 4:3 · journal/festival 16:9.
- Products: `-1` = front of pack, `-2` = close-up/back (shown on hover). `product.images` in `data/products.js` still overrides.
- Stock photos must be downloaded and stored locally (never hot-linked); log them in `public/images/CREDITS.md`.
- Until a photo exists, an illustration (or generated pack mockup) is shown, so pages never show broken images.

## Folder structure
```
src/
  assets/images.js        central image registry
  components/
    admin/  cart/  checkout/  common/  home/  layout/  order/  product/  recipe/
  config/   brand.js, site.js
  context/  Store, Cart, Wishlist, Compare, Auth, Order, UI providers
  data/     products, categories, recipes, banners, testimonials, reviews
  hooks/    usePersistentState, useLocalized, useProductActions, ...
  i18n/     en/ hi/ mr/ + setup
  pages/    Home, Shop, Category, ProductDetails, Cart, Wishlist, Compare, Checkout,
            OrderConfirmation, Account, OrderTracking, Recipes, About, Contact, Offers,
            Festivals, GiftBoxes, Bulk, Stores, Journal, Faq, Legal, ComboBuilder,
            SpiceFinder, Regional, NotFound, Admin/*
  routes/   AppRoutes.jsx (lazy-loaded routes)
  services/mock/  storage.js (localStorage wrapper), seed.js (demo customers/orders)
  utils/    pricing (cart totals & coupons), validation, pincode, search, format
  styles/   index.css (design-system component classes)
```

## Phase 2 integration points
- `src/context/*Context.jsx` — each setter (add to cart, place order, update status, save product …) is the single place to swap `localStorage` for API calls.
- `src/utils/pricing.js` — totals/coupon maths; mirror it server-side and treat the server as the source of truth.
- `src/utils/pincode.js` — replace with a courier serviceability API.
- `src/context/AuthContext.jsx` — replace mock login with real auth (OTP/JWT/session).
- `src/pages/Checkout/CheckoutPage.jsx` → `onPlace` / `simulate` — replace with a real payment gateway flow.
