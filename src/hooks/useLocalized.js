import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';
import { pickLang } from '@/utils/format';

/** `l(obj)` returns the current-language value of a { en, hi, mr } field. */
export function useLocalized() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || i18n.language || 'en';
  const l = useCallback((obj) => pickLang(obj, lang), [lang]);
  return { t, l, lang, i18n };
}
