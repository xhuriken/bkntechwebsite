import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

/**
 * PolitiqueConfidentialite Page Component
 * Complete Privacy Policy document compliant with GDPR (RGPD) & CNIL guidelines.
 */
export default function PolitiqueConfidentialite() {
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
          className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors group"
        >
          <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Retour à l'accueil
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div variants={itemVariants} className="border-b border-white/5 pb-6 mb-10">
        <h1 className="font-sans font-extrabold text-3xl md:text-5xl uppercase tracking-tight mb-4">
          Politique de <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Confidentialité</span>
        </h1>
        <p className="text-on-surface/80 text-sm font-normal tracking-wide uppercase">
          Protection des données personnelles & Conformité RGPD — Dernière mise à jour : 28 juillet 2026
        </p>
      </motion.div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 pb-8">
        {/* Section 1 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            1. Responsable du Traitement
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed">
            Le responsable du traitement des données à caractère personnel collectées sur ce site est :<br />
            <strong className="text-on-surface font-semibold">Bkn Tech (SAS)</strong><br />
            47 rue Vivienne, 75002 Paris, France<br />
            SIREN : 104 054 150<br />
            Pour toute question relative à la protection de vos données, vous pouvez nous contacter par email :{' '}
            <a href="mailto:contact@bkntech.fr" className="text-secondary hover:underline font-medium">
              contact@bkntech.fr
            </a>
          </div>
        </motion.section>

        {/* Section 2 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            2. Données Collectées & Finalités
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed">
            Nous collectons uniquement les données transmises volontairement via notre formulaire de contact :
            <ul className="list-disc list-inside mt-2 space-y-1 text-on-surface/90 text-xs">
              <li>Identité : Nom, Prénom</li>
              <li>Coordonnées : Adresse e-mail, Téléphone</li>
              <li>Contenu de la demande : Sujet et Message</li>
            </ul>
            <p className="mt-2 text-xs text-on-surface/80">
              <strong className="text-on-surface">Finalité & Base légale :</strong> Répondre à vos demandes de renseignements et établir des propositions commerciales (Intérêt légitime / Mesures précontractuelles - Art. 6.1 RGPD).
            </p>
          </div>
        </motion.section>

        {/* Section 3 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            3. Durée de Conservation
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed">
            Vos données personnelles sont conservées :
            <ul className="list-disc list-inside mt-2 space-y-1 text-on-surface/90 text-xs">
              <li><strong className="text-on-surface">Demandes d'information :</strong> 3 ans maximum à compter du dernier contact émanant de votre part.</li>
              <li><strong className="text-on-surface">Relations commerciales :</strong> Pendant toute la durée de la relation contractuelle, puis 5 à 10 ans selon les obligations légales comptables et fiscales.</li>
            </ul>
          </div>
        </motion.section>

        {/* Section 4 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            4. Destinataires & Hébergement
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed">
            Vos données sont strictement destinées aux membres de l'équipe de Bkn Tech.<br />
            <strong className="text-on-surface">Aucune revente ni cession à des tiers.</strong><br />
            <span className="text-xs text-on-surface/80 mt-1 block">
              Nos infrastructures d'hébergement et de routage d'emails sont opérées par <strong className="text-on-surface">OVHcloud SAS</strong> sur des serveurs sécurisés situés exclusivement en France / Union Européenne.
            </span>
          </div>
        </motion.section>

        {/* Section 5 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3 md:col-span-2 border-t border-white/5 pt-6">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            5. Cookies & Technologies de Stockage
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed">
            Ce site n'utilise <strong className="text-on-surface">aucun cookie de ciblage publicitaire ni aucun traceur tiers à des fins d'analyse comportementale</strong> (ex: Google Analytics, Facebook Pixel).<br />
            Nous utilisons uniquement du stockage local technique strictement nécessaire au fonctionnement de l'interface (ex: mémorisation de votre langue de préférence FR/EN via <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded text-secondary font-mono">i18nextLng</code>). Conformément aux directives de la CNIL, ces éléments techniques sont dispensés de consentement préalable.
          </div>
        </motion.section>

        {/* Section 6 */}
        <motion.section variants={itemVariants} className="flex flex-col gap-3 md:col-span-2 border-t border-white/5 pt-6">
          <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary">
            6. Vos Droits (Conformité RGPD)
          </h2>
          <div className="text-sm font-normal text-on-surface leading-relaxed space-y-3">
            <p>
              Conformément à la réglementation européenne (RGPD UE 2016/679) et à la loi Informatique et Libertés, vous disposez des droits suivants concernant vos données personnelles :
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-on-surface/90">
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                <strong className="text-on-surface block mb-1">Droit d'accès & Rectification</strong>
                Consulter ou faire corriger vos données personnelles à tout moment.
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                <strong className="text-on-surface block mb-1">Droit à l'effacement (Oubli)</strong>
                Demander la suppression définitive de vos données personnelles.
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                <strong className="text-on-surface block mb-1">Droit à la limitation & Opposition</strong>
                Restreindre ou vous opposer au traitement de vos données.
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg">
                <strong className="text-on-surface block mb-1">Portabilité des données</strong>
                Recevoir vos données dans un format structuré et lisible.
              </div>
            </div>
            <p className="text-xs text-on-surface/80 pt-2">
              Pour exercer l'un de ces droits, contactez-nous par email à :{' '}
              <a href="mailto:contact@bkntech.fr" className="text-secondary hover:underline font-semibold">
                contact@bkntech.fr
              </a>.<br />
              Si vous estimez après nous avoir contactés que vos droits ne sont pas respectés, vous pouvez adresser une réclamation auprès de la <strong className="text-on-surface">CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) sur leur site{' '}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">
                www.cnil.fr
              </a>.
            </p>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
