import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';

/** One slim, static message (first announcement from admin → Content). */
export default function AnnouncementBar() {
  const { announcements } = useStore();
  const { l } = useLocalized();
  if (!announcements.length) return null;
  return (
    <div className="bg-bar text-white">
      <p className="container-x flex h-9 items-center justify-center truncate text-center text-xs font-medium tracking-wide sm:text-[13px]">{l(announcements[0])}</p>
    </div>
  );
}
