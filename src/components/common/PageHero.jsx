import SmartImage from './SmartImage';
import Breadcrumbs from './Breadcrumbs';
import { hasPhoto } from '@/assets/images';

/**
 * Calm page header used by landing pages: breadcrumb, title, one short line and
 * (when a real photo exists) a single image on the right. No parallax, no overlays.
 */
export default function PageHero({ image, photo, eyebrow, title, subtitle, crumbs, children }) {
  const photoKey = photo || image?.photo;
  const showImage = !!(image?.src || hasPhoto(photoKey));
  return (
    <section className="border-b border-line bg-white">
      <div className={`container-x grid items-center gap-8 py-8 sm:py-10 ${showImage ? 'md:grid-cols-[1.1fr_1fr] lg:gap-14' : ''}`}>
        <div className="max-w-2xl">
          {crumbs && <Breadcrumbs items={crumbs} />}
          {eyebrow && <p className="eyebrow mb-3 mt-4">{eyebrow}</p>}
          <h1 className={`h-page ${eyebrow ? '' : 'mt-4'}`}>{title}</h1>
          {subtitle && <p className="mt-3 max-w-xl text-base leading-relaxed text-charcoal-500 sm:text-lg">{subtitle}</p>}
          {children && <div className="mt-6">{children}</div>}
        </div>
        {showImage && <SmartImage image={image} photo={photo} alt="" eager sizes="(min-width:768px) 45vw, 100vw" className="hidden aspect-[16/10] w-full rounded-2xl md:block" />}
      </div>
    </section>
  );
}
