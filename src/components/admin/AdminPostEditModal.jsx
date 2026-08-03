import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../context/AdminContext';
import InputField from '../InputField';
import Button from '../Button';
import MediaSlotEditor from './MediaSlotEditor';
import PatchNoteEditor from './PatchNoteEditor';

export default function AdminPostEditModal() {
  const { t, i18n } = useTranslation();
  const {
    isPostModalOpen,
    editingPost,
    defaultCategory,
    closePostModal,
    adminPassword,
    triggerRefresh
  } = useAdmin();

  const [formTab, setFormTab] = useState('general'); // 'general' | 'media' | 'content'
  const [textLang, setTextLang] = useState(i18n.language?.startsWith('en') ? 'en' : 'fr');
  const [postToDiscord, setPostToDiscord] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    category: 'gaming',
    type: '',
    importance: 'normal',
    date: new Date().toISOString().split('T')[0],
    slots: [{ id: 'slot-1', type: 'image', sourceType: 'url', url: '' }],
    tagsText: '',
    titleFr: '',
    titleEn: '',
    descFr: '',
    descEn: '',
    contentFr: '',
    contentEn: '',
    changelogs: [],
    commentsCount: '0'
  });

  // Populate form on edit or reset on create
  useEffect(() => {
    if (!isPostModalOpen) return;

    if (editingPost) {
      setFormData({
        category: editingPost.category || 'gaming',
        type: editingPost.type || '',
        importance: editingPost.importance || 'normal',
        date: editingPost.date || new Date().toISOString().split('T')[0],
        slots: editingPost.slots || [
          { id: 'slot-1', type: editingPost.mediaType || 'image', sourceType: 'url', url: editingPost.mediaUrl || '' }
        ],
        tagsText: editingPost.tags ? editingPost.tags.join(', ') : '',
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
        category: defaultCategory || 'gaming',
        type: '',
        importance: 'normal',
        date: new Date().toISOString().split('T')[0],
        slots: [{ id: 'slot-1', type: 'image', sourceType: 'url', url: '' }],
        tagsText: '',
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
      if (e.key === 'Escape' && isPostModalOpen) {
        closePostModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPostModalOpen, closePostModal]);

  if (!isPostModalOpen) return null;


  // Media Slot Helper Functions
  const handleAddSlot = () => {
    setFormData(prev => ({
      ...prev,
      slots: [
        ...(prev.slots || []),
        { id: `slot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, type: 'image', sourceType: 'url', url: '' }
      ]
    }));
  };

  const handleUpdateSlot = (index, field, value) => {
    setFormData(prev => {
      const newSlots = [...(prev.slots || [])];
      newSlots[index] = { ...newSlots[index], [field]: value };
      return { ...prev, slots: newSlots };
    });
  };

  const handleRemoveSlot = (index) => {
    setFormData(prev => {
      const newSlots = (prev.slots || []).filter((_, idx) => idx !== index);
      return {
        ...prev,
        slots: newSlots.length > 0 ? newSlots : [{ id: 'slot-1', type: 'image', sourceType: 'url', url: '' }]
      };
    });
  };

  const handleMoveSlotUp = (index) => {
    if (index <= 0) return;
    setFormData(prev => {
      const newSlots = [...(prev.slots || [])];
      const temp = newSlots[index - 1];
      newSlots[index - 1] = newSlots[index];
      newSlots[index] = temp;
      return { ...prev, slots: newSlots };
    });
  };

  const handleMoveSlotDown = (index) => {
    setFormData(prev => {
      const newSlots = [...(prev.slots || [])];
      if (index >= newSlots.length - 1) return prev;
      const temp = newSlots[index + 1];
      newSlots[index + 1] = newSlots[index];
      newSlots[index] = temp;
      return { ...prev, slots: newSlots };
    });
  };

  const handleFileUpload = (index, file) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      setStatusMsg({ text: 'Le fichier est trop volumineux (max 25 Mo).', type: 'error' });
      return;
    }

    setStatusMsg({ text: `Téléversement en cours (${file.name})...`, type: 'info' });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': adminPassword
          },
          body: JSON.stringify({
            fileData: dataUrl,
            fileName: file.name,
            fileType: file.type
          })
        });

        const data = await res.json();
        if (res.ok && data && data.url) {
          handleUpdateSlot(index, 'url', data.url);
          setStatusMsg({ text: 'Fichier téléversé et appliqué au slot !', type: 'success' });
        } else {
          setStatusMsg({ text: data.error || 'Échec du téléversement.', type: 'error' });
        }
      } catch (err) {
        console.error('File upload failed:', err);
        setStatusMsg({ text: 'Erreur réseau lors de l\'envoi du fichier.', type: 'error' });
      }
    };
    reader.readAsDataURL(file);
  };


  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: '', type: '' });

    const tagsArray = formData.tagsText
      ? formData.tagsText.split(',').map(t => t.trim()).filter(Boolean)
      : [];

    const primarySlot = formData.slots[0] || { type: 'image', url: '' };

    const payload = {
      id: editingPost ? editingPost.id : Date.now(),
      category: formData.category,
      type: formData.type,
      importance: formData.importance,
      date: formData.date,
      mediaType: primarySlot.type,
      mediaUrl: primarySlot.url,
      slots: formData.slots,
      tags: tagsArray,
      title: {
        fr: formData.titleFr || 'Titre',
        en: formData.titleEn || formData.titleFr || 'Title'
      },
      description: {
        fr: formData.descFr || '',
        en: formData.descEn || formData.descFr || ''
      },
      content: {
        fr: formData.contentFr || '',
        en: formData.contentEn || formData.contentFr || ''
      },
      changelogs: formData.changelogs || [],
      commentsCount: parseInt(formData.commentsCount || '0', 10),
      postToDiscord: !editingPost && postToDiscord
    };

    try {
      const method = editingPost ? 'PUT' : 'POST';
      const res = await fetch('/api/posts', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setStatusMsg({ text: 'Enregistré avec succès !', type: 'success' });
        triggerRefresh();
        setTimeout(() => {
          closePostModal();
        }, 500);
      } else {
        const data = await res.json();
        setStatusMsg({ text: data.error || 'Erreur lors de la sauvegarde.', type: 'error' });
      }
    } catch (err) {
      console.error('Save failed:', err);
      setStatusMsg({ text: 'Erreur réseau.', type: 'error' });
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
              <i className="fa-solid fa-pen-to-square text-secondary"></i>
              <span className="font-bold uppercase tracking-wider">
                {editingPost ? (t('portfolio.admin.edit_title') || 'Modifier le Projet') : (t('portfolio.admin.create_title') || 'Créer un Nouveau Projet')}
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


          {/* Tab Selection */}
          <div className="bg-black/30 border-b border-white/5 px-6 py-3 flex items-center justify-center gap-3 font-mono text-xs">
            <button
              type="button"
              onClick={() => setFormTab('general')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${formTab === 'general' ? 'bg-primary text-black font-bold' : 'text-on-surface-variant hover:text-white bg-white/5'}`}
            >
              1. Informations Générales
            </button>
            <button
              type="button"
              onClick={() => setFormTab('media')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${formTab === 'media' ? 'bg-primary text-black font-bold' : 'text-on-surface-variant hover:text-white bg-white/5'}`}
            >
              2. Médias ({formData.slots.length})
            </button>
            <button
              type="button"
              onClick={() => setFormTab('content')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${formTab === 'content' ? 'bg-primary text-black font-bold' : 'text-on-surface-variant hover:text-white bg-white/5'}`}
            >
              3. Textes & Patch Note
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
            {statusMsg.text && (
              <div className={`p-3 rounded-xl text-xs font-mono border ${statusMsg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                {statusMsg.text}
              </div>
            )}

            {/* TAB 1: General Info */}
            {formTab === 'general' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-on-surface-variant mb-1 uppercase">Catégorie</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full p-3 rounded-xl bg-surface border border-white/10 text-xs font-mono text-on-surface focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="gaming">Gaming (Vacuum Protocol)</option>
                      <option value="website">Sites Web</option>
                      <option value="ai-agent">Agents IA</option>
                      <option value="mobile">Applications Mobiles</option>
                    </select>
                  </div>

                  <InputField
                    label="Sous-type / Tag principal"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Ex: Netcode, UI, SaaS"
                  />

                  <InputField
                    label="Date du Post"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-on-surface-variant mb-1 uppercase">Importance du Post</label>
                    <select
                      value={formData.importance}
                      onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                      className="w-full p-3 rounded-xl bg-surface border border-white/10 text-xs font-mono text-on-surface focus:border-primary outline-none cursor-pointer"
                    >
                      <option value="normal">Mise à jour Normale (Minor)</option>
                      <option value="major">Mise à jour Majeure (Major Feature)</option>
                    </select>
                  </div>

                  <InputField
                    label="Tags (séparés par des virgules)"
                    value={formData.tagsText}
                    onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                    placeholder="unity, c#, netcode, react"
                  />
                </div>

                {!editingPost && (
                  <label className="flex items-center gap-2 cursor-pointer pt-2 select-none">
                    <input
                      type="checkbox"
                      checked={postToDiscord}
                      onChange={(e) => setPostToDiscord(e.target.checked)}
                      className="custom-checkbox cursor-pointer"
                    />
                    <span className="text-xs font-mono text-on-surface">Envoyer automatiquement une notification sur le Discord Webhook</span>
                  </label>
                )}
              </div>
            )}

            {/* TAB 2: Media Slots */}
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

            {/* TAB 3: Content & Changelogs */}
            {formTab === 'content' && (
              <div className="space-y-6">
                
                {/* Language Switcher Toggle (Same as Navbar LanguageSwitcher) */}
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-xs font-mono text-on-surface-variant uppercase">Langue d'Édition du Contenu</span>
                  <div className="relative flex items-center p-1 bg-surface-container-low/50 rounded-xl border border-white/10 backdrop-blur-md select-none">
                    {/* Sliding indicator */}
                    <div
                      className="absolute inset-y-1 transition-all duration-300 ease-out bg-primary rounded-lg shadow-[0_0_15px_rgba(190,194,255,0.25)]"
                      style={{
                        transform: textLang === 'fr' ? 'translateX(0px)' : 'translateX(36px)',
                        width: '32px'
                      }}
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setTextLang('fr')}
                        className={`relative z-10 w-8 h-7 flex items-center justify-center text-[10px] font-black transition-colors duration-300 cursor-pointer focus:outline-none ${
                          textLang === 'fr' ? 'text-black' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        FR
                      </button>
                      <button
                        type="button"
                        onClick={() => setTextLang('en')}
                        className={`relative z-10 w-8 h-7 flex items-center justify-center text-[10px] font-black transition-colors duration-300 cursor-pointer focus:outline-none ${
                          textLang === 'en' ? 'text-black' : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        EN
                      </button>
                    </div>
                  </div>
                </div>

                {textLang === 'fr' ? (
                  <div className="space-y-4">
                    <InputField
                      label="Titre (FR)"
                      value={formData.titleFr}
                      onChange={(e) => setFormData({ ...formData, titleFr: e.target.value })}
                      required
                    />
                    <InputField
                      label="Résumé Court (FR)"
                      value={formData.descFr}
                      onChange={(e) => setFormData({ ...formData, descFr: e.target.value })}
                      isTextArea
                      rows={2}
                    />
                    <InputField
                      label="Description Détaillée / Article (FR)"
                      value={formData.contentFr}
                      onChange={(e) => setFormData({ ...formData, contentFr: e.target.value })}
                      isTextArea
                      rows={4}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <InputField
                      label="Title (EN)"
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    />
                    <InputField
                      label="Short Summary (EN)"
                      value={formData.descEn}
                      onChange={(e) => setFormData({ ...formData, descEn: e.target.value })}
                      isTextArea
                      rows={2}
                    />
                    <InputField
                      label="Detailed Description (EN)"
                      value={formData.contentEn}
                      onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                      isTextArea
                      rows={4}
                    />
                  </div>
                )}

                {/* Patch Note / Changelog Editor */}
                <div className="pt-4 border-t border-white/5">
                  <PatchNoteEditor
                    changelogs={formData.changelogs}
                    onChangeChangelogs={(newLogs) => setFormData({ ...formData, changelogs: newLogs })}
                  />
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <Button variant="black" onClick={closePostModal} type="button">
                Annuler
              </Button>

              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer le Projet'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
