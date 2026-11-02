import { useEffect } from 'react';
import { brand } from '@/config/brand';

/** Sets SEO-friendly <title> and meta description per page. */
export function useDocumentTitle(title, description) {
  useEffect(() => {
    document.title = title ? `${title} | ${brand.name}` : `${brand.name} (${brand.nameLatin}) — Authentic Indian Masalas`;
    if (description) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) { tag = document.createElement('meta'); tag.name = 'description'; document.head.appendChild(tag); }
      tag.setAttribute('content', description);
    }
  }, [title, description]);
}
