import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '../../context/AdminContext';
import InputField from '../InputField';
import Button from '../Button';
import MediaSlotEditor from './MediaSlotEditor';
import FeaturesEditor from './FeaturesEditor';
import TechStackEditor from './TechStackEditor';


export default function AdminProjectEditModal() {
  const { t, i18n } = useTranslation();
  const {
    isPostModalOpen,
    editingPost,
    defaultCategory,
    closePostModal,
    adminPassword,
    triggerRefresh
  } = useAdmin();

  // Modal active for all non-gaming project categories
  const activeCategory = editingPost ? editingPost.category : defaultCategory;
  const isProjectCategory = activeCategory !== 'gaming';


  const [formTab, setFormTab] = useState('general'); // 'general' | 'content' | 'features' | 'media'
  const [textLang, setTextLang] = useState(i18n.language?.startsWith('en') ? 'en' : 'fr');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    category: 'sites',
    type: 'Projet Sur-Mesure',
    date: new Date().toISOString().split('T')[0],
    slots: [{ id: 'slot-1', type: 'image', sourceType: 'url', url: '' }],
    tagsText: '',
    titleFr: '',
    titleEn: '',
    descFr: '',
    descEn: '',
    contentFr: '',
    contentEn: '',
    externalUrl: '',
    featuresFr: '',
    featuresEn: '',
    techStack: '',
    commentsCount: '0'
  });

  useEffect(() => {
    if (!isPostModalOpen) return;

    if (editingPost) {
      // Parse extra if JSON string
      let extraObj = editingPost.extra;
      if (typeof extraObj === 'string') {
        try { extraObj = JSON.parse(extraObj); } catch { extraObj = {}; }
      }

      // Initial features list
      const rawFeat = extraObj?.featuresList || extraObj?.features?.fr || editingPost.featuresFr || [];
      const initFeatures = Array.isArray(rawFeat)
        ? rawFeat
        : typeof rawFeat === 'string'
        ? rawFeat.split(/\r?\n/).map(line => ({ title: line.replace(/^[\s•\-\*]+/, '').trim(), desc: '' })).filter(f => f.title)
        : [];

      // Initial specs list
      const rawSpecs = extraObj?.specsList || extraObj?.specs || editingPost.specs || [];
      const initSpecs = Array.isArray(rawSpecs)
        ? rawSpecs
        : typeof extraObj?.techStack === 'string' && extraObj.techStack
        ? extraObj.techStack.split('|').map(s => {
            const parts = s.split(':');
            return { label: (parts[0] || 'TECH').trim().toUpperCase(), value: (parts[1] || parts[0]).trim() };
          })
        : [];

      setFormData({
        category: editingPost.category || 'sites',
        type: editingPost.type || 'Projet Sur-Mesure',
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
        externalUrl: extraObj?.externalUrl || editingPost.externalUrl || '',
        featuresList: initFeatures,
        specsList: initSpecs,
        commentsCount: String(editingPost.commentsCount || '0')
      });
    } else {
      setFormData({
        category: defaultCategory && defaultCategory !== 'gaming' ? defaultCategory : 'sites',
        type: 'Projet Sur-Mesure',
        date: new Date().toISOString().split('T')[0],
        slots: [{ id: 'slot-1', type: 'image', sourceType: 'url', url: '' }],
        tagsText: '',
        titleFr: '',
        titleEn: '',
        descFr: '',
        descEn: '',
        contentFr: '',
        contentEn: '',
        externalUrl: '',
        featuresList: [
          { title: 'Système Devis Interactif', desc: 'Calculateur de devis sur-mesure pour les clients BTP.' },
          { title: 'Performance 99/100', desc: 'Optimisation SEO & Lighthouse sur-mesure.' }
        ],
        specsList: [
          { label: 'FRAMEWORK', value: 'React & Vite' },
          { label: 'DESIGN & STYLE', value: 'Tailwind CSS & Framer Motion' },
          { label: 'SCORE PERFORMANCE', value: '99/100 Lighthouse' }
        ],
        commentsCount: '0'
      });
    }

    setFormTab('general');
    setStatusMsg({ text: '', type: '' });
  }, [isPostModalOpen, editingPost, defaultCategory]);

  // Escape Key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPostModalOpen && isProjectCategory) {
        closePostModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPostModalOpen, isProjectCategory, closePostModal]);

  if (!isPostModalOpen || !isProjectCategory) return null;

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

    // Validate required fields
    if (!formData.titleFr) {
      setStatusMsg({ text: 'Le titre en français est requis.', type: 'error' });
      setSaving(false);
      setFormTab('general');
      return;
    }

    const firstSlot = formData.slots[0] || {};
    const mediaType = firstSlot.type || 'image';
    const mediaUrl = firstSlot.url || '';

    const tagsArray = formData.tagsText
      ? formData.tagsText.split(',').map(t => t.trim()).filter(Boolean)
      : ['Sur-Mesure'];

    const postPayload = {
      id: editingPost ? editingPost.id : undefined,
      category: formData.category,
      type: formData.type || 'Projet Sur-Mesure',
      importance: 'normal',
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
      extra: {
        externalUrl: formData.externalUrl,
        featuresList: formData.featuresList,
        specsList: formData.specsList,
        features: {
          fr: formData.featuresList.map(f => f.title ? `${f.title}: ${f.desc}` : f).join('\n'),
          en: formData.featuresList.map(f => f.title ? `${f.title}: ${f.desc}` : f).join('\n')
        },
        techStack: formData.specsList.map(s => `${s.label}: ${s.value}`).join(' | ')
      },

      commentsCount: parseInt(formData.commentsCount, 10) || 0
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
        setStatusMsg({ text: editingPost ? 'Projet mis à jour !' : 'Projet créé avec succès !', type: 'success' });
        setTimeout(() => {
          triggerRefresh();
          closePostModal();
        }, 600);
      } else {
        const data = await res.json();
        setStatusMsg({ text: data.error || 'Erreur lors de l’enregistrement.', type: 'error' });
      }
    } catch (err) {
      console.error('Submit Project Error:', err);
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
              <i className="fa-solid fa-laptop-code text-secondary"></i>
              <span className="font-bold uppercase tracking-wider">
                {editingPost ? 'Éditeur de Projet Portfolio' : 'Créer un Nouveau Projet Vitrine'}
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
          <div className="bg-primary/5 border-b border-white/5 px-6 py-2 text-[11px] font-mono text-on-surface-variant flex items-center justify-between">
            <span>💡 <b>Vitrine Client B2B :</b> Titre, médias, description avec contexte & liens vers le site live.</span>
            
            {/* Language Switcher for Fields */}
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
              1. En-tête & Mots-clés
            </button>
            <button
              type="button"
              onClick={() => setFormTab('content')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${formTab === 'content' ? 'bg-primary text-black font-bold' : 'text-on-surface-variant hover:text-white bg-white/5'}`}
            >
              2. Description & Lien Web
            </button>
            <button
              type="button"
              onClick={() => setFormTab('features')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${formTab === 'features' ? 'bg-primary text-black font-bold' : 'text-on-surface-variant hover:text-white bg-white/5'}`}
            >
              3. Features & Stack Tech
            </button>
            <button
              type="button"
              onClick={() => setFormTab('media')}
              className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${formTab === 'media' ? 'bg-primary text-black font-bold' : 'text-on-surface-variant hover:text-white bg-white/5'}`}
            >
              4. Galeries Médias ({formData.slots.length})
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

            {/* TAB 1: General Info */}
            {formTab === 'general' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-on-surface-variant mb-1">Catégorie du Projet</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:border-primary focus:outline-none"
                    >
                      <option value="sites">Sites & Applications Web</option>
                      <option value="mobile">Applications Mobiles (iOS / Android)</option>
                      <option value="ai">Intelligence Artificielle & Agents</option>
                    </select>
                  </div>

                  <InputField
                    label="Sous-titre / Type de Prestation"
                    placeholder="ex: Application Web Sur-Mesure, SAAS, E-Commerce"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label={`Titre du Projet (${textLang.toUpperCase()}) *`}
                    placeholder="ex: Plateforme SaaS FinTech B2B"
                    value={textLang === 'fr' ? formData.titleFr : formData.titleEn}
                    onChange={(e) => {
                      if (textLang === 'fr') setFormData({ ...formData, titleFr: e.target.value });
                      else setFormData({ ...formData, titleEn: e.target.value });
                    }}
                    required
                  />

                  <InputField
                    label="Date de Réalisation"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <InputField
                  label="Mots-clés & Stack Globale (séparés par des virgules)"
                  placeholder="React, Next.js, Tailwind, Stripe, Supabase, Dashboard"
                  value={formData.tagsText}
                  onChange={(e) => setFormData({ ...formData, tagsText: e.target.value })}
                />
              </div>
            )}

            {/* TAB 2: Description & External Links */}
            {formTab === 'content' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-on-surface-variant mb-1">
                    Résumé Rapide ({textLang.toUpperCase()}) — Aperçu sur la carte repliée
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Courte phrase d'accroche visible avant de déplier le projet..."
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
                    Description Approfondie & Contexte ({textLang.toUpperCase()}) — Visible au dépliage
                  </label>
                  <textarea
                    rows={6}
                    placeholder="Détaillez le besoin du client, les défis techniques résolus et la valeur apportée par l'application..."
                    value={textLang === 'fr' ? formData.contentFr : formData.contentEn}
                    onChange={(e) => {
                      if (textLang === 'fr') setFormData({ ...formData, contentFr: e.target.value });
                      else setFormData({ ...formData, contentEn: e.target.value });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white font-sans text-xs focus:border-primary focus:outline-none"
                  />
                </div>

                {/* External URL with Style Guidance */}
                <div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-secondary">
                    <i className="fa-solid fa-globe"></i>
                    <span className="font-bold">Lien Vers le Site en Production / Démo</span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant">
                    Saisissez l'URL officielle (ex: <code>https://mon-application.com</code>). Un bouton d'action néon aux couleurs de BKN Tech sera automatiquement généré sous la description !
                  </p>
                  <InputField
                    placeholder="https://client-website.com"
                    value={formData.externalUrl}
                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Features & Tech Stack */}
            {formTab === 'features' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-mono font-bold text-primary uppercase tracking-wider mb-2">
                    1. Caractéristiques & Fonctionnalités Sur-Mesure
                  </h4>
                  <FeaturesEditor
                    features={formData.featuresList}
                    onChange={(newList) => setFormData({ ...formData, featuresList: newList })}
                  />
                </div>

                <div>
                  <h4 className="text-xs font-mono font-bold text-tertiary uppercase tracking-wider mb-2">
                    2. Fiche Technique & Technologies (Spécifications)
                  </h4>
                  <p className="text-[11px] text-on-surface-variant mb-2">
                    Ajoutez chaque brique technique sous forme de carte (ex: <code>FRAMEWORK</code> = <code>React & Vite</code>, <code>DESIGN</code> = <code>Tailwind CSS</code>).
                  </p>
                  <TechStackEditor
                    specs={formData.specsList}
                    onChange={(newList) => setFormData({ ...formData, specsList: newList })}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: Media Slots */}
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

            {/* Submit Action Buttons */}
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
                variant="primary"
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : editingPost ? 'Mettre à Jour le Projet' : 'Publier le Projet Vitrine'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
