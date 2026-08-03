import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../context/AdminContext';
import InputField from '../InputField';
import Button from '../Button';

export default function AdminLoginModal() {
  const { t } = useTranslation();
  const { isLoginModalOpen, setIsLoginModalOpen, login } = useAdmin();
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Escape Key listener
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isLoginModalOpen) {
        setIsLoginModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoginModalOpen, setIsLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedPass = password.trim();
    if (!trimmedPass) return;
    setLoading(true);
    setErrorMsg('');

    const success = await login(trimmedPass);
    setLoading(false);


    if (success) {
      setPassword('');
      setIsLoginModalOpen(false);
    } else {
      setErrorMsg(t('contact.status.error_send') || 'Mot de passe incorrect.');
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md pointer-events-auto"
        onClick={() => setIsLoginModalOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-surface-container-low border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
        >
          {/* Header */}
          <div className="bg-black/60 border-b border-white/10 px-6 py-4 flex items-center justify-between font-mono text-xs text-primary">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-lock text-secondary"></i>
              <span className="font-bold uppercase tracking-wider">{t('portfolio.admin.login_title') || 'Accès Administration'}</span>
            </div>
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white transition-all cursor-pointer"
              title="Fermer (Échap)"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
          </div>


          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Entrez le mot de passe administrateur, si vous l'êtes ahah ? non ? sortez d'ici... s'il vous plaît...
            </p>

            <InputField
              label={t('portfolio.admin.password') || 'Mot de passe Admin'}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
            />

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="black"
                onClick={() => setIsLoginModalOpen(false)}
                type="button"
              >
                {t('portfolio.admin.cancel_btn') || 'Annuler'}
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Vérification...' : (t('portfolio.admin.login_btn') || 'Se connecter')}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
