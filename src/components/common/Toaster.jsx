import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUI } from '@/context/UIContext';

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };
export default function Toaster() {
  const { toasts, dismissToast } = useUI();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end" aria-live="polite">
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info;
        return (
          <div key={t.id} className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-charcoal px-4 py-3 text-sm text-white shadow-lift animate-fadeUp">
            <Icon size={18} className={t.type === 'error' ? 'mt-0.5 shrink-0 text-red-300' : 'mt-0.5 shrink-0 text-turmeric'} />
            <p className="flex-1">{t.message}</p>
            {t.action && <Link to={t.action.to} onClick={() => dismissToast(t.id)} className="shrink-0 font-semibold text-turmeric hover:underline">{t.action.label}</Link>}
            <button type="button" onClick={() => dismissToast(t.id)} className="shrink-0 text-white/60 hover:text-white" aria-label="Dismiss"><X size={16} /></button>
          </div>
        );
      })}
    </div>
  );
}
