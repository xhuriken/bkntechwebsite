import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getSeo, renderSeoTags } from '../seo';

export default function Seo() {
  const { pathname } = useLocation();
  const { i18n } = useTranslation();
  useEffect(() => {
    const seo = getSeo(pathname, i18n.language);
    document.documentElement.lang = seo.lang;
    const template = document.createElement('template');
    template.innerHTML = renderSeoTags(seo);
    // Replace only tags owned by SEO. Keep fonts, icons, CSS and Vite scripts intact.
    document.head.querySelectorAll('title, meta[name="description"], meta[name="robots"], link[rel="canonical"], meta[property^="og:"], meta[name^="twitter:"], #seo-structured-data').forEach(node => node.remove());
    document.head.append(template.content);
  }, [pathname, i18n.language]);
  return null;
}
