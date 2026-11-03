/**
 * Store business rules shared by pricing, checkout and admin (server copy of the
 * storefront's src/config/site.js). Editable values live in the "settings" content block.
 */
export const DEFAULT_SETTINGS = {
  storeName: 'सान्वी मसाले',
  supportEmail: 'care@saanvimasale.example',
  supportPhone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',
  address: 'Plot 12, Spice Park MIDC, Pune, Maharashtra 411019 (placeholder)',
  gstin: '27AAAAA0000A1Z5 (placeholder)',
  currency: 'INR',
  defaultLanguage: 'en',
  enabledLanguages: ['en', 'hi', 'mr'],
  deliveryCharge: 49,
  expressDeliveryCharge: 99,
  freeShippingThreshold: 499,
  codCharge: 0,
  standardDeliveryDays: 5,
  expressDeliveryDays: 2,
  defaultTheme: 'classic',
  allowThemePicker: true,
  lowStockThreshold: 20,
};

/** Fields visitors may see (everything else in settings is admin-only). */
export const PUBLIC_SETTING_KEYS = ['storeName', 'supportEmail', 'supportPhone', 'whatsapp', 'address', 'gstin', 'currency', 'defaultLanguage', 'enabledLanguages',
  'deliveryCharge', 'expressDeliveryCharge', 'freeShippingThreshold', 'codCharge', 'standardDeliveryDays', 'expressDeliveryDays', 'defaultTheme', 'allowThemePicker'];

export const SERVICEABLE_PINS = {
  prefixes: ['110', '400', '401', '411', '412', '413', '416', '422', '431', '440', '560', '600', '500', '380', '700', '302', '226', '201', '122'],
  codUnavailable: ['416'],
  expressPrefixes: ['400', '411', '110', '560'],
};

export const COMBO_TIERS = [{ min: 3, pct: 10 }, { min: 5, pct: 15 }, { min: 7, pct: 20 }];
export const ORDER_FLOW = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
export const PAYMENT_METHODS = ['cod', 'upi', 'card', 'netbanking'];
export const MAX_QTY_PER_LINE = 10;
export const MAX_LINES = 40;
/** Customers may cancel until the order is being packed. */
export const CUSTOMER_CANCELLABLE = ['placed', 'confirmed'];
