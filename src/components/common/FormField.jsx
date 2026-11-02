import { useId } from 'react';
import { useTranslation } from 'react-i18next';

/** Accessible label + input/select/textarea + error message. `error` is an i18n key. */
export default function FormField({ label, error, errorParams, as = 'input', children, className = '', hint, ...props }) {
  const { t } = useTranslation();
  const id = useId();
  const Comp = as;
  const cls = `input ${error ? 'input-error' : ''} ${as === 'textarea' ? 'min-h-[120px] py-3' : ''}`;
  return (
    <div className={className}>
      {label && <label htmlFor={id} className="label">{label}</label>}
      <Comp id={id} className={cls} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} {...props}>{children}</Comp>
      {hint && !error && <p className="mt-1 text-xs text-charcoal-400">{hint}</p>}
      {error && <p id={`${id}-err`} className="field-error" role="alert">{t(error, errorParams)}</p>}
    </div>
  );
}
