import React, { useState, useEffect, useRef } from 'react';
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
    if (nonce > 50000) return { nonce, hash };
  }
}

/**
 * A dynamic typing effect terminal list of technologies inside the contact panel
 */
function TerminalList() {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [typedCommand, setTypedCommand] = useState("");
  const [showTagsCount, setShowTagsCount] = useState(0);
  const [coloredTagsCount, setColoredTagsCount] = useState(0);

  const stack = ['laravel', 'react', 'javascript', 'flutter', 'docker', 'tailwind', 'unity'];
  const commandText = "ls keywords";

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !stack || stack.length === 0) return;

    let timeoutId;

    const typeCommand = (charIndex) => {
      if (charIndex <= commandText.length) {
        setTypedCommand(commandText.slice(0, charIndex));
        timeoutId = setTimeout(() => typeCommand(charIndex + 1), 70);
      } else {
        timeoutId = setTimeout(() => startOutputtingTags(1), 300);
      }
    };

    const startOutputtingTags = (count) => {
      if (count <= stack.length) {
        setShowTagsCount(count);
        timeoutId = setTimeout(() => startOutputtingTags(count + 1), 160);
      } else {
        timeoutId = setTimeout(() => colorTags(1), 250);
      }
    };

    const colorTags = (count) => {
      if (count <= stack.length) {
        setColoredTagsCount(count);
        timeoutId = setTimeout(() => colorTags(count + 1), 120);
      }
    };

    typeCommand(0);

    return () => clearTimeout(timeoutId);
  }, [isVisible]);

  if (!stack || stack.length === 0) return null;

  return (
    <div ref={ref} className="flex flex-col gap-2 flex-grow justify-between min-h-[110px] w-full font-mono text-[9px] select-none text-left text-green-400">
      <div className="flex flex-col gap-1.5">
        {/* Terminal Command Header */}
        <div className="text-[8px] font-mono text-on-surface-variant/40 border-b border-white/5 pb-1 mb-1.5 flex items-center gap-1.5 h-4">
          <span className="text-white/20">$</span>
          <span>{typedCommand}</span>
          {typedCommand.length < commandText.length && isVisible && (
            <span className="w-1 h-2.5 bg-primary/70 animate-pulse" />
          )}
        </div>

        {/* Tags outputs */}
        <div className="flex flex-col gap-1">
          {stack.slice(0, showTagsCount).map((item, idx) => {
            const isColored = idx < coloredTagsCount;
            return (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="text-white/20">&gt;</span>
                <span className={isColored ? "text-green-400 font-bold transition-all duration-300" : "text-white/50"}>
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom prompt indicator */}
      <div className="flex items-center gap-1 text-white/30 text-[8px] mt-2">
        <span>$</span>
        {coloredTagsCount === stack.length && (
          <span className="w-1.5 h-2.5 bg-green-400 animate-pulse" />
        )}
      </div>
    </div>
  );
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

  const [activeTemplate, setActiveTemplate] = useState('none');
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle, checking, sending, success, error
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Obfuscation assembly on mount
    const emailParts = ['contact', '@', 'bkntech', '.', 'fr'];
    const phoneParts = ['+', '33', ' ', '6', ' ', '61', ' ', '20', ' ', '14', ' ', '18'];
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

  const selectTemplate = (key) => {
    setActiveTemplate(key);
    if (key === 'none') {
      setFormData(prev => ({
        ...prev,
        subject: '',
        message: ''
      }));
    } else {
      const subject = t(`contact.templates.${key}.subject`);
      const message = t(`contact.templates.${key}.message`);
      setFormData(prev => ({
        ...prev,
        subject,
        message
      }));
    }
    setErrors(prev => ({ ...prev, subject: '', message: '' }));
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = t('contact.validation.name');
    if (!formData.email.trim()) {
      tempErrors.email = t('contact.validation.email_req');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        tempErrors.email = t('contact.validation.email_invalid');
      }
    }
    if (!formData.subject.trim()) tempErrors.subject = t('contact.validation.subject');
    if (!formData.message.trim()) tempErrors.message = t('contact.validation.message');

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('checking');
    setStatusMessage(t('contact.status.solving'));

    try {
      // 1. Generate local PoW challenge
      const salt = formData.email + Date.now();
      const powResult = await solveChallenge(salt);

      setStatusMessage(t('contact.status.sending'));

      // 2. Send request to endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          powNonce: powResult.nonce,
          powHash: powResult.hash,
          powSalt: salt
        })
      });

      if (response.ok) {
        setStatus('success');
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: '',
          bkn_website_bot_trap: ''
        });
        setActiveTemplate('none');
      } else {
        const errorData = await response.json();
        setStatus('error');
        setStatusMessage(errorData.error || t('contact.status.error_send'));
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setStatusMessage(t('contact.status.error_conn'));
    }
  };

  return (
    <section id="contact" className="w-full pt-6 pb-20 px-6 md:px-12 max-w-7xl mx-auto z-10 relative">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* Info Column (Left) */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full">
          <div>
            {/* Custom Decorative Line Tag */}
            <div className="flex items-center gap-3 mb-2">
              <div className="h-[2px] w-8 bg-gradient-to-r from-primary to-transparent rounded-full" />
              <span className="font-sans font-bold text-[10px] uppercase tracking-wider text-primary/85">
                Contact
              </span>
            </div>

            <h2 className="font-sans font-extrabold text-3xl md:text-5xl uppercase tracking-tight mt-4 mb-6">
              {t('contact.title_part1')} <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">{t('contact.title_part2')}</span>
            </h2>

            <p className="text-on-surface text-sm font-normal leading-relaxed max-w-sm mb-6">
              {t('contact.description')}
            </p>

            {/* Obfuscated Contact Information Pins with Hover Actions */}
            <div className="flex flex-col gap-3 items-start -mx-3 mt-6 mb-8">
              {/* E-mail Pin */}
              <motion.a
                href={`mailto:${emailText}`}
                whileHover={{ x: 6 }}
                className="flex items-center gap-4 p-3 rounded-2xl bg-transparent border border-transparent hover:bg-white/[0.02] hover:border-white/5 transition-all duration-300 group cursor-pointer w-full"
              >
                <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center text-on-surface-variant/70 group-hover:scale-105 group-hover:bg-black/90 group-hover:border-white/20 group-hover:text-white shadow-[0_0_12px_rgba(0,0,0,0.4)] transition-all duration-300">
                  <i className="fa-solid fa-envelope text-sm"></i>
                </div>
                <div>
                  <div className="text-[10px] font-display font-black uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">{t('contact.email_pin')}</div>
                  <span className="text-sm font-semibold text-on-surface group-hover:text-white transition-colors">
                    {emailText || 'contact [at] bkntech.fr'}
                  </span>
                </div>
              </motion.a>

              {/* Téléphone Pin */}
              <motion.a
                href={`tel:${phoneText.replace(/\s/g, '')}`}
                whileHover={{ x: 6 }}
                className="flex items-center gap-4 p-3 rounded-2xl bg-transparent border border-transparent hover:bg-white/[0.02] hover:border-white/5 transition-all duration-300 group cursor-pointer w-full"
              >
                <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center text-on-surface-variant/70 group-hover:scale-105 group-hover:bg-black/90 group-hover:border-white/20 group-hover:text-white shadow-[0_0_12px_rgba(0,0,0,0.4)] transition-all duration-300">
                  <i className="fa-solid fa-phone text-sm"></i>
                </div>
                <div>
                  <div className="text-[10px] font-display font-black uppercase tracking-widest text-on-surface-variant group-hover:text-secondary transition-colors">{t('contact.phone_pin')}</div>
                  <span className="text-sm font-semibold text-on-surface group-hover:text-white transition-colors">
                    {phoneText || '+33 6 61 20 14 18'}
                  </span>
                </div>
              </motion.a>

              {/* Localisation Pin */}
              <motion.a
                href="https://maps.google.com/?q=BKN+Tech+47+rue+Vivienne+75002+Paris"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ x: 6 }}
                className="flex items-start gap-4 p-3 rounded-2xl bg-transparent border border-transparent hover:bg-white/[0.02] hover:border-white/5 transition-all duration-300 group cursor-pointer w-full"
              >
                <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/5 flex items-center justify-center text-on-surface-variant/70 group-hover:scale-105 group-hover:bg-black/90 group-hover:border-white/20 group-hover:text-white shadow-[0_0_12px_rgba(0,0,0,0.4)] mt-1 transition-all duration-300">
                  <i className="fa-solid fa-location-dot text-sm"></i>
                </div>
                <div>
                  <div className="text-[10px] font-display font-black uppercase tracking-widest text-on-surface-variant group-hover:text-tertiary transition-colors">{t('contact.address_pin')}</div>
                  <div className="text-sm font-light text-on-surface-variant leading-relaxed group-hover:text-white transition-colors">
                    Bkn Tech<br />
                    47 rue Vivienne<br />
                    75002 Paris, France
                  </div>
                </div>
              </motion.a>
            </div>

            {/* Interactive Terminal List Component */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 shadow-inner">
              <TerminalList />
            </div>
          </div>

          {/* Minimal Aesthetic Separator */}
          <div className="mt-8 border-t border-white/10" />
        </div>

        {/* Form Column (Right) */}
        <div className="lg:col-span-7 bg-surface-container-low/45 backdrop-blur-md border border-white/5 pt-8 pb-5 px-5 md:px-6 md:pt-8 md:pb-6 rounded-2xl relative overflow-hidden flex flex-col">
          {/* Noise Texture Background */}
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none z-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundBlendMode: 'soft-light'
            }}
          />

          {/* Subtle Radial Grid backdrop pattern */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.15) 1px, transparent 0)',
              backgroundSize: '16px 16px'
            }}
          />

          <div className="relative z-10 flex flex-col h-full w-full">
            {/* Centered SSOT Template Tab Navigation matching Admin category tabs */}
            <div className="flex justify-center border-b border-white/5 pb-3 mb-3.5 w-full">
              <div className="flex items-center gap-6 overflow-x-auto scrollbar-none justify-center">
                {['none', 'web', 'gaming', 'quick'].map((key) => {
                  const isActive = activeTemplate === key;
                  const label = t(`contact.templates.${key}.label`);

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => selectTemplate(key)}
                      className={`text-xs font-sans uppercase tracking-wider pb-2 transition-all duration-200 relative cursor-pointer whitespace-nowrap focus:outline-none ${isActive
                        ? 'text-secondary font-extrabold'
                        : 'text-on-surface-variant/60 font-semibold hover:text-on-surface'
                        }`}
                    >
                      <span>{label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="contactTemplateActiveLine"
                          className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.6)]"
                          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

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
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div className="relative flex items-center justify-center w-20 h-20 mb-6">
                    {/* Subtle primary brand glowing halo */}
                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-md animate-pulse" />

                    <svg className="w-10 h-10 text-primary relative z-10" viewBox="0 0 52 52" fill="none">
                      <motion.circle
                        cx="26"
                        cy="26"
                        r="24"
                        stroke="currentColor"
                        strokeWidth="4"
                        initial={{ pathLength: 0, opacity: 0.1 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      <motion.path
                        d="M14 27l8 8 16-16"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
                      />
                    </svg>
                  </div>
                  <h3 className="font-display font-black text-2xl uppercase tracking-widest text-primary mb-3">{t('contact.success_title')}</h3>
                  <p className="text-on-surface-variant text-sm font-light max-w-sm leading-relaxed">
                    {t('contact.success_desc')}
                  </p>
                  <Button variant="secondary" onClick={() => setStatus('idle')} className="mt-8">
                    <i className="fa-solid fa-arrow-left text-[10px]"></i>
                    {t('contact.back_btn')}
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
                  {/* Flat background inner container wrapping all fields (no noise) */}
                  <div className="bg-surface-container-lowest border border-white/5 rounded-2xl p-5 md:p-6 mb-6 flex flex-col gap-1 relative z-10">
                    <InputField
                      label={t('contact.fields.name')}
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={errors.name}
                      required
                    />

                    <InputField
                      label={t('contact.fields.email')}
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={errors.email}
                      required
                    />

                    <InputField
                      label={t('contact.fields.subject')}
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      error={errors.subject}
                      required
                    />

                    <InputField
                      label={t('contact.fields.message')}
                      name="message"
                      type="textarea"
                      value={formData.message}
                      onChange={handleChange}
                      error={errors.message}
                      rows={5}
                      required
                    />
                  </div>

                  {/* Submitting Feedback State */}
                  {(status === 'checking' || status === 'sending') && (
                    <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10 text-primary text-sm font-display font-semibold uppercase tracking-wider">
                      <i className="fa-solid fa-spinner animate-spin text-sm"></i>
                      {statusMessage}
                    </div>
                  )}

                  {/* Error Feedback State */}
                  {status === 'error' && (
                    <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-sm font-display font-semibold uppercase tracking-wider">
                      <i className="fa-solid fa-circle-exclamation text-sm"></i>
                      {statusMessage}
                    </div>
                  )}

                  <div className="flex justify-center mt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full md:w-auto"
                      disabled={status === 'checking' || status === 'sending'}
                    >
                      <i className="fa-solid fa-paper-plane text-[10px]"></i>
                      {t('contact.send_btn')}
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
