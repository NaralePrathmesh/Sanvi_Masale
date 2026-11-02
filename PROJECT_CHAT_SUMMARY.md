# सान्वी मसाले (Saanvi Masale): Project Chat Summary

A record of everything requested and built in this chat for the Saanvi Masale e-commerce website.

- **Status:** Phase 1 (frontend only) is in progress, and the admin panel is complete.
- **Live preview:** https://claude.ai/artifact/M465LCypb3K5Y1Cju1Cewb (private, owner only)
- **Source code:** `saanvi-masale-frontend.zip`. Unzip it, then run `npm install` and `npm run dev`.
- **Not done:** nothing has been committed to Git, pushed or deployed.

---

## 1. Original brief (Phase 1: Frontend)

Build a premium, responsive Indian masala and spices e-commerce website. It is frontend only.

**Stack**
- React 18 with Vite 5 and JavaScript
- Tailwind CSS 3 and React Router 6
- Context API and localStorage for data
- i18next for languages, Lucide icons, and Recharts for charts

**Languages:** English, हिंदी and मराठी, with a switcher in the header.

**Pages**
- Shopping: home, shop, product details, cart, wishlist, checkout and order confirmation.
- Account: account area and order tracking.
- Content: recipes (with "Cook & Shop"), about and contact.
- Admin: a demo admin dashboard at `/admin`.

**Special features**
- Regional discovery, a combo builder and a spice finder.
- Smart search and coupons (WELCOME10, SPICE20, FESTIVE15).
- Recently viewed and frequently bought together.
- A PIN code delivery checker, compare up to 3 products, and festival specials.

**Strict rules**
- No backend, database, API server, real payments, real OTP or login, or real shipping integration.
- Every simulated payment, login and order is clearly labelled **DEMO**.
- No Git commit or push and no production deployment without permission.
- Never use other brands' logos, packaging or layouts.
- When the frontend is finished, stop and ask:
  > "Frontend development is complete. Have you added your real product images, branding assets, product information and other required content? Shall we begin backend and database development?"
- Phase 2 (backend and database) starts only after explicit approval.

---

## 2. Timeline of requests and what was done

| # | Request | Result |
|---|---|---|
| 1 | Build the Phase 1 frontend | Full storefront plus demo admin, 3 languages, all special features, mock data with DEMO labels |
| 2 | "Give me preview option" | Single-file preview build (`npm run build:preview`), published as a private artifact link |
| 3 | Real images, modern effects, name **सान्वी मसाले**, multi-page site | Rebranded; photo system (`public/images` → manifest); dedicated pages for categories, regions, festivals, gift boxes, bulk orders, store locator, journal, FAQ and policies |
| 4 | Sample images from Pinterest or other brands | **Declined** (copyright and trademarks). Used free Unsplash photos once that site was allowed |
| 5 | Full UI/UX redesign prompt | Clean, minimal, premium design system; 11-section homepage; page-specific layouts; all features kept |
| 6 | Modern effects, better hero, **masala (not food) images**, fresh light colours | Reveal animations, count-ups, tilt cards, light palette, spice close-up photos |
| 7 | Scrollbar and attractive effects | Branded scrollbar, top scroll-progress bar, back-to-top ring, header hides while scrolling, button shine |
| 8 | Use my logo; upgrade the cart | Logo cut out and used site-wide plus favicon; redesigned cart page and drawer (free-shipping bar, coupon tickets, save for later, sticky summary) |
| 9 | Use my campaign banner as the hero | Banner became the homepage hero, with a mobile crop and an action strip below it |
| 10 | Make the product cards premium | Glass badges, discount tag, size pills, gradient Add to Cart, hover quick-view |
| 11 | Use the original product photos from my zip | 18 real pack photos matched to products by the name printed on each pack; products renamed to match the packs; 2 new products added (Swad Chilli Powder, Byadgi Mirchi Powder); 3 category banners added |
| 12 | Hero image looked stretched; add fixed WhatsApp and call buttons | Whole banner always visible (natural 1920×650 ratio); floating WhatsApp and call buttons that move above the sticky bars |
| 13 | Replace the hero with the Powder Collection banner | Done |
| 14 | Premium review section with floating cards, 50 reviews, WhatsApp style, add review | WhatsApp-style chat wall, 50 sample reviews (Marathi, Hindi, English, Hinglish), Write a review form, `/reviews` page |
| 15 | Each review in its own box, overlapping, tilted and draggable | 50 green WhatsApp-style boxes scattered and tilted on a chat wallpaper; drag with mouse or finger to read; Shuffle button; fly-in animation |
| 16 | Three colour themes with a switcher, modern and minimal | **Saanvi Red** (default), **Minimal Noir**, **Fresh Leaf**; palette button in the header and mobile menu; choice remembered |
| 17 | Kanda Poha showed fried rice; give me a zip | Wrong photo removed; zip delivered |
| 18 | Add a Kanda Poha image (owner supplied the photo) | Cropped to 4:3 and added to the recipe; zip updated |
| 19 | **Premium admin panel with GSAP and Framer Motion, manage the whole store** | New admin studio (details in section 4) |

