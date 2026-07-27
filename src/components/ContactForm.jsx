import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import InputField from './InputField';
import Button from './Button';

/**
 * Native Browser Web Crypto SHA-256 helper
 */
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Proof of Work (PoW) local solver
 * Finds a nonce such that SHA-256(salt + nonce) starts with '000'
 */
async function solveChallenge(salt) {
  let nonce = 0;
  const targetPrefix = '000'; // Complexity level 3 (fast in browser, hard for spam bots)
  while (true) {
    const hash = await sha256(salt + nonce);
    if (hash.startsWith(targetPrefix)) {
      return { nonce, hash };
    }
    nonce++;
    // Safety break to prevent freeze (though complexity 3 takes ~10-100ms)
    if (nonce > 50000) return { nonce, hash };
  }
}

export default function ContactForm() {
  const { t } = useTranslation();

  // Obfuscated client-side variables to prevent email & phone scrapers
  const [emailText, setEmailText] = useState('');
  const [phoneText, setPhoneText] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    bkn_website_bot_trap: '' // Honeypot field
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle, checking, sending, success, error
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Obfuscation assembly on mount
    const emailParts = ['contact', '@', 'bkntech', '.', 'fr'];
    const phoneParts = ['+', '33', ' ', '1', ' ', '00', ' ', '00', ' ', '00', ' ', '00'];
    setEmailText(emailParts.join(''));
    setPhoneText(phoneParts.join(''));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Le nom est requis.";
    if (!formData.email.trim()) {
      tempErrors.email = "L'adresse email est requise.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        tempErrors.email = "Format d'email invalide.";
      }
    }
    if (!formData.subject.trim()) tempErrors.subject = "Le sujet est requis.";
    if (!formData.message.trim()) tempErrors.message = "Le message est requis.";
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('checking');
    setStatusMessage("Résolution du défi de sécurité local...");

    try {
      // 1. Generate local PoW challenge
      const salt = formData.email + Date.now();
      const powResult = await solveChallenge(salt);

      setStatus('sending');
      setStatusMessage("Envoi en cours...");

      // 2. Send payload to serverless route
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pow: powResult
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          bkn_website_bot_trap: ''
        });
      } else {
        setStatus('error');
        setStatusMessage(data.error || "Une erreur est survenue lors de l'envoi.");
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setStatusMessage("Impossible de joindre le serveur de messagerie.");
    }
  };

  return (
    <section id="contact" className="w-full py-20 px-6 md:px-12 max-w-7xl mx-auto z-10 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Info Column (Left) */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full">
          <div>
            {/* Tagline */}
            <span className="font-display font-black text-[9px] uppercase tracking-[0.25em] text-primary bg-primary/5 border border-primary/10 rounded-full px-3 py-1">
              Contact
            </span>
            
            <h2 className="font-display font-black text-3xl md:text-5xl uppercase tracking-tight mt-4 mb-6">
              Travaillons <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">Ensemble</span>
            </h2>

            <p className="text-on-surface-variant text-xs font-light leading-relaxed max-w-sm mb-10">
              Vous avez un projet de développement web/mobile ou des questions sur notre projet Unity ? N'hésitez pas à nous écrire.
            </p>

            {/* Obfuscated Contact Information */}
            <div className="flex flex-col gap-6">
              {/* E-mail */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-white/5 flex items-center justify-center text-primary">
                  <i className="fa-solid fa-envelope text-sm"></i>
                </div>
                <div>
                  <div className="text-[8px] font-display font-black uppercase tracking-widest text-on-surface-variant">E-mail</div>
                  <a href={`mailto:${emailText}`} className="text-xs font-semibold hover:text-primary transition-colors">
                    {emailText || 'contact [at] bkntech.fr'}
                  </a>
                </div>
              </div>

              {/* Téléphone */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-white/5 flex items-center justify-center text-primary">
                  <i className="fa-solid fa-phone text-sm"></i>
                </div>
                <div>
                  <div className="text-[8px] font-display font-black uppercase tracking-widest text-on-surface-variant">Téléphone</div>
                  <a href={`tel:${phoneText.replace(/\s/g, '')}`} className="text-xs font-semibold hover:text-primary transition-colors">
                    {phoneText || '+33 1 00 00 00 00'}
                  </a>
                </div>
              </div>

              {/* Localisation */}
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-container-low border border-white/5 flex items-center justify-center text-primary">
                  <i className="fa-solid fa-location-dot text-sm"></i>
                </div>
                <div>
                  <div className="text-[8px] font-display font-black uppercase tracking-widest text-on-surface-variant">Adresse</div>
                  <div className="text-xs font-light text-on-surface-variant leading-relaxed">
                    Bkn Tech<br />
                    47 rue Vivienne<br />
                    75002 Paris, France
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Non-Sensitive Details (SIRET/SIREN/RCS) */}
          <div className="mt-12 pt-8 border-t border-white/5 text-[9px] font-display font-black uppercase tracking-widest text-on-surface-variant/60 leading-loose max-w-sm">
            <span>Bkn Tech (SAS)</span><br />
            <span>SIRET : 104 054 150 00016</span><br />
            <span>RCS : Paris B 104 054 150</span><br />
            <span>TVA non applicable (art. 293 B du CGI)</span>
          </div>
        </div>

        {/* Form Column (Right) */}
        <div className="lg:col-span-7 glass-panel p-8 md:p-10 rounded-2xl relative overflow-hidden">
          
          {/* Honeypot Spam Trap (Hidden) */}
          <input
            type="text"
            name="bkn_website_bot_trap"
            value={formData.bkn_website_bot_trap}
            onChange={handleChange}
            style={{ display: 'none' }}
            tabIndex="-1"
            autoComplete="off"
            aria-hidden="true"
          />

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mb-6">
                  <i className="fa-solid fa-circle-check text-2xl animate-bounce"></i>
                </div>
                <h3 className="font-display font-black text-xl uppercase tracking-widest text-secondary mb-2">Message Envoyé !</h3>
                <p className="text-on-surface-variant text-xs font-light max-w-xs leading-relaxed">
                  Merci pour votre message. Nous l'avons bien reçu et reviendrons vers vous dans les plus brefs délais.
                </p>
                <Button variant="secondary" onClick={() => setStatus('idle')} className="mt-8">
                  <i className="fa-solid fa-arrow-left text-[10px]"></i>
                  Retour au formulaire
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col"
              >
                <InputField
                  label="Votre Nom"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
                
                <InputField
                  label="Adresse E-mail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />
                
                <InputField
                  label="Sujet"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  error={errors.subject}
                  required
                />
                
                <InputField
                  label="Votre Message"
                  name="message"
                  type="textarea"
                  value={formData.message}
                  onChange={handleChange}
                  error={errors.message}
                  rows={5}
                  required
                />

                {/* Submitting Feedback State */}
                {(status === 'checking' || status === 'sending') && (
                  <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10 text-primary text-xs font-display font-semibold uppercase tracking-wider">
                    <i className="fa-solid fa-spinner animate-spin text-sm"></i>
                    {statusMessage}
                  </div>
                )}

                {/* Error Feedback State */}
                {status === 'error' && (
                  <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs font-display font-semibold uppercase tracking-wider">
                    <i className="fa-solid fa-circle-exclamation text-sm"></i>
                    {statusMessage}
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full md:w-auto"
                    disabled={status === 'checking' || status === 'sending'}
                  >
                    <i className="fa-solid fa-paper-plane text-[10px]"></i>
                    Envoyer le Message
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
