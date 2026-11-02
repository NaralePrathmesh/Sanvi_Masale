/**
 * Default store configuration used to seed the demo (admin can edit these in
 * /admin/settings; edits are persisted in localStorage).
 */
export const defaultSettings = {
  storeName: 'सान्वी मसाले',
  supportEmail: 'care@saanvimasale.example',
  supportPhone: '+91 98765 43210',
  whatsapp: '+91 98765 43210',          // used by the floating WhatsApp button + Contact page
  address: 'Plot 12, Spice Park MIDC, Pune, Maharashtra 411019 (placeholder)',
  defaultTheme: 'classic',              // classic | noir | fresh (admin → Settings → Appearance)
  allowThemePicker: true,               // let visitors switch theme from the header
  lowStockThreshold: 20,                // units per pack; used by admin inventory alerts
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
};

/** Demo coupons. `type` is 'percent' or 'flat'. */
export const defaultCoupons = [
  { code: 'WELCOME10', type: 'percent', value: 10, minOrder: 0, maxDiscount: 150, validFrom: '2026-01-01', validTo: '2027-12-31', active: true, description: { en: '10% off on your first order', hi: 'पहले ऑर्डर पर 10% की छूट', mr: 'पहिल्या ऑर्डरवर 10% सूट' } },
  { code: 'SPICE20', type: 'percent', value: 20, minOrder: 799, maxDiscount: 300, validFrom: '2026-01-01', validTo: '2027-12-31', active: true, description: { en: '20% off on orders above ₹799', hi: '₹799 से अधिक के ऑर्डर पर 20% की छूट', mr: '₹799 पेक्षा जास्त ऑर्डरवर 20% सूट' } },
  { code: 'FESTIVE15', type: 'percent', value: 15, minOrder: 499, maxDiscount: 250, validFrom: '2026-01-01', validTo: '2027-12-31', active: true, description: { en: 'Festive season: 15% off above ₹499', hi: 'त्योहारी सीज़न: ₹499 से ऊपर 15% की छूट', mr: 'सणासुदीचा हंगाम: ₹499 वर 15% सूट' } },
  { code: 'FLAT50', type: 'flat', value: 50, minOrder: 399, maxDiscount: 50, validFrom: '2026-01-01', validTo: '2026-06-30', active: false, description: { en: 'Flat ₹50 off above ₹399 (expired)', hi: '₹399 से ऊपर ₹50 की छूट (समाप्त)', mr: '₹399 वर ₹50 सूट (कालबाह्य)' } },
];

/**
 * DEMO serviceable PIN codes. Replace with a real courier serviceability API in
 * Phase 2. Prefix rules let whole regions be serviceable (e.g. all of Pune: '411').
 */
export const serviceablePins = {
  prefixes: ['110', '400', '401', '411', '412', '413', '416', '422', '431', '440', '560', '600', '500', '380', '700', '302', '226', '201', '122'],
  codUnavailable: ['416'],
  expressPrefixes: ['400', '411', '110', '560'],
};

export const languages = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'hi', label: 'हिंदी', short: 'हिं' },
  { code: 'mr', label: 'मराठी', short: 'मरा' },
];

export const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export const COMBO_BUILDER = { minItems: 3, tiers: [{ min: 3, pct: 10 }, { min: 5, pct: 15 }, { min: 7, pct: 20 }] };
export const MAX_COMPARE = 3;
export const ORDER_STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