---

## 3. Storefront features (current)

- **Brand:** सान्वी मसाले logo, favicon, and the Powder Collection hero banner.
- **Homepage:** hero, spice marquee, categories, bestsellers, Maharashtra feature, Why Saanvi Masale, draggable review pile, recipes, brand story and newsletter.
- **Products:** 44 products. 18 use the real pack photos; the rest still use Unsplash spice photos.
- **Cart and checkout:** redesigned cart and drawer, a 4-step checkout with DEMO payment, coupons, free shipping above ₹499, and order tracking.
- **Discovery:** regional pages, festivals, combo builder, spice finder, compare, wishlist, recently viewed and frequently bought together.
- **Contact:** floating WhatsApp and call buttons, with numbers set in Admin → Settings.
- **Themes:** 3 colour themes, a visitor theme picker that admin can switch off, and a store default theme set in admin.
- **Languages:** English, Hindi and Marathi everywhere on the storefront. The admin panel is English only.
- **Motion:** respects the visitor's "reduce motion" setting.

---

## 4. Admin panel (`/admin`)

- **Demo login:** `admin@saanvimasale.example` / `admin123` (DEMO only, not secure).
- **GSAP:** number count-ups, card entrances, sparklines that draw themselves, and floating spice dots on the login page.
- **Framer Motion:** page transitions, slide-out panels, sliding tab highlights, list and grid animations, and the order board.

| Section | Features |
|---|---|
| Dashboard | Revenue, orders, average order value and customers with trends; revenue chart (3 or 6 months); orders-by-status donut; top sellers; stock alerts; latest reviews; recent orders |
| Products | Grid or table; filters (live, hidden, low stock, out of stock); bulk show, hide, bestseller or delete; duplicate; tabbed editor (details in 3 languages, sizes, prices and stock, images, badges); categories |
| Inventory | Stock per pack size; +/− buttons; quick +10/+50/+100; restock all low; low-stock alert level |
| Orders | Drag-and-drop status board or list; order panel with status steps, call and WhatsApp the customer, printable invoice, cancel |
| Customers | VIP, repeat and new groups; total spend; order history |
| Coupons | Ticket-style cards; create, edit, pause or delete; live, scheduled and expired states |
| Content | Hero banners (image upload), announcement bar, featured products, homepage section toggles, recipes |
| Reviews | Hide or show, pin, edit, delete, add real reviews, remove all samples in one click |
| Settings | Store info; **calling and WhatsApp numbers**; delivery charges; **default theme** and theme picker; **backup download and restore**; reset |

**Extras:**
- **Ctrl+K** search opens any page, product, order or customer.
- A **notifications bell** shows new orders, low stock and new reviews.
- The sidebar can be collapsed, and the panel is fully responsive.

---

## 5. Testing done

- **Admin:** sign-in and every admin page tested in a real browser. Also tested: creating and hiding a product, restocking, changing an order's status by button and by dragging, adding a review, creating a coupon, changing the WhatsApp number and default theme, and Ctrl+K search. No browser errors.
- **End-to-end:** 30 checks pass on desktop and on mobile.
- **Page-by-page:** every storefront and admin page at 3 screen widths in all 3 languages, checking for errors, sideways scrolling, broken images and untranslated text. No problems found.
- **Translations:** English, Hindi and Marathi have the same set of text entries (831 each), with none missing.

---

## 6. Limits (by design for Phase 1)

- **Saved in one browser only:** all data and admin changes are stored in the browser (localStorage). Use Admin → Settings → Data & backup to keep a copy.
- **Simulated only:** payments, OTP, login and shipping are not real.
- **Preview link blocks some features:** the backup download and the printable invoice may not work there, because downloads and pop-ups are blocked. They work when you run the site from the zip.
- **Sample reviews:** the 50 reviews are made-up samples and carry a "Sample reviews" label. Replace them with real reviews before launch; the admin has a one-click remove.

---

## 7. Open items (waiting on the owner)

1. **Real WhatsApp and calling numbers.** They are still the placeholder +91 98765 43210. You can now set them yourself in Admin → Settings.
2. **26 products without real pack photos.** Should they be hidden, or will photos be supplied?
3. **Special Matan Masala.** It appears on the Maharashtrian banner but has no product or pack photo.
4. **Prices and sizes** for Swad Chilli Powder and Byadgi Mirchi Powder (currently demo values).
5. **Wrong recipe photos.** Amritsari Chole shows a meat curry and Puneri Misal Pav shows a chicken curry. Please send real photos.
6. **Real customer reviews** to replace the 50 samples.
7. **Phase 2 (backend and database).** Starts only after you confirm your real content is ready and give approval.

---

## 8. How to run

You need Node.js installed. Unzip `saanvi-masale-frontend.zip`, then run:

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173. The admin panel is at http://localhost:5173/admin/login.

To build the single-file offline preview:

```bash
npm run build:preview
```

It writes `preview-build/rasoi-ratna-preview.html`.
