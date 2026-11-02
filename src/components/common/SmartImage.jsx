import { useState } from 'react';
import { SceneArt, DishArt } from './Art';
import { photo as resolvePhoto } from '@/assets/images';

/**
 * Real photo when available — from an explicit `src` (path, URL or data URL) or a
 * `photo` key from the image manifest — lazy-loaded with srcset and an error fallback.
 * Otherwise shows the placeholder illustration (`art` scene, `dish` colours or `fallback`).
 * `image` may be passed as a registry entry: { photo, art } or { src, art }.
 */
export default function SmartImage({ src, photo, image, alt = '', art, dish, seed, fallback, className = '', imgClassName = 'h-full w-full object-cover', eager = false, sizes = '100vw', zoom = false }) {
  const [failed, setFailed] = useState(false);
  const resolved = src ? { src } : resolvePhoto(photo || image?.photo) || (image?.src ? { src: image.src } : null);
  const showImg = resolved && !failed;
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {showImg ? (
        <img src={resolved.src} srcSet={resolved.srcSet} sizes={resolved.srcSet ? sizes : undefined} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async"
          onError={() => setFailed(true)} className={`${imgClassName} ${zoom ? 'transition-transform duration-500 ease-out group-hover:scale-[1.04]' : ''}`} />
      ) : fallback || (dish ? <DishArt art={dish} seed={seed || alt} title={alt} /> : <SceneArt variant={art || image?.art || 'bowls'} title={alt} />)}
    </div>
  );
}
