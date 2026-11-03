import { FlaskConical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { API_MODE } from '@/services/api/client';
/** `demoOnly` notices describe simulated features and are hidden once the real backend is connected. */
export default function DemoNotice({ text, className = '', demoOnly = false }) {
  const { t } = useTranslation();
  if (demoOnly && API_MODE) return null;
  return (
    <div className={`flex items-start gap-2 rounded-xl border border-turmeric/40 bg-turmeric-50 px-3.5 py-2.5 text-xs text-charcoal-600 ${className}`} role="note">
      <FlaskConical size={15} className="mt-0.5 shrink-0 text-turmeric-700" />
      <span><strong className="mr-1 text-turmeric-700">{t('demo.label')}</strong>{text}</span>
    </div>
  );
}
