import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { services, servicePath } from '../content/services';

export default function ServiceLinks() {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('en') ? 'en' : 'fr';
  return (
    <nav aria-label={lang === 'fr' ? 'Nos expertises' : 'Our expertise'} className="flex flex-wrap justify-center gap-3">
      {services.map(service => (
        <Link key={service.slug} to={servicePath(service)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-surface-container-low px-4 py-3 text-sm text-on-surface hover:border-primary hover:text-primary transition-colors">
          <i aria-hidden="true" className={`fa-solid ${service.icon}`} />
          {service[lang].name}
        </Link>
      ))}
    </nav>
  );
}
