import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { services, servicePath } from '../content/services';
import ServiceLinks from '../components/ServiceLinks';
import Button from '../components/Button';
import NotFound from './NotFound';

export function Services() {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const lang = en ? 'en' : 'fr';
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-12">
      <p className="text-secondary font-mono text-sm mb-4">BKN Tech · Paris</p>
      <h1 className="font-display font-bold text-4xl md:text-5xl mb-6">{en ? 'Web, mobile, AI and video game development' : 'Développement web, mobile, IA et jeux vidéo'}</h1>
      <p className="text-on-surface-variant text-lg leading-relaxed max-w-3xl mb-10">{en ? 'BKN Tech is a development studio founded by Enrique Puerto and joined by Célestin Honvault. We build custom websites, mobile applications and AI tools, and develop our own cooperative Unity game, Vacuum Protocol. Explore the expertise relevant to your project.' : 'BKN Tech est un studio de développement fondé par Enrique Puerto, rejoint par Célestin Honvault. Nous concevons des sites web, des applications mobiles et des outils IA sur mesure, et développons notre propre jeu coopératif Unity, Vacuum Protocol. Découvrez l’expertise qui correspond à votre projet.'}</p>
      <div className="grid md:grid-cols-2 gap-6">
        {services.map(service => (
          <article key={service.slug} className="rounded-2xl border border-white/10 bg-surface-container-low/80 p-6 md:p-8">
            <i aria-hidden="true" className={`fa-solid ${service.icon} text-secondary text-2xl mb-5`} />
            <h2 className="font-display text-2xl font-bold mb-4"><Link className="hover:text-primary" to={servicePath(service)}>{service[lang].name}</Link></h2>
            <p className="text-on-surface-variant leading-relaxed mb-6">{service[lang].intro}</p>
            <Link to={servicePath(service)} className="text-primary underline underline-offset-4">{en ? 'Explore this expertise' : 'Découvrir cette expertise'}</Link>
          </article>
        ))}
      </div>
      <div className="mt-12 text-center"><Button href="/contact">{en ? 'Discuss your project' : 'Parlons de votre projet'}</Button></div>
    </div>
  );
}

export function Service() {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  const lang = en ? 'en' : 'fr';
  const service = services.find(item => item.slug === slug);
  if (!service) return <NotFound />;
  const copy = service[lang];
  return (
    <article className="w-full max-w-6xl mx-auto px-6 py-10 md:py-16">
      <nav aria-label={en ? 'Breadcrumb' : 'Fil d’Ariane'} className="flex flex-wrap gap-2 text-sm text-on-surface-variant mb-10">
        <Link to="/" className="hover:text-primary">{en ? 'Home' : 'Accueil'}</Link><span aria-hidden="true">/</span>
        <Link to="/services" className="hover:text-primary">Services</Link><span aria-hidden="true">/</span><span aria-current="page">{copy.name}</span>
      </nav>
      <header className="max-w-4xl mb-14">
        <p className="text-secondary font-mono text-sm mb-4">BKN Tech · {copy.name}</p>
        <h1 className="font-display font-bold text-3xl md:text-5xl leading-tight mb-6">{copy.heading}</h1>
        <p className="text-on-surface-variant text-lg leading-relaxed mb-8">{copy.intro}</p>
        <Button href="/contact">{en ? 'Discuss your project and request a quote' : 'Discuter de votre projet et demander un devis'}</Button>
      </header>
      <section aria-labelledby="service-scope" className="mb-14">
        <h2 id="service-scope" className="font-display text-2xl font-bold mb-6">{en ? 'What we can explore together' : 'Ce que nous pouvons construire ensemble'}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {copy.offers.map(([title, body]) => <div key={title} className="rounded-2xl border border-white/10 bg-surface-container-low/80 p-6"><h3 className="font-display text-lg font-bold text-primary mb-4">{title}</h3><p className="text-on-surface-variant leading-relaxed">{body}</p></div>)}
        </div>
      </section>
      <section className="rounded-2xl border border-secondary/25 bg-surface-container-low/80 p-6 md:p-8 mb-14">
        <h2 className="font-display text-2xl font-bold mb-4">{copy.proofTitle}</h2>
        <p className="text-on-surface-variant leading-relaxed mb-4">{copy.proof}</p>
        <Link to={`/portfolio/section/${service.category}`} className="text-secondary underline underline-offset-4">{en ? 'View the projects and development updates' : 'Voir les projets et leur développement'}</Link>
      </section>
      <section className="mb-14">
        <h2 className="font-display text-2xl font-bold mb-6">{en ? 'How to start your project' : 'Comment démarrer votre projet ?'}</h2>
        <ol className="list-decimal pl-6 space-y-4 text-on-surface-variant leading-relaxed">
          <li>{en ? 'Describe your goal, intended users, existing tools and any budget or timing constraints.' : 'Décrivez votre objectif, les utilisateurs visés, vos outils existants et vos contraintes de budget ou de calendrier.'}</li>
          <li>{en ? 'We discuss feasibility, priorities and scope before preparing a proposal.' : 'Nous échangeons sur la faisabilité, les priorités et le périmètre avant de préparer une proposition.'}</li>
          <li>{en ? 'The agreed scope defines development, review milestones and the conditions for delivery and support.' : 'Le périmètre convenu précise le développement, les étapes de validation et les conditions de livraison et de suivi.'}</li>
        </ol>
      </section>
      <section aria-labelledby="service-questions" className="mb-14">
        <h2 id="service-questions" className="font-display text-2xl font-bold mb-6">{en ? 'Questions about your project' : 'Vos questions avant de vous lancer'}</h2>
        <div className="space-y-6">{copy.questions.map(([question, answer]) => <div key={question}><h3 className="font-semibold text-lg mb-2">{question}</h3><p className="text-on-surface-variant leading-relaxed max-w-4xl">{answer}</p></div>)}</div>
      </section>
      <section className="border-t border-white/10 pt-8 mb-12">
        <h2 className="font-display text-2xl font-bold mb-4">{en ? 'Contact BKN Tech' : 'Contacter BKN Tech'}</h2>
        <p className="text-on-surface-variant mb-6">{en ? 'Tell us about your project. Our studio is based at 47 rue Vivienne, 75002 Paris, France.' : 'Présentez-nous votre projet. Notre studio est basé au 47 rue Vivienne, 75002 Paris, France.'}</p>
        <div className="flex flex-wrap items-center gap-6"><Button href="/contact">{en ? 'Send your enquiry' : 'Présenter votre projet'}</Button><a className="text-primary underline" href="mailto:contact@bkntech.fr">contact@bkntech.fr</a><a className="text-primary underline" href="tel:+33661201418">+33 6 61 20 14 18</a></div>
      </section>
      <ServiceLinks />
    </article>
  );
}

