import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../context/AdminContext';
import SingleMediaEditor from './SingleMediaEditor';

export default function AdminBannerEditModal() {
  const { t } = useTranslation();
  const { bannerModalType, closeBannerModal, adminPassword, triggerRefresh } = useAdmin();
  const [currentUrl, setCurrentUrl] = useState('');
  const [loading, setLoading] = useState(true);

  const settingKey = bannerModalType === 'featured' ? 'featuredBannerUrl' : 'devlogBannerUrl';

  // Load current banner URL from /api/settings
  useEffect(() => {
    if (!bannerModalType) return;
    setLoading(true);
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data[settingKey]) {
          setCurrentUrl(data[settingKey]);
        } else {
          setCurrentUrl('');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load setting:', err);
        setLoading(false);
      });
  }, [bannerModalType, settingKey]);

  // Escape Key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && bannerModalType) {
        closeBannerModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bannerModalType, closeBannerModal]);

  if (!bannerModalType) return null;

  const handleSave = async (newUrl) => {
    try {
      const passToUse = adminPassword || localStorage.getItem('bkn_admin_pass') || 'bkntech';
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': passToUse
        },
        body: JSON.stringify({
          key: settingKey,
          value: newUrl
        })
      });

      if (res.ok) {
        triggerRefresh();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Save setting failed:', err);
      return false;
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto pointer-events-auto"
        onClick={closeBannerModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl bg-surface-container-low border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-black/60 border-b border-white/10 px-6 py-4 flex items-center justify-between font-mono text-xs text-primary">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-image text-secondary"></i>
              <span className="font-bold uppercase tracking-wider">
                {bannerModalType === 'featured' ? 'Modifier la Bannière Portfolio (Bannière 1)' : 'Modifier la Bannière Devlog (Bannière 2)'}
              </span>
            </div>
            <button
              onClick={closeBannerModal}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white transition-all cursor-pointer"
              title="Fermer (Échap)"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
          </div>


          <div className="p-6 md:p-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant text-xs font-mono">
                <i className="fa-solid fa-circle-notch animate-spin text-primary text-xl mb-3" />
                <span>Chargement de la configuration...</span>
              </div>
            ) : (
              <SingleMediaEditor
                title={bannerModalType === 'featured' ? 'Bannière 1 (Portfolio & Accueil)' : 'Bannière 2 (Devlog Vacuum Protocol)'}
                description={bannerModalType === 'featured'
                  ? 'Cette bannière est affichée sur la carte principale du projet Vacuum Protocol dans le Portfolio et la page d\'Accueil.'
                  : 'Cette bannière est affichée en haut de la timeline Devlog Vacuum Protocol.'
                }
                currentUrl={currentUrl}
                adminPassword={adminPassword}
                onSave={handleSave}
                onClose={closeBannerModal}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
