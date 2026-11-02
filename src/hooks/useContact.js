import { useStore } from '@/context/StoreContext';
import { brand } from '@/config/brand';

/** Store contact details — editable in Admin → Settings, falling back to config/brand.js. */
export function useContact() {
  const { settings } = useStore();
  const phone = settings.supportPhone || brand.contact.phone;
  const whatsapp = settings.whatsapp || brand.contact.whatsapp;
  const digits = (n) => String(n).replace(/[^\d]/g, '');
  return { phone, whatsapp, email: settings.supportEmail || brand.contact.email, address: settings.address || brand.contact.address, tel: `+${digits(phone)}`, waDigits: digits(whatsapp) };
}
