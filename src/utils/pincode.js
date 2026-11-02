import { serviceablePins } from '@/config/site';

/** DEMO PIN code serviceability check. Replace with a courier API in Phase 2. */
export function checkPincode(pin, settings) {
  if (!/^[1-9]\d{5}$/.test(String(pin))) return { valid: false };
  const p = String(pin);
  const serviceable = serviceablePins.prefixes.some((pre) => p.startsWith(pre));
  if (!serviceable) return { valid: true, serviceable: false };
  const express = serviceablePins.expressPrefixes.some((pre) => p.startsWith(pre));
  const cod = !serviceablePins.codUnavailable.some((pre) => p.startsWith(pre));
  const days = express ? settings.expressDeliveryDays + 1 : settings.standardDeliveryDays;
  const eta = new Date(); eta.setDate(eta.getDate() + days);
  return { valid: true, serviceable: true, express, cod, eta: eta.toISOString(), days };
}
