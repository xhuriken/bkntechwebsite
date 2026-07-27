import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * MentionsLegales Page Component
 * Contains regulatory legal notice for BKN Tech (SAS, SIRET, RCS, VAT, Publishing & Hosting details).
 */
export default function MentionsLegales() {
  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full max-w-4xl mx-auto px-6 py-12 md:py-20 z-10 relative"
    >
      {/* Back button */}
      <motion.div variants={itemVariants} className="mb-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-xs font-display font-black uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors group"
        >
          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          Retour à l'accueil
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="border-b border-white/5 pb-6 mb-10">
        <h1 className="font-display font-black text-3xl md:text-5xl uppercase tracking-tight mb-4">
          Mentions <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Légales</span>
        </h1>
        <p className="text-on-surface-variant text-sm font-light uppercase tracking-wider">
          Informations réglementaires & juridiques
        </p>
      </motion.div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Section 1 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-display font-black text-xs uppercase tracking-widest text-primary">
            1. Éditeur du site
          </h2>
          <div className="text-sm font-light text-on-surface-variant leading-relaxed">
            <strong className="text-on-surface font-semibold">Bkn Tech</strong> (SAS)<br />
            Société par Actions Simplifiée au capital de 1 000 €<br />
            Siège social : 47 rue Vivienne, 75002 Paris, France<br />
            Directeurs de la publication : Associés fondateurs de Bkn Tech
          </div>
        </motion.section>

        {/* Section 2 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-display font-black text-xs uppercase tracking-widest text-primary">
            2. Immatriculation & Identifiants
          </h2>
          <div className="text-sm font-light text-on-surface-variant leading-relaxed">
            SIRET : <span className="text-on-surface">104 054 150 00016</span><br />
            SIREN : <span className="text-on-surface">104 054 150</span><br />
            RCS : Paris B 104 054 150<br />
            TVA intracommunautaire : FR69104054150<br />
            <span className="text-[11px] italic opacity-80">(TVA non applicable, art. 293 B du CGI)</span>
          </div>
        </motion.section>

        {/* Section 3 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-display font-black text-xs uppercase tracking-widest text-primary">
            3. Hébergement
          </h2>
          <div className="text-sm font-light text-on-surface-variant leading-relaxed">
            Ce site web est hébergé par :<br />
            <strong className="text-on-surface font-semibold">Vercel Inc.</strong><br />
            400 1st Ave S, Suite 410<br />
            Minneapolis, MN 55401, États-Unis<br />
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline text-xs">
              https://vercel.com
            </a>
          </div>
        </motion.section>

        {/* Section 4 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-display font-black text-xs uppercase tracking-widest text-primary">
            4. Propriété Intellectuelle
          </h2>
          <div className="text-sm font-light text-on-surface-variant leading-relaxed">
            L'ensemble des contenus (textes, graphismes, logos, animations) présents sur ce site est la propriété exclusive de Bkn Tech, sauf mentions contraires.
            Toute reproduction ou redistribution, totale ou partielle, est interdite sans autorisation écrite préalable.
          </div>
        </motion.section>
      </div>

      {/* Footer stamp */}
      <motion.div variants={itemVariants} className="mt-16 pt-8 border-t border-white/5 text-center text-xs text-on-surface-variant/40 font-display">
        BKN TECH &copy; {new Date().getFullYear()} &mdash; TOUS DROITS RÉSERVÉS.
      </motion.div>
    </motion.div>
  );
}
