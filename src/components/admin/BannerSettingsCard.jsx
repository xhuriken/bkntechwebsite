import React, { useState, useEffect, useRef } from 'react';
import Button from '../Button';

/**
 * BannerSettingsCard Admin Sub-Component
 * Renders two independent glass cards in a grid layout to manage the Vacuum Protocol banners
 * for the Portfolio page (/portfolio) and the Devlog header (/game).
 */
export default function BannerSettingsCard({ settings, onSaveSetting }) {
  const [featuredBannerInput, setFeaturedBannerInput] = useState(settings?.featuredBannerUrl || settings?.vacuumBanner1 || '');
  const [devlogBannerInput, setDevlogBannerInput] = useState(settings?.devlogBannerUrl || settings?.vacuumBanner2 || '');

  const [msg1, setMsg1] = useState({ text: '', type: '' });
  const [msg2, setMsg2] = useState({ text: '', type: '' });

  const [saving1, setSaving1] = useState(false);
  const [saving2, setSaving2] = useState(false);

  const fileRef1 = useRef(null);
  const fileRef2 = useRef(null);

  // Synchronize local input states when settings prop finishes loading asynchronously
  useEffect(() => {
    if (settings?.featuredBannerUrl || settings?.vacuumBanner1) {
      setFeaturedBannerInput(settings.featuredBannerUrl || settings.vacuumBanner1);
    }
    if (settings?.devlogBannerUrl || settings?.vacuumBanner2) {
      setDevlogBannerInput(settings.devlogBannerUrl || settings.vacuumBanner2);
    }
  }, [settings?.featuredBannerUrl, settings?.devlogBannerUrl, settings?.vacuumBanner1, settings?.vacuumBanner2]);

  // Upload handler for Card 1 (Portfolio Banner)
  const handleUpload1 = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setMsg1({ text: 'Fichier trop volumineux (max 20 Mo).', type: 'error' });
      return;
    }

    setSaving1(true);
    setMsg1({ text: 'Téléversement...', type: 'info' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setFeaturedBannerInput(data.url);
        setMsg1({ text: 'Fichier uploadé, cliquez Sauvegarder.', type: 'success' });
      } else {
        setMsg1({ text: 'Échec du téléversement.', type: 'error' });
      }
    } catch (err) {
      setMsg1({ text: 'Erreur réseau.', type: 'error' });
    } finally {
      setSaving1(false);
    }
  };

  // Upload handler for Card 2 (Devlog Header Banner)
  const handleUpload2 = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setMsg2({ text: 'Fichier trop volumineux (max 20 Mo).', type: 'error' });
      return;
    }

    setSaving2(true);
    setMsg2({ text: 'Téléversement...', type: 'info' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setDevlogBannerInput(data.url);
        setMsg2({ text: 'Fichier uploadé, cliquez Sauvegarder.', type: 'success' });
      } else {
        setMsg2({ text: 'Échec du téléversement.', type: 'error' });
      }
    } catch (err) {
      setMsg2({ text: 'Erreur réseau.', type: 'error' });
    } finally {
      setSaving2(false);
    }
  };

  // Save handler for Card 1
  const handleSave1 = async () => {
    if (!featuredBannerInput.trim()) return;
    setSaving1(true);
    setMsg1({ text: '', type: '' });

    const ok = await onSaveSetting('featuredBannerUrl', featuredBannerInput.trim());
    if (ok) {
      setMsg1({ text: 'Sauvegardé !', type: 'success' });
      setTimeout(() => setMsg1({ text: '', type: '' }), 3000);
    } else {
      setMsg1({ text: 'Échec de la sauvegarde.', type: 'error' });
    }
    setSaving1(false);
  };

  // Save handler for Card 2
  const handleSave2 = async () => {
    if (!devlogBannerInput.trim()) return;
    setSaving2(true);
    setMsg2({ text: '', type: '' });

    const ok = await onSaveSetting('devlogBannerUrl', devlogBannerInput.trim());
    if (ok) {
      setMsg2({ text: 'Sauvegardé !', type: 'success' });
      setTimeout(() => setMsg2({ text: '', type: '' }), 3000);
    } else {
      setMsg2({ text: 'Échec de la sauvegarde.', type: 'error' });
    }
    setSaving2(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Card 1: Main Portfolio Banner */}
      <div className="bg-surface-container-low/45 backdrop-blur-md border border-white/5 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-stretch gap-4 shadow-lg">
        {/* Banner Preview */}
        <div className="w-full md:w-40 h-24 rounded-xl overflow-hidden border border-white/5 bg-black/40 flex-shrink-0">
          {featuredBannerInput ? (
            <img
              src={featuredBannerInput}
              alt="Bannière Vacuum Protocol (Portfolio)"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/BknLogo.svg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
              <i className="fa-solid fa-image text-2xl" />
            </div>
          )}
        </div>

        {/* Banner Edit Controls */}
        <div className="flex-1 flex flex-col justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-[4px] h-5 rounded-full bg-gradient-to-b from-secondary to-transparent flex-shrink-0" />
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-on-surface">1. Bannière Portfolio (/portfolio)</h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={featuredBannerInput}
              onChange={(e) => setFeaturedBannerInput(e.target.value)}
              placeholder="URL de l'image ou uploader un fichier..."
              className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-sans text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
            <input
              ref={fileRef1}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload1}
            />
            <button
              type="button"
              onClick={() => fileRef1.current?.click()}
              className="w-9 h-9 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all duration-200 cursor-pointer flex-shrink-0"
              title="Uploader une image"
            >
              <i className="fa-solid fa-upload text-xs" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            {msg1.text && (
              <span className={`text-[10px] font-sans font-semibold ${msg1.type === 'success' ? 'text-secondary' : msg1.type === 'error' ? 'text-red-400' : 'text-primary'}`}>
                {msg1.text}
              </span>
            )}
            <Button
              variant="green"
              type="button"
              disabled={saving1 || !featuredBannerInput.trim()}
              className="!py-1.5 !px-4 text-[10px] ml-auto"
              onClick={handleSave1}
            >
              <i className="fa-solid fa-floppy-disk text-[9px] mr-1" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>

      {/* Card 2: Devlog Header Banner */}
      <div className="bg-surface-container-low/45 backdrop-blur-md border border-white/5 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-stretch gap-4 shadow-lg">
        {/* Banner Preview */}
        <div className="w-full md:w-40 h-24 rounded-xl overflow-hidden border border-white/5 bg-black/40 flex-shrink-0">
          {devlogBannerInput ? (
            <img
              src={devlogBannerInput}
              alt="Bannière En-tête Devlog (/game)"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/BknLogo.svg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-on-surface-variant/40">
              <i className="fa-solid fa-image text-2xl" />
            </div>
          )}
        </div>

        {/* Banner Edit Controls */}
        <div className="flex-1 flex flex-col justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <div className="w-[4px] h-5 rounded-full bg-gradient-to-b from-primary to-transparent flex-shrink-0" />
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-on-surface">2. Bannière Devlog Jeu (/game)</h3>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={devlogBannerInput}
              onChange={(e) => setDevlogBannerInput(e.target.value)}
              placeholder="URL de l'image ou uploader un fichier..."
              className="flex-1 bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs font-sans text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors"
            />
            <input
              ref={fileRef2}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload2}
            />
            <button
              type="button"
              onClick={() => fileRef2.current?.click()}
              className="w-9 h-9 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all duration-200 cursor-pointer flex-shrink-0"
              title="Uploader une image"
            >
              <i className="fa-solid fa-upload text-xs" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            {msg2.text && (
              <span className={`text-[10px] font-sans font-semibold ${msg2.type === 'success' ? 'text-secondary' : msg2.type === 'error' ? 'text-red-400' : 'text-primary'}`}>
                {msg2.text}
              </span>
            )}
            <Button
              variant="green"
              type="button"
              disabled={saving2 || !devlogBannerInput.trim()}
              className="!py-1.5 !px-4 text-[10px] ml-auto"
              onClick={handleSave2}
            >
              <i className="fa-solid fa-floppy-disk text-[9px] mr-1" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
