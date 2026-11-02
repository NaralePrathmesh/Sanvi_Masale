/** Returns an i18n error key, or '' when valid. */
export const validators = {
  required: (v) => (String(v ?? '').trim() ? '' : 'validation.required'),
  name: (v) => (!String(v ?? '').trim() ? 'validation.required' : String(v).trim().length < 2 ? 'validation.name' : ''),
  email: (v) => (!String(v ?? '').trim() ? 'validation.required' : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()) ? '' : 'validation.email'),
  phone: (v) => (!String(v ?? '').trim() ? 'validation.required' : /^[6-9]\d{9}$/.test(String(v).replace(/\D/g, '').slice(-10)) && String(v).replace(/\D/g, '').length >= 10 ? '' : 'validation.phone'),
  pin: (v) => (!String(v ?? '').trim() ? 'validation.required' : /^[1-9]\d{5}$/.test(String(v).trim()) ? '' : 'validation.pin'),
  minLen: (n) => (v) => (String(v ?? '').trim().length >= n ? '' : 'validation.minLength'),
};

export function validate(values, schema) {
  const errors = {};
  Object.entries(schema).forEach(([field, rules]) => {
    for (const rule of [].concat(rules)) {
      const err = rule(values[field]);
      if (err) { errors[field] = err; break; }
    }
  });
  return errors;
}
