import React, { useState } from 'react';

/**
 * BannerSettingsCard Admin Sub-Component
 * Provides management interface for Vacuum Protocol header banners.
 */
export default function BannerSettingsCard({ settings, onSaveSetting }) {
  const [banner1, setBanner1] = useState(settings?.vacuumBanner1 || '');
  const [banner2, setBanner2] = useState(settings?.vacuumBanner2 || '');
  const [statusMsg, setStatusMsg] = useState('');
  const [uploading1, setUploading1] = useState(false);
  const [uploading2, setUploading2] = useState(false);

  const handleFileUpload = async (e, bannerKey) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (bannerKey === 1) setUploading1(true);
    else setUploading2(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        if (bannerKey === 1) setBanner1(data.url);
        else setBanner2(data.url);
      }
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      if (bannerKey === 1) setUploading1(false);
      else setUploading2(false);
    }
  };

  const handleSave = async () => {
    setStatusMsg('Enregistrement...');
    const ok1 = await onSaveSetting('vacuumBanner1', banner1);
    const ok2 = await onSaveSetting('vacuumBanner2', banner2);

    if (ok1 && ok2) {
      setStatusMsg('Bannières sauvegardées !');
      setTimeout(() => setStatusMsg(''), 3000);
    } else {
      setStatusMsg('Erreur de sauvegarde.');
    }
  };

  return (
    <div className="bg-surface-container-low/40 border border-white/10 rounded-2xl p-5 md:p-6 mb-8 flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
            <i className="fa-solid fa-image text-secondary" />
            <span>Gestion des Bannières Vacuum Protocol</span>
          </h3>
          <p className="text-xs font-sans text-on-surface-variant/70 mt-1">
            Modifiez la grande bannière et la bannière panoramique d'en-tête.
          </p>
        </div>

        {statusMsg && (
          <span className="text-xs font-sans font-semibold text-secondary bg-secondary/10 px-3 py-1 rounded-lg border border-secondary/20 animate-pulse">
            {statusMsg}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Banner 1 */}
        <div className="flex flex-col gap-3 bg-black/30 border border-white/5 rounded-xl p-4">
          <label className="text-xs font-sans font-semibold text-on-surface">
            Bannière Principale (Carte Portfolio & Devlog)
          </label>
          <input
            type="text"
            value={banner1}
            onChange={(e) => setBanner1(e.target.value)}
            placeholder="URL ou téléversez une image..."
            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs font-sans text-on-surface focus:border-secondary focus:outline-none"
          />
          <div className="flex items-center gap-3">
            <label className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-sans text-on-surface hover:bg-white/10 transition-colors cursor-pointer select-none">
              {uploading1 ? 'Téléversement...' : 'Téléverser un fichier'}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 1)}
                className="hidden"
                disabled={uploading1}
              />
            </label>
          </div>
          {banner1 && (
            <div className="w-full h-24 rounded-lg overflow-hidden border border-white/10 mt-1">
              <img src={banner1} alt="Preview Banner 1" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Banner 2 */}
        <div className="flex flex-col gap-3 bg-black/30 border border-white/5 rounded-xl p-4">
          <label className="text-xs font-sans font-semibold text-on-surface">
            Bannière En-Tête Devlog (Panoramique)
          </label>
          <input
            type="text"
            value={banner2}
            onChange={(e) => setBanner2(e.target.value)}
            placeholder="URL ou téléversez une image..."
            className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-xs font-sans text-on-surface focus:border-secondary focus:outline-none"
          />
          <div className="flex items-center gap-3">
            <label className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-sans text-on-surface hover:bg-white/10 transition-colors cursor-pointer select-none">
              {uploading2 ? 'Téléversement...' : 'Téléverser un fichier'}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 2)}
                className="hidden"
                disabled={uploading2}
              />
            </label>
          </div>
          {banner2 && (
            <div className="w-full h-24 rounded-lg overflow-hidden border border-white/10 mt-1">
              <img src={banner2} alt="Preview Banner 2" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-secondary text-surface text-xs font-sans font-bold hover:bg-secondary-light transition-colors cursor-pointer shadow-md"
        >
          Sauvegarder les Bannières
        </button>
      </div>
    </div>
  );
}
