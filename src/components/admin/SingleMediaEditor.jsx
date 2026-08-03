import React, { useState, useEffect } from 'react';
import Button from '../Button';

function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function SingleMediaEditor({
  title,
  description,
  currentUrl = '',
  adminPassword,
  onSave,
  onClose
}) {
  const [mediaType, setMediaType] = useState('image'); // 'image' | 'video'
  const [sourceType, setSourceType] = useState('url'); // 'url' | 'file'
  const [urlInput, setUrlInput] = useState(currentUrl || '');
  const [previewUrl, setPreviewUrl] = useState(currentUrl || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    const active = currentUrl || '';
    setUrlInput(active);
    setPreviewUrl(active);
    if (active) {
      if (getYouTubeId(active) || active.endsWith('.mp4') || active.includes('video')) {
        setMediaType('video');
      } else {
        setMediaType('image');
      }
    }
  }, [currentUrl]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setMsg({ text: 'Le fichier est trop volumineux (max 25 Mo).', type: 'error' });
      return;
    }

    // Instant local preview
    const localBlobUrl = URL.createObjectURL(file);
    setPreviewUrl(localBlobUrl);
    setUploading(true);
    setMsg({ text: `Téléversement du fichier (${file.name})...`, type: 'info' });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      const passToUse = adminPassword || localStorage.getItem('bkn_admin_pass') || 'bkntech';

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': passToUse
          },
          body: JSON.stringify({
            fileData: dataUrl,
            fileName: file.name,
            fileType: file.type
          })
        });

        const data = await res.json();
        if (res.ok && data && data.url) {
          setUrlInput(data.url);
          setPreviewUrl(data.url);
          setMsg({ text: 'Fichier téléversé avec succès ! Cliquez sur "Enregistrer" pour valider.', type: 'success' });
        } else {
          setMsg({ text: data.error || 'Échec du téléversement.', type: 'error' });
        }
      } catch (err) {
        console.error('Upload failed:', err);
        setMsg({ text: 'Erreur réseau lors de l\'envoi du fichier.', type: 'error' });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const finalUrl = urlInput || previewUrl;

    if (!finalUrl || !finalUrl.trim()) {
      setMsg({ text: 'Veuillez saisir ou télécharger un lien pour la bannière.', type: 'error' });
      return;
    }

    setSaving(true);
    setMsg({ text: '', type: '' });

    try {
      const success = await onSave(finalUrl.trim());
      if (success) {
        setMsg({ text: 'Bannière enregistrée avec succès !', type: 'success' });
        setTimeout(() => {
          if (onClose) onClose();
        }, 600);
      } else {
        setMsg({ text: 'Échec de la sauvegarde de la bannière. Vérifiez votre mot de passe admin.', type: 'error' });
      }
    } catch (err) {
      console.error('Save failed:', err);
      setMsg({ text: 'Erreur lors de l\'enregistrement.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const activeDisplayUrl = previewUrl || urlInput || '';
  const ytId = getYouTubeId(activeDisplayUrl);

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header Info */}
      <div>
        <h2 className="text-base font-sans font-extrabold uppercase tracking-wide text-on-surface mb-1">
          {title}
        </h2>
        <p className="text-xs font-sans text-on-surface-variant/70 leading-relaxed">
          {description}
        </p>
      </div>

      {msg.text && (
        <div className={`p-3 rounded-xl text-xs font-mono border ${
          msg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
          msg.type === 'info' ? 'bg-primary/10 border-primary/30 text-primary' :
          'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Double Sliding Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/30 p-3 rounded-2xl border border-white/5">
        {/* Toggle 1: Media Type (Image vs Video) */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-on-surface-variant mb-1.5">Type de Média</label>
          <div className="flex items-center p-1 bg-surface-container-low/60 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setMediaType('image')}
              className={`flex-1 py-1.5 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer ${
                mediaType === 'image' ? 'bg-primary text-black shadow-md' : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <i className="fa-solid fa-image mr-1.5" /> Image
            </button>
            <button
              type="button"
              onClick={() => setMediaType('video')}
              className={`flex-1 py-1.5 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer ${
                mediaType === 'video' ? 'bg-primary text-black shadow-md' : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <i className="fa-solid fa-film mr-1.5" /> Vidéo MP4 / YT
            </button>
          </div>
        </div>

        {/* Toggle 2: Source Type (URL Web vs Local File Upload) */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-on-surface-variant mb-1.5">Provenance du Fichier</label>
          <div className="flex items-center p-1 bg-surface-container-low/60 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => setSourceType('url')}
              className={`flex-1 py-1.5 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer ${
                sourceType === 'url' ? 'bg-secondary text-black shadow-md' : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <i className="fa-solid fa-link mr-1.5" /> Lien URL Web
            </button>
            <button
              type="button"
              onClick={() => setSourceType('file')}
              className={`flex-1 py-1.5 text-xs font-sans font-bold rounded-lg transition-all cursor-pointer ${
                sourceType === 'file' ? 'bg-secondary text-black shadow-md' : 'text-on-surface-variant hover:text-white'
              }`}
            >
              <i className="fa-solid fa-upload mr-1.5" /> Fichier Local
            </button>
          </div>
        </div>
      </div>

      {/* Input or File Selector */}
      {sourceType === 'file' ? (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-sans font-semibold text-on-surface-variant">
            Sélectionner un fichier depuis votre ordinateur ({mediaType === 'video' ? 'Vidéo MP4, WebM' : 'Image PNG, JPG, GIF, WebP'})
          </label>
          <input
            type="file"
            id="banner-file-input"
            accept={mediaType === 'video' ? 'video/mp4,video/webm' : 'image/*'}
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="banner-file-input"
            className="w-full bg-white/5 hover:bg-white/10 border border-dashed border-secondary/50 hover:border-secondary rounded-xl px-5 py-4 text-xs font-sans font-bold text-secondary flex items-center justify-center gap-2 cursor-pointer transition-all shadow-inner"
          >
            <i className={`fa-solid ${uploading ? 'fa-circle-notch animate-spin' : 'fa-cloud-arrow-up'} text-base`} />
            <span className="truncate">
              {uploading
                ? 'Téléversement en cours...'
                : activeDisplayUrl
                  ? `Fichier chargé : ${activeDisplayUrl.split('/')[activeDisplayUrl.split('/').length - 1]}`
                  : `Parcourir et charger ${mediaType === 'video' ? 'une Vidéo' : 'une Image'}`}
            </span>
          </label>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-sans font-semibold text-on-surface-variant">
            Lien Web direct ({mediaType === 'video' ? 'URL YouTube ou fichier MP4 distant' : 'URL de l\'image d\'en-tête'})
          </label>
          <input
            type="text"
            value={urlInput || ''}
            onChange={(e) => {
              setUrlInput(e.target.value);
              setPreviewUrl(e.target.value);
            }}
            placeholder={
              mediaType === 'video'
                ? 'https://youtube.com/watch?v=... ou /uploads/video.mp4'
                : 'https://images.unsplash.com/... ou /uploads/image.png'
            }
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-sans text-on-surface focus:outline-none focus:border-primary/60 transition-colors shadow-inner"
          />
        </div>
      )}

      {/* High Quality Live Preview (Always visible if activeDisplayUrl is set) */}
      {activeDisplayUrl && (
        <div className="space-y-2 pt-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
            <i className="fa-solid fa-eye" />
            <span>Aperçu HD de la Bannière</span>
          </span>
          <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video max-h-[320px] relative flex items-center justify-center shadow-2xl">
            {mediaType === 'video' ? (
              ytId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  className="w-full h-full border-none"
                  title="Banner YouTube Preview"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeDisplayUrl}
                  controls
                  playsInline
                  muted
                  className="w-full h-full object-contain bg-black"
                />
              )
            ) : (
              <img
                src={activeDisplayUrl}
                alt="Banner Live Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/notfound.gif';
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <Button variant="black" onClick={onClose} type="button">
          Annuler
        </Button>
        <Button variant="primary" type="submit" disabled={saving || uploading}>
          {saving ? 'Enregistrement...' : 'Enregistrer la Bannière'}
        </Button>
      </div>
    </form>
  );
}
