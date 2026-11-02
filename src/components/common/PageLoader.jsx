/** Skeleton shown while a page's code loads. */
export default function PageLoader() {
  return (
    <div className="container-x py-10" role="status" aria-label="Loading">
      <div className="skeleton h-4 w-40" />
      <div className="skeleton mt-4 h-10 w-2/3 max-w-md" />
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="space-y-3"><div className="skeleton aspect-[4/5] w-full" /><div className="skeleton h-4 w-3/4" /><div className="skeleton h-4 w-1/2" /></div>)}
      </div>
    </div>
  );
}
