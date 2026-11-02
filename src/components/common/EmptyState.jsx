export default function EmptyState({ icon: Icon, title, text, children }) {
  return (
    <div className="card mx-auto flex max-w-lg flex-col items-center px-6 py-14 text-center animate-fadeUp">
      {Icon && <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-chilli-50 text-chilli"><Icon size={28} /></div>}
      <h2 className="text-xl">{title}</h2>
      {text && <p className="mt-2 text-charcoal-500">{text}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  );
}
