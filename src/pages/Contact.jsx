import { useTranslation } from 'react-i18next';
import ContactForm from '../components/ContactForm';

export default function Contact() {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith('en');
  return <div className="w-full"><header className="max-w-6xl mx-auto px-6 pt-12"><h1 className="font-display font-bold text-4xl md:text-5xl mb-6">{en ? 'Discuss your project with BKN Tech' : 'Parlons de votre projet avec BKN Tech'}</h1><p className="text-on-surface-variant text-lg leading-relaxed max-w-3xl">{en ? 'Website, mobile application, AI solution or video game: describe your goal, available resources and constraints. We can then discuss feasibility and prepare a suitable proposal.' : 'Site web, application mobile, solution IA ou jeu vidéo : décrivez votre objectif, vos ressources disponibles et vos contraintes. Nous pourrons ensuite discuter de la faisabilité et préparer une proposition adaptée.'}</p></header><ContactForm /></div>;
}
