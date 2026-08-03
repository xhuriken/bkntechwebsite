import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../context/AdminContext';
import InputField from '../InputField';
import Button from '../Button';
import MediaSlotEditor from './MediaSlotEditor';
import PatchNoteEditor from './PatchNoteEditor';

export default function AdminDevlogEditModal() {
  const { t, i18n } = useTranslation();
  const {
    isPostModalOpen,
    editingPost,
    defaultCategory,
    closePostModal,
    adminPassword,
    triggerRefresh
  } = useAdmin();

  // Modal active ONLY for gaming category
  const activeCategory = editingPost ? editingPost.category : defaultCategory;
  const isGamingCategory = activeCategory === 'gaming';


  const [formTab, setFormTab] = useState('general'); // 'general' | 'changelogs' | 'media'
  const [textLang, setTextLang] = useState(i18n.language?.startsWith('en') ? 'en' : 'fr');
  const [postToDiscord, setPostToDiscord] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    category: 'gaming',
    type: 'Devlog Vacuum Protocol',
    importance: 'normal',
    date: new Date().toISOString().split('T')[0],
    slots: [{ id: 'slot-1', type: 'image', sourceType: 'url', url: '' }],
    tagsText: 'Vacuum Protocol, Devlog',
    titleFr: '',
    titleEn: '',
    descFr: '',
    descEn: '',
    contentFr: '',
    contentEn: '',
    changelogs: [],
    commentsCount: '0'
  });

  useEffect(() => {
    if (!isPostModalOpen) return;

    if (editingPost) {
      setFormData({
        category: 'gaming',
        type: editingPost.type || 'Devlog Vacuum Protocol',
        importance: editingPost.importance || 'normal',
        date: editingPost.date || new Date().toISOString().split('T')[0],
        slots: editingPost.slots || [
          { id: 'slot-1', type: editingPost.mediaType || 'image', sourceType: 'url', url: editingPost.mediaUrl || '' }
        ],
        tagsText: editingPost.tags ? editingPost.tags.join(', ') : 'Vacuum Protocol, Devlog',
        titleFr: editingPost.title?.fr || '',
        titleEn: editingPost.title?.en || '',
        descFr: editingPost.description?.fr || '',
        descEn: editingPost.description?.en || '',
        contentFr: editingPost.content?.fr || '',
        contentEn: editingPost.content?.en || '',
        changelogs: editingPost.changelogs || [],
        commentsCount: String(editingPost.commentsCount || '0')
      });
    } else {
      setFormData({
        category: 'gaming',
        type: 'Devlog Vacuum Protocol',
        importance: 'normal',
        date: new Date().toISOString().split('T')[0],
        slots: [{ id: 'slot-1', type: 'image', sourceType: 'url', url: '' }],
        tagsText: 'Vacuum Protocol, Devlog',
        titleFr: '',
        titleEn: '',
        descFr: '',
        descEn: '',
        contentFr: '',
        contentEn: '',
        changelogs: [],
        commentsCount: '0'
      });
    }
    setFormTab('general');
    setStatusMsg({ text: '', type: '' });
  }, [isPostModalOpen, editingPost, defaultCategory]);

  // Escape Key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPostModalOpen && isGamingCategory) {
        closePostModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPostModalOpen, isGamingCategory, closePostModal]);

  if (!isPostModalOpen || !isGamingCategory) return null;

  // Media Slot Helper Functions
  const handleAddSlot = () => {
    setFormData(prev => ({
      ...prev,
      slots: [
        ...prev.slots,
        { id: `slot-${Date.now()}`, type: 'image', sourceType: 'url', url: '' }
      ]
    }));
  };

  const handleUpdateSlot = (index, updatedSlot) => {
    setFormData(prev => {
      const newSlots = [...prev.slots];
      newSlots[index] = updatedSlot;
      return { ...prev, slots: newSlots };
    });
  };

  const handleRemoveSlot = (index) => {
    if (formData.slots.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== index)
    }));
  };

  const handleMoveSlotUp = (index) => {
    if (index <= 0) return;
    setFormData(prev => {
      const newSlots = [...prev.slots];
      const temp = newSlots[index - 1];
      newSlots[index - 1] = newSlots[index];
      newSlots[index] = temp;
      return { ...prev, slots: newSlots };
    });
  };

  const handleMoveSlotDown = (index) => {
    setFormData(prev => {
      const newSlots = [...prev.slots];
      if (index >= newSlots.length - 1) return prev;
      const temp = newSlots[index + 1];
      newSlots[index + 1] = newSlots[index];
      newSlots[index] = temp;
      return { ...prev, slots: newSlots };
    });
  };

  const handleFileUpload = async (index, file) => {
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result;
        const passToUse = adminPassword || localStorage.getItem('bkn_admin_pass') || 'bkntech';

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': passToUse
          },
          body: JSON.stringify({
            fileData: base64Data,
            fileName: file.name,
            fileType: file.type
          })
        });

        if (res.ok) {
          const data = await res.json();
          handleUpdateSlot(index, {
            ...formData.slots[index],
            sourceType: 'url',
            url: data.url,
            type: file.type.startsWith('video/') ? 'video' : 'image'
          });
        } else {
          setStatusMsg({ text: 'Erreur lors de l’upload de fichier.', type: 'error' });
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File Upload Error:', err);
      setStatusMsg({ text: 'Échec de l’upload du fichier.', type: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: '', type: '' });

    if (!formData.titleFr) {
      setStatusMsg({ text: 'Le titre du devlog est requis.', type: 'error' });
      setSaving(false);
      setFormTab('general');
      return;
    }

    const firstSlot = formData.slots[0] || {};
    const mediaType = firstSlot.type || 'image';
    const mediaUrl = firstSlot.url || '';

    const tagsArray = formData.tagsText
      ? formData.tagsText.split(',').map(t => t.trim()).filter(Boolean)
      : ['Vacuum Protocol', 'Devlog'];

    const postPayload = {
      id: editingPost ? editingPost.id : undefined,
      category: 'gaming',
      type: formData.type || 'Devlog Vacuum Protocol',
      importance: formData.importance,
      date: formData.date,
      mediaType,
      mediaUrl,
      slots: formData.slots,
      tags: tagsArray,
      title: {
        fr: formData.titleFr,
        en: formData.titleEn || formData.titleFr
      },
      description: {
        fr: formData.descFr,
        en: formData.descEn || formData.descFr
      },
      content: {
        fr: formData.contentFr,
        en: formData.contentEn || formData.contentFr
      },
      changelogs: formData.changelogs,
      commentsCount: parseInt(formData.commentsCount, 10) || 0,
      postToDiscord
    };

    try {
      const passToUse = adminPassword || localStorage.getItem('bkn_admin_pass') || 'bkntech';
      const res = await fetch('/api/posts', {
        method: editingPost ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': passToUse
        },
        body: JSON.stringify(postPayload)
      });

      if (res.ok) {
        setStatusMsg({ text: editingPost ? 'Devlog mis à jour !' : 'Devlog publié avec succès !', type: 'success' });
        setTimeout(() => {
          triggerRefresh();
          closePostModal();
        }, 600);
      } else {
        const data = await res.json();
        setStatusMsg({ text: data.error || 'Erreur lors de l’enregistrement.', type: 'error' });
      }
    } catch (err) {
      console.error('Submit Devlog Error:', err);
      setStatusMsg({ text: 'Erreur de connexion au serveur.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto pointer-events-auto"
        onClick={closePostModal}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl bg-surface-container-low border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative my-8"
        >
          {/* Header */}
          <div className="bg-black/60 border-b border-white/10 px-6 py-4 flex items-center justify-between font-mono text-xs text-primary">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-gamepad text-secondary"></i>
              <span className="font-bold uppercase tracking-wider">
                {editingPost ? 'Éditeur de Devlog Vacuum Protocol' : 'Nouveau Devlog Vacuum Protocol'}
              </span>
            </div>
            <button
              onClick={closePostModal}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white transition-all cursor-pointer"
              title="Fermer (Échap)"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
          </div>

          {/* Subheader info guide */}
          <div className="bg-secondary/5 border-b border-white/5 px-6 py-2 text-[11px] font-mono text-on-surface-variant flex items-center justify-between">
            <span>🎮 <b>Devlog Gaming :</b> Mises à jour du jeu, Patch Notes, importance & bot Discord.</span>
            
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => setTextLang('fr')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${textLang === 'fr' ? 'bg-primary text-black' : 'text-on-surface-variant hover:text-white'}`}
              >
                FR 🇫🇷
              </button>
              <button
                type="button"
                onClick={() => setTextLang('en')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all cursor-pointer ${textLang === 'en' ? 'bg-primary text-black' : 'text-on-surface-variant hover:text-white'}`}
              >
                EN 🇬🇧
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-black/30 border-b border-white/5 px-6 py-3 flex items-center justify-center gap-2 md:gap-3 font-mono text-xs flex-wrap">
            <button
              type="button"
              onClick={() => setFormTab('general')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${formTab === 'general' ? 'bg-primary text-black font-bold' : 'text-on-surface-variant hover:text-white bg-white/5'}`}
            >
              1. Infos & Discord
            </button>
            <button
              type="button"
              onClick={() => setFormTab('changelogs')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${formTab === 'changelogs' ? 'bg-primary text-black font-bold' : 'text-on-surface-variant hover:text-white bg-white/5'}`}
            >
              2. Patch Notes ({formData.changelogs.length})
            </button>
            <button
              type="button"
              onClick={() => setFormTab('media')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${formTab === 'media' ? 'bg-primary text-black font-bold' : 'text-on-surface-variant hover:text-white bg-white/5'}`}
            >
              3. Médias & Captures ({formData.slots.length})
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Status Feedback */}
            {statusMsg.text && (
              <div className={`p-3 rounded-xl font-mono text-xs border ${statusMsg.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-secondary/10 border-secondary/30 text-secondary'}`}>
                {statusMsg.text}
              </div>
            )}

            {/* TAB 1: General Info & Discord */}
            {formTab === 'general' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InputField
                    label="Type de Update"
                    placeholder="ex: Devlog #14, Mise à Jour Alpha 0.4"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  />

                  <div>
                    <label className="block text-xs font-mono text-on-surface-variant mb-1">Importance</label>
                    <select
                      value={formData.importance}
                      onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="normal">Mise à jour standard (Normal)</option>
                      <option value="major">Mise à jour Majeure (Major Feature)</option>
                    </select>
                  </div>

                  <InputField
                    label="Date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label={`Titre du Devlog (${textLang.toUpperCase()}) *`}
                    placeholder="ex: Système d'inventaire & Amélioration de l'IA"
                    value={textLang === 'fr' ? formData.titleFr : formData.titleEn}
                    onChange={(e) => {
                      if (textLang === 'fr') setFormData({ ...formData, titleFr: e.target.value });
                      else setFormData({ ...formData, titleEn: e.target.value });
                    }}
                    required
                  />

                  <InputField
                    label="Tags & Mots-clés"
                    placeholder="Vacuum Protocol, Devlog, Gameplay"
                    value={formData.tagsText}
                    onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-on-surface-variant mb-1">
                    Résumé Court ({textLang.toUpperCase()})
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Résumé succinct affiché sur les cartes..."
                    value={textLang === 'fr' ? formData.descFr : formData.descEn}
                    onChange={(e) => {
                      if (textLang === 'fr') setFormData({ ...formData, descFr: e.target.value });
                      else setFormData({ ...formData, descEn: e.target.value });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-sans text-xs focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-on-surface-variant mb-1">
                    Description Détaillée du Devlog ({textLang.toUpperCase()})
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Explications techniques, avancées du game design..."
                    value={textLang === 'fr' ? formData.contentFr : formData.contentEn}
                    onChange={(e) => {
                      if (textLang === 'fr') setFormData({ ...formData, contentFr: e.target.value });
                      else setFormData({ ...formData, contentEn: e.target.value });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-sans text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Discord Notification Toggle */}
                {!editingPost && (
                  <div className="bg-black/30 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <i className="fa-brands fa-discord text-secondary text-lg"></i>
                      <div>
                        <div className="text-xs font-mono font-bold text-white">Notifier le serveur Discord</div>
                        <div className="text-[11px] text-on-surface-variant">Publie un message automatique dans le salon devlog Discord</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={postToDiscord}
                      onChange={(e) => setPostToDiscord(e.target.checked)}
                      className="w-5 h-5 accent-secondary cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Patch Notes / Changelogs */}
            {formTab === 'changelogs' && (
              <PatchNoteEditor
                changelogs={formData.changelogs}
                onChange={(updatedChangelogs) => setFormData({ ...formData, changelogs: updatedChangelogs })}
              />
            )}

            {/* TAB 3: Media Slots */}
            {formTab === 'media' && (
              <MediaSlotEditor
                slots={formData.slots}
                onAddSlot={handleAddSlot}
                onUpdateSlot={handleUpdateSlot}
                onRemoveSlot={handleRemoveSlot}
                onMoveSlotUp={handleMoveSlotUp}
                onMoveSlotDown={handleMoveSlotDown}
                onFileUpload={handleFileUpload}
              />
            )}

            {/* Submit Buttons */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={closePostModal}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white font-mono text-xs transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <Button
                type="submit"
                variant="green"
                disabled={saving}
              >
                {saving ? 'Publication...' : editingPost ? 'Mettre à Jour le Devlog' : 'Publier le Devlog Vacuum'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
