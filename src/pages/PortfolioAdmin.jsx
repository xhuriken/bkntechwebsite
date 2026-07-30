import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { formatLocaleDate } from '../utils/dateFormatter';
import BannerSettingsCard from '../components/admin/BannerSettingsCard';
import MediaSlotEditor from '../components/admin/MediaSlotEditor';
import PatchNoteEditor from '../components/admin/PatchNoteEditor';

/**
 * Helper to extract YouTube video ID
 */
function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Helper to check if a URL is a native video (.mp4, .webm, data:video)
 */
function isNativeVideoUrl(url = '') {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.startsWith('data:video') || lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.includes('.mp4?') || lower.includes('.webm?');
}

/**
 * PortfolioAdmin Page Component
 * Refactored for SSOT, collapsible project cards (with large video/image media view),
 * 80%/20% action button split, minimal category menu, aggressive red logout hover,
 * and portfolio section title decoration for new project creation.
 */
export default function PortfolioAdmin() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'fr';
  const [password, setPassword] = useState(localStorage.getItem('bkn_admin_pass') || '');
  const [isAuth, setIsAuth] = useState(false);
  const [authError, setAuthError] = useState('');

  // API loading & data states
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  // Filter, Search & Expansion states (Default category filter set to Vacuum Protocol 'gaming')
  const [categoryFilter, setCategoryFilter] = useState('gaming');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [postToDiscord, setPostToDiscord] = useState(true);
  const [formTab, setFormTab] = useState('general'); // 'general' | 'media' | 'content'
  const [textLang, setTextLang] = useState('fr'); // 'fr' | 'en' for Tab 3 SSOT toggle
  const [deletingPost, setDeletingPost] = useState(null); // Post pending deletion for custom modal
  const [saveSuccess, setSaveSuccess] = useState(false); // Success screen transition like ContactForm.jsx
  const bannerFileRef = useRef(null);
  const devlogBannerFileRef = useRef(null);

  // Featured banner settings state (Portfolio page & Devlog page)
  const [featuredBannerUrl, setFeaturedBannerUrl] = useState('');
  const [bannerInputUrl, setBannerInputUrl] = useState('');
  const [bannerSaving, setBannerSaving] = useState(false);
  const [bannerMsg, setBannerMsg] = useState({ text: '', type: '' });

  const [devlogBannerUrl, setDevlogBannerUrl] = useState('');
  const [devlogBannerInputUrl, setDevlogBannerInputUrl] = useState('');
  const [devlogBannerSaving, setDevlogBannerSaving] = useState(false);
  const [devlogBannerMsg, setDevlogBannerMsg] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    category: 'gaming',
    type: '',
    importance: 'normal',
    date: new Date().toISOString().split('T')[0],
    slots: [
      { id: 'slot-1', type: 'image', sourceType: 'url', url: '' }
    ],
    tagsText: '',
    titleFr: '',
    titleEn: '',
    descFr: '',
    descEn: '',
    contentFr: '',
    contentEn: '',
    commentsCount: '0'
  });

  // Verify auth on mount if password exists
  useEffect(() => {
    if (password) {
      verifyPassword(password);
    }
  }, []);

  const verifyPassword = (pass) => {
    setLoading(true);
    setAuthError('');
    fetch('/api/posts?verify=true', {
      headers: { 'x-admin-password': pass }
    })
      .then(async res => {
        if (res.ok) {
          const postsRes = await fetch('/api/posts');
          const data = await postsRes.json();
          setPosts(data);
          setIsAuth(true);
          localStorage.setItem('bkn_admin_pass', pass);

          // Load site settings (featured banner URLs)
          try {
            const settingsRes = await fetch('/api/settings');
            const settings = await settingsRes.json();
            if (settings.featuredBannerUrl) {
              setFeaturedBannerUrl(settings.featuredBannerUrl);
              setBannerInputUrl(settings.featuredBannerUrl);
            }
            if (settings.devlogBannerUrl) {
              setDevlogBannerUrl(settings.devlogBannerUrl);
              setDevlogBannerInputUrl(settings.devlogBannerUrl);
            }
          } catch (err) {
            console.error('Failed to load settings:', err);
          }
        } else {
          setAuthError(t('portfolio.admin.invalid_pass'));
          setIsAuth(false);
          localStorage.removeItem('bkn_admin_pass');
        }
      })
      .catch(() => {
        setAuthError(t('portfolio.admin.invalid_pass'));
        setIsAuth(false);
      })
      .finally(() => setLoading(false));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    verifyPassword(password);
  };

  const handleLogout = () => {
    setPassword('');
    setIsAuth(false);
    localStorage.removeItem('bkn_admin_pass');
    setPosts([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Media Slot Management Helpers
  const handleAddSlot = () => {
    setFormData(prev => ({
      ...prev,
      slots: [
        ...(prev.slots || []),
        { id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, type: 'image', sourceType: 'url', url: '' }
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
      return { ...prev, slots: newSlots.length > 0 ? newSlots : [{ id: 'slot-1', type: 'image', sourceType: 'url', url: '' }] };
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

  // Changelog Helper Handlers
  const handleAddChangelogItem = () => {
    setFormData(prev => ({
      ...prev,
      hasChangelog: true,
      changelog: [
        ...(prev.changelog || []),
        { type: 'fix', text: '' }
      ]
    }));
  };

  const handleUpdateChangelogItem = (index, field, value) => {
    setFormData(prev => {
      const newLogs = [...(prev.changelog || [])];
      newLogs[index] = { ...newLogs[index], [field]: value };
      return { ...prev, changelog: newLogs };
    });
  };

  const handleRemoveChangelogItem = (index) => {
    setFormData(prev => ({
      ...prev,
      changelog: (prev.changelog || []).filter((_, idx) => idx !== index)
    }));
  };

  const handleMoveChangelogItemUp = (index) => {
    if (index <= 0) return;
    setFormData(prev => {
      const newLogs = [...(prev.changelog || [])];
      const temp = newLogs[index - 1];
      newLogs[index - 1] = newLogs[index];
      newLogs[index] = temp;
      return { ...prev, changelog: newLogs };
    });
  };

  const handleMoveChangelogItemDown = (index) => {
    setFormData(prev => {
      const newLogs = [...(prev.changelog || [])];
      if (index >= newLogs.length - 1) return prev;
      const temp = newLogs[index + 1];
      newLogs[index + 1] = newLogs[index];
      newLogs[index] = temp;
      return { ...prev, changelog: newLogs };
    });
  };

  const handleSlotFileUpload = (index, file) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      alert("Le fichier sélectionné est trop volumineux (max 20 Mo).");
      return;
    }
    const isVideo = file.type.startsWith('video/');
    setStatusMsg({ text: `Téléversement du Slot #${index + 1} (${file.name})...`, type: 'info' });

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': password
          },
          body: JSON.stringify({
            fileData: dataUrl,
            fileName: file.name,
            fileType: file.type
          })
        });

        if (res.ok) {
          const data = await res.json();
          setFormData(prev => {
            const newSlots = [...(prev.slots || [])];
            newSlots[index] = {
              ...newSlots[index],
              type: isVideo ? 'video' : 'image',
              url: data.url,
              sourceType: 'local'
            };
            return { ...prev, slots: newSlots };
          });
          setStatusMsg({ text: `Fichier enregistré pour le Slot #${index + 1} (${data.url}) !`, type: 'success' });
        }
      } catch (err) {
        console.error("Slot upload error:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditSelect = (post) => {
    setEditingId(post.id);

    // Reconstruct slots list from post
    let postSlots = [];
    if (Array.isArray(post.slots) && post.slots.length > 0) {
      postSlots = post.slots;
    } else {
      if (post.mediaUrl) {
        postSlots.push({
          id: 'slot-1',
          type: post.mediaType || 'image',
          sourceType: 'url',
          url: post.mediaUrl
        });
      }
      if (Array.isArray(post.gallery)) {
        post.gallery.forEach((gUrl, idx) => {
          const isVid = gUrl.includes('.mp4') || gUrl.includes('youtube') || gUrl.includes('vimeo');
          postSlots.push({
            id: `slot-${idx + 2}`,
            type: isVid ? 'video' : 'image',
            sourceType: 'url',
            url: gUrl
          });
        });
      }
    }
    if (postSlots.length === 0) {
      postSlots = [{ id: 'slot-1', type: 'image', sourceType: 'url', url: '' }];
    }

    setFormData({
      category: post.category,
      type: post.type || '',
      importance: post.importance || 'normal',
      date: post.date,
      slots: postSlots,
      tagsText: post.tags ? post.tags.join(', ') : '',
      titleFr: post.title?.fr || '',
      titleEn: post.title?.en || '',
      descFr: post.description?.fr || '',
      descEn: post.description?.en || '',
      contentFr: post.content?.fr || '',
      contentEn: post.content?.en || '',
      commentsCount: post.commentsCount !== undefined ? String(post.commentsCount) : '0',
      hasChangelog: !!post.hasChangelog,
      changelog: Array.isArray(post.changelog) ? post.changelog : []
    });
    setFormTab('general');
    setTextLang('fr');
    document.getElementById('edit-form-anchor')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      category: 'gaming',
      type: '',
      importance: 'normal',
      date: new Date().toISOString().split('T')[0],
      slots: [
        { id: 'slot-1', type: 'image', sourceType: 'url', url: '' }
      ],
      tagsText: '',
      titleFr: '',
      titleEn: '',
      descFr: '',
      descEn: '',
      contentFr: '',
      contentEn: '',
      commentsCount: '0',
      hasChangelog: false,
      changelog: []
    });
    setPostToDiscord(true);
    setFormTab('general');
    setTextLang('fr');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prevent saving empty project ("projet vide")
    if (!formData.titleFr || !formData.titleFr.trim()) {
      setStatusMsg({ text: "Veuillez indiquer au moins le titre du projet en Français.", type: 'error' });
      setFormTab('content');
      setTextLang('fr');
      return;
    }

    setLoading(true);
    setStatusMsg({ text: '', type: '' });

    // Derive primary mediaUrl and gallery from slots
    const validSlots = (formData.slots || []).filter(s => s.url && s.url.trim() !== '');
    const primarySlot = validSlots[0] || { type: 'image', url: '/BknLogo.svg' };

    const payload = {
      id: editingId,
      category: formData.category,
      type: formData.type || (formData.category === 'gaming' ? 'General' : ''),
      importance: formData.category === 'gaming' ? formData.importance : undefined,
      date: formData.date,
      mediaType: primarySlot.type,
      mediaUrl: primarySlot.url,
      gallery: validSlots.slice(1).map(s => s.url),
      slots: formData.slots,
      tags: formData.tagsText.split(',').map(tag => tag.trim()).filter(Boolean),
      title: {
        fr: formData.titleFr.trim(),
        en: (formData.titleEn && formData.titleEn.trim()) || formData.titleFr.trim()
      },
      description: {
        fr: formData.descFr || 'Description du projet',
        en: formData.descEn || formData.descFr || 'Project description'
      },
      content: {
        fr: formData.contentFr || 'Détails du projet',
        en: formData.contentEn || formData.contentFr || 'Project details'
      },
      commentsCount: parseInt(formData.commentsCount || '0', 10),
      hasChangelog: !!formData.hasChangelog,
      changelog: formData.hasChangelog ? (formData.changelog || []) : [],
      postToDiscord
    };

    fetch('/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password
      },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        if (res.ok) {
          const updatedPosts = await res.json();
          setPosts(updatedPosts);
          // Trigger smooth success screen transition (like ContactForm.jsx)
          setSaveSuccess(true);
          setTimeout(() => {
            setSaveSuccess(false);
            setEditingId(null);
            resetForm();
          }, 1800);
        } else {
          const errData = await res.json();
          setStatusMsg({ text: errData.error || "Échec de l'enregistrement.", type: 'error' });
        }
        setLoading(false);
      })
      .catch(() => {
        setStatusMsg({ text: "Erreur réseau lors de la sauvegarde.", type: 'error' });
        setLoading(false);
      });
  };

  // Open custom SSOT Delete Confirmation Modal
  const handleDeleteRequest = (post) => {
    setDeletingPost(post);
  };

  const confirmDelete = () => {
    if (!deletingPost) return;
    const postId = deletingPost.id;
    setDeletingPost(null);
    setLoading(true);
    setStatusMsg({ text: '', type: '' });

    fetch('/api/posts', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password
      },
      body: JSON.stringify({ id: postId })
    })
      .then(async res => {
        if (res.ok) {
          const updatedPosts = await res.json();
          setPosts(updatedPosts);
          setStatusMsg({ text: t('portfolio.admin.success_delete'), type: 'success' });
          if (editingId === postId) {
            handleCancelEdit();
          }
        } else {
          const errData = await res.json();
          setStatusMsg({ text: errData.error || "Échec de la suppression.", type: 'error' });
        }
        setLoading(false);
      })
      .catch(() => {
        setStatusMsg({ text: "Erreur réseau lors de la suppression.", type: 'error' });
        setLoading(false);
      });
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/posts?download=true', {
        headers: { 'x-admin-password': password }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'posts.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error("Failed to export database:", err);
      alert("Erreur lors de l'exportation du fichier.");
    }
  };

  // Filter posts based on category tab and search query (Always sorted newest date to oldest date)
  const filteredPosts = posts
    .filter(post => {
      const matchesCat = categoryFilter === 'all' || post.category === categoryFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        (post.title?.fr && post.title.fr.toLowerCase().includes(q)) ||
        (post.title?.en && post.title.en.toLowerCase().includes(q)) ||
        (post.type && post.type.toLowerCase().includes(q)) ||
        (post.tags && post.tags.some(t => t.toLowerCase().includes(q)));
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  // Category filter tabs matching the Devlog tab bar style with dynamic colored indicator line
  const categoryTabs = [
    {
      id: 'all',
      label: 'Tous',
      activeText: 'text-on-surface font-black',
      lineBg: 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]'
    },
    {
      id: 'gaming',
      label: 'Vacuum Protocol',
      activeText: 'text-secondary font-black',
      lineBg: 'bg-secondary shadow-[0_0_10px_rgba(78,222,163,0.8)]'
    },
    {
      id: 'website',
      label: 'Sites Web',
      activeText: 'text-secondary font-black',
      lineBg: 'bg-secondary shadow-[0_0_10px_rgba(78,222,163,0.8)]'
    },
    {
      id: 'ai-agent',
      label: 'Agents IA',
      activeText: 'text-tertiary font-black',
      lineBg: 'bg-tertiary shadow-[0_0_10px_rgba(255,185,95,0.8)]'
    },
    {
      id: 'mobile',
      label: 'Applications Mobiles',
      activeText: 'text-primary font-black',
      lineBg: 'bg-primary shadow-[0_0_10px_rgba(190,194,255,0.8)]'
    }
  ];

  // Helper badge color per category matching Portfolio
  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'gaming': return 'text-secondary border-secondary/40 bg-secondary/10';
      case 'website': return 'text-secondary border-secondary/40 bg-secondary/10';
      case 'ai-agent': return 'text-tertiary border-tertiary/40 bg-tertiary/10';
      case 'mobile': return 'text-primary border-primary/40 bg-primary/10';
      default: return 'text-on-surface-variant border-white/10 bg-white/5';
    }
  };

  // Render preview helper for form
  const renderMediaPreview = () => {
    if (!formData.mediaUrl) {
      return (
        <div className="w-full h-44 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-on-surface-variant/40 bg-black/20">
          <i className="fa-solid fa-file-image text-2xl opacity-40"></i>
          <span className="text-xs font-sans font-medium">Aucun média sélectionné</span>
        </div>
      );
    }

    const ytId = getYouTubeId(formData.mediaUrl);
    const isVid = formData.mediaType === 'video' || isNativeVideoUrl(formData.mediaUrl);

    if (ytId) {
      return (
        <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-md bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${ytId}`}
            title="Aperçu YouTube"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (isVid) {
      return (
        <div className="w-full rounded-xl overflow-hidden border border-white/10 shadow-md bg-black flex justify-center">
          <video
            src={formData.mediaUrl}
            controls
            playsInline
            muted
            className="w-full max-h-56 object-contain"
          />
        </div>
      );
    }

    return (
      <div className="w-full rounded-xl overflow-hidden border border-white/10 shadow-md bg-black/40">
        <img
          src={formData.mediaUrl}
          alt="Aperçu du média"
          className="w-full max-h-56 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/BknLogo.svg';
          }}
        />
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-8 z-10 relative">

      {/* Back link */}
      <div className="mb-6">
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors group"
        >
          <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
          {t('portfolio.back')}
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-white/5 pb-6 mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="font-sans font-extrabold text-3xl md:text-5xl uppercase tracking-tight mb-2 text-on-surface">
            {t('portfolio.admin.title')}
          </h1>
          <p className="text-on-surface/80 text-sm font-normal tracking-wide">
            Gestionnaire de contenu unifié : créez, modifiez les images, vidéos MP4 et fiches de devlogs.
          </p>
        </div>
        {isAuth && (
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button variant="green-outline" onClick={handleExport}>
              <i className="fa-solid fa-download mr-1.5"></i>
              {t('portfolio.admin.export_btn')}
            </Button>
            <Button
              variant="black"
              onClick={handleLogout}
              className="hover:!bg-red-950/80 hover:!text-red-400 hover:!border-red-600/60 transition-all duration-200"
            >
              <i className="fa-solid fa-right-from-bracket mr-1.5"></i>
              {t('portfolio.admin.logout_btn')}
            </Button>
          </div>
        )}
      </div>

      {/* Authentication Portal */}
      {!isAuth ? (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg mx-auto my-6 relative"
        >
          {/* Ambient decorative glowing backdrops */}
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-secondary/15 rounded-full filter blur-[90px] pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-primary/15 rounded-full filter blur-[90px] pointer-events-none" />

          {/* Main Login Card Container */}
          <div className="bg-surface-container-low/60 backdrop-blur-xl border border-white/10 rounded-3xl p-5 md:p-7 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col gap-6">

            {/* Passive noise texture background */}
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundBlendMode: 'soft-light'
              }}
            />


            {/* Header Title with vertical gradient pill bar decoration */}
            <div className="flex flex-col gap-2 relative z-10 pt-2">
              <div className="flex items-center gap-3">
                <span className="w-[5px] h-7 rounded-full bg-gradient-to-b from-secondary to-transparent flex-shrink-0" />
                <h2 className="font-sans font-extrabold text-2xl uppercase tracking-tight text-on-surface">
                  {t('portfolio.admin.login_title')}
                </h2>
              </div>
              <p className="text-xs font-sans text-on-surface-variant/80 pl-4 leading-relaxed">
                Veuillez saisir votre mot de passe d'administration pour gérer le contenu bilingue, les médias et les devlogs.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="flex flex-col gap-5 relative z-10">
              <InputField
                label={t('portfolio.admin.password')}
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              {authError && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 bg-red-950/40 border border-red-800/50 rounded-xl text-xs font-sans font-semibold text-red-400 flex items-center gap-2.5"
                >
                  <i className="fa-solid fa-triangle-exclamation text-sm flex-shrink-0"></i>
                  <span>{authError}</span>
                </motion.div>
              )}

              <Button
                variant="green"
                type="submit"
                disabled={loading}
                className="w-full !py-3.5 text-xs tracking-widest mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2 justify-center">
                    <i className="fa-solid fa-spinner animate-spin text-sm"></i>
                    Vérification en cours...
                  </span>
                ) : (
                  <span className="flex items-center gap-2 justify-center">
                    <i className="fa-solid fa-key text-xs"></i>
                    {t('portfolio.admin.login_btn')}
                  </span>
                )}
              </Button>
            </form>

          </div>
        </motion.div>
      ) : (
        /* Authenticated Dashboard */
        <div className="flex flex-col gap-8">
          {/* Featured Banners Editor Card Component */}
          <BannerSettingsCard
            settings={{
              vacuumBanner1: featuredBannerUrl,
              vacuumBanner2: devlogBannerUrl
            }}
            onSaveSetting={async (key, val) => {
              try {
                const res = await fetch('/api/settings', {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-admin-password': password
                  },
                  body: JSON.stringify({ [key]: val })
                });
                if (res.ok) {
                  if (key === 'vacuumBanner1' || key === 'featuredBannerUrl') setFeaturedBannerUrl(val);
                  if (key === 'vacuumBanner2' || key === 'devlogBannerUrl') setDevlogBannerUrl(val);
                  return true;
                }
                return false;
              } catch (err) {
                return false;
              }
            }}
          />
          {/* Section Filter & Search Bar */}
          <div className="bg-surface-container-low/45 backdrop-blur-md border border-white/5 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 shadow-lg">

            {/* Category filter tabs matching Devlog tab bar style with dynamic colored indicator line */}
            <div className="flex items-center gap-6 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none border-b border-white/5 flex-grow">
              {categoryTabs.map(cat => {
                const isActive = categoryFilter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`text-xs font-sans uppercase tracking-wider pb-2 transition-all duration-200 relative cursor-pointer whitespace-nowrap focus:outline-none ${isActive
                      ? cat.activeText
                      : 'text-on-surface-variant/60 font-semibold hover:text-on-surface'
                      }`}
                  >
                    <span>{cat.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="adminCategoryActiveLine"
                        className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${cat.lineBg}`}
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search Input & Count Badge */}
            <div className="flex items-center gap-3">
              <div className="relative flex-grow md:w-64">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant/40">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par titre, tag..."
                  className="w-full bg-black/30 border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs font-sans text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary/50 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant/50 hover:text-on-surface"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
              <span className="text-[11px] font-sans font-semibold text-on-surface-variant/60 bg-white/5 border border-white/5 px-2.5 py-2 rounded-xl flex-shrink-0">
                {filteredPosts.length} / {posts.length}
              </span>
            </div>

          </div>



          {/* Main Dashboard Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Projects List */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="font-sans font-bold text-sm uppercase tracking-wider text-primary flex items-center gap-2">
                  <i className="fa-solid fa-list-check text-xs"></i>
                  <span>Liste des Projets</span>
                </h2>
                {/* Full-size SSOT Button for New Project */}
                <Button
                  variant="green"
                  onClick={() => {
                    setEditingId(null);
                    resetForm();
                  }}
                >
                  <i className="fa-solid fa-plus mr-1"></i>
                  Nouveau Projet
                </Button>
              </div>

              {/* Projects Scroll Container */}
              <div className="flex flex-col gap-3 max-h-[72vh] overflow-y-auto pr-1.5 scrollbar-thin">
                {filteredPosts.length === 0 ? (
                  <div className="p-8 text-center bg-surface-container-low/20 rounded-2xl border border-white/5">
                    <p className="text-xs text-on-surface-variant/60">Aucun projet ne correspond à ces critères.</p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {filteredPosts.map(post => {
                      const isVid = post.mediaType === 'video' || isNativeVideoUrl(post.mediaUrl);
                      const badgeClass = getCategoryBadgeClass(post.category);
                      const isExpanded = expandedId === post.id;
                      const ytId = getYouTubeId(post.mediaUrl);

                      return (
                        <motion.div
                          key={post.id}
                          layout
                          initial={{ opacity: 0, y: 12, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -12, scale: 0.98 }}
                          transition={{ duration: 0.22, ease: 'easeOut' }}
                          onClick={() => {
                            setExpandedId(prev => (prev === post.id ? null : post.id));
                            handleEditSelect(post);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all flex flex-col gap-3 bg-surface-container-low/30 backdrop-blur-sm cursor-pointer ${editingId === post.id
                            ? 'border-secondary/60 bg-secondary/[0.06] shadow-[0_0_15px_rgba(78,222,163,0.1)]'
                            : 'border-white/5 hover:border-white/15'
                            }`}
                        >
                          {/* Header Row: Thumbnail, Title, Badge, Chevron */}
                          <div className="flex items-center justify-between gap-3 select-none">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-white/10 flex-shrink-0 relative">
                                {isVid ? (
                                  <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-secondary">
                                    <i className="fa-solid fa-play text-xs"></i>
                                  </div>
                                ) : (
                                  <img
                                    src={post.mediaUrl}
                                    alt={post.title?.fr}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800';
                                    }}
                                  />
                                )}
                              </div>

                              <div className="flex flex-col gap-0.5 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`text-[8px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeClass}`}>
                                    {post.category}
                                  </span>
                                  {post.type && (
                                    <span className="text-[8px] font-sans font-semibold text-on-surface-variant/60 bg-white/5 px-1.5 py-0.5 rounded">
                                      {post.type}
                                    </span>
                                  )}
                                  {post.importance === 'major' && (
                                    <span className="text-[8px] font-sans font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-primary/40 bg-primary/10 text-primary">
                                      ★ MAJOR
                                    </span>
                                  )}
                                  {post.importance === 'minor' && (
                                    <span className="text-[8px] font-sans font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-on-surface-variant/60">
                                      MINOR
                                    </span>
                                  )}
                                </div>
                                <h3 className="font-sans font-bold text-xs text-on-surface truncate">
                                  {post.title?.fr}
                                </h3>
                                <span className="text-[9px] font-sans text-on-surface-variant/50">
                                  {formatLocaleDate(post.date, currentLang)}
                                </span>
                              </div>
                            </div>

                            {/* Chevron unfold indicator */}
                            <i className={`fa-solid fa-chevron-down text-xs transition-transform duration-300 ${isExpanded ? 'rotate-180 text-secondary' : 'text-on-surface-variant/40'
                              }`}></i>
                          </div>

                          {/* Collapsible Body Content (Framer Motion smooth fold/unfold) */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                key="accordion-body"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="flex flex-col gap-3 pt-2 border-t border-white/5">

                                  {/* Description text */}
                                  {post.description?.fr && (
                                    <p className="text-[11px] font-sans text-on-surface-variant/80 italic leading-relaxed">
                                      {post.description.fr}
                                    </p>
                                  )}

                                  {/* Large Media Preview Container */}
                                  {post.mediaUrl && (
                                    <div className="w-full rounded-xl overflow-hidden border border-white/10 bg-black/60 my-1">
                                      {ytId ? (
                                        <div className="aspect-video w-full">
                                          <iframe
                                            src={`https://www.youtube.com/embed/${ytId}`}
                                            className="w-full h-full border-none"
                                            title={post.title?.fr}
                                            allowFullScreen
                                          />
                                        </div>
                                      ) : isVid ? (
                                        <video
                                          src={post.mediaUrl}
                                          controls
                                          playsInline
                                          muted
                                          className="w-full max-h-48 object-contain bg-black"
                                        />
                                      ) : (
                                        <img
                                          src={post.mediaUrl}
                                          alt={post.title?.fr}
                                          className="w-full max-h-48 object-cover"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/BknLogo.svg';
                                          }}
                                        />
                                      )}
                                    </div>
                                  )}

                                  {/* Action Buttons: 80% Edit, 20% Delete */}
                                  <div className="flex items-center gap-2 pt-2 border-t border-white/5 w-full">
                                    <div className="w-[80%]">
                                      <Button
                                        variant="green-outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditSelect(post);
                                        }}
                                        className="w-full !py-2 text-[10px]"
                                      >
                                        <i className="fa-solid fa-pen-to-square mr-1.5"></i>
                                        Modifier
                                      </Button>
                                    </div>
                                    <div className="w-[20%]">
                                      <Button
                                        variant="red-outline"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteRequest(post);
                                        }}
                                        className="w-full !py-2 !px-0 flex items-center justify-center text-[10px]"
                                        title="Supprimer"
                                      >
                                        <i className="fa-solid fa-trash-can"></i>
                                      </Button>
                                    </div>
                                  </div>

                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Right Column: Edit Form Panel */}
            <div id="edit-form-anchor" className="lg:col-span-7 bg-surface-container-low/45 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl relative overflow-hidden min-h-[500px]">

              <AnimatePresence mode="wait">
                {saveSuccess ? (
                  /* Smooth Success Transition Overlay (Matching ContactForm.jsx) */
                  <motion.div
                    key="save-success-screen"
                    initial={{ opacity: 0, scale: 0.92, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -10 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center justify-center my-auto py-16 text-center"
                  >
                    <div className="relative flex items-center justify-center w-24 h-24 mb-6">
                      <div className="absolute inset-0 bg-secondary/15 rounded-full blur-2xl animate-pulse" />
                      <svg className="w-14 h-14 text-secondary relative z-10" viewBox="0 0 52 52" fill="none">
                        <motion.circle
                          cx="26"
                          cy="26"
                          r="24"
                          stroke="currentColor"
                          strokeWidth="4"
                          initial={{ pathLength: 0, opacity: 0.1 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                        <motion.path
                          d="M14 27l8 8 16-16"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                        />
                      </svg>
                    </div>
                    <h3 className="font-sans font-black text-2xl uppercase tracking-widest text-secondary mb-2">
                      {editingId ? "Projet Mis à Jour !" : "Nouveau Projet Enregistré !"}
                    </h3>
                    <p className="text-on-surface-variant text-xs font-sans max-w-sm leading-relaxed">
                      Les modifications ont été sauvegardées et publiées avec succès sur la plateforme.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="admin-form-body"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="flex flex-col gap-6"
                  >
                    {/* Form Title & Decorative Indicator */}
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/5 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-[5px] h-6 rounded-full bg-gradient-to-b from-secondary to-transparent" />
                        <h2 className="font-sans font-black text-xl text-on-surface uppercase tracking-wider">
                          {editingId
                            ? (t('portfolio.admin.edit_title') !== 'portfolio.admin.edit_title' ? t('portfolio.admin.edit_title') : 'Modifier le Projet')
                            : (t('portfolio.admin.create_title') !== 'portfolio.admin.create_title' ? t('portfolio.admin.create_title') : 'Créer un Nouveau Projet')}
                        </h2>
                      </div>
                      {editingId && (
                        <Button
                          variant="black"
                          onClick={handleCancelEdit}
                          className="!px-3 !py-1 text-[9px] self-start sm:self-auto"
                        >
                          <i className="fa-solid fa-xmark mr-1"></i>
                          {t('portfolio.admin.cancel_btn')}
                        </Button>
                      )}
                    </div>

                    {/* Status Alert Message System */}
                    <AnimatePresence>
                      {statusMsg.text && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.98 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className={`p-3.5 rounded-xl border text-xs font-sans font-semibold flex items-center justify-between gap-3 shadow-md ${statusMsg.type === 'success'
                            ? 'bg-secondary/10 border-secondary/30 text-secondary shadow-[0_0_15px_rgba(78,222,163,0.1)]'
                            : statusMsg.type === 'info'
                              ? 'bg-primary/10 border-primary/30 text-primary shadow-[0_0_15px_rgba(190,194,255,0.1)]'
                              : 'bg-red-950/40 border-red-800/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {statusMsg.type === 'success' && <i className="fa-solid fa-circle-check text-sm flex-shrink-0"></i>}
                            {statusMsg.type === 'info' && <i className="fa-solid fa-spinner animate-spin text-sm flex-shrink-0"></i>}
                            {statusMsg.type === 'error' && <i className="fa-solid fa-triangle-exclamation text-sm flex-shrink-0"></i>}
                            <span>{statusMsg.text}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStatusMsg({ text: '', type: '' })}
                            className="text-xs opacity-70 hover:opacity-100 cursor-pointer transition-opacity"
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Form Navigation Sub-tabs (SSOT style with animated line) */}
                    <div className="flex items-center gap-6 overflow-x-auto pb-2 border-b border-white/5">
                      {[
                        { id: 'general', label: '1. Général & Type' },
                        { id: 'media', label: '2. Médias & Slots' },
                        { id: 'content', label: '3. Textes FR / EN' }
                      ].map(tab => {
                        const isActive = formTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFormTab(tab.id)}
                            className={`text-xs font-sans uppercase tracking-wider pb-2 transition-all duration-200 relative cursor-pointer whitespace-nowrap focus:outline-none ${isActive
                              ? 'text-secondary font-black'
                              : 'text-on-surface-variant/60 font-semibold hover:text-on-surface'
                              }`}
                          >
                            <span>{tab.label}</span>
                            {isActive && (
                              <motion.div
                                layoutId="adminFormSubTabActiveLine"
                                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-secondary shadow-[0_0_10px_rgba(78,222,163,0.8)]"
                                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                      {/* TAB 1: GENERAL */}
                      {formTab === 'general' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Category Selector */}
                          <InputField
                            label={t('portfolio.admin.form.category')}
                            name="category"
                            type="select"
                            value={formData.category}
                            onChange={handleChange}
                          >
                            <option value="gaming">Vacuum Protocol (Gaming)</option>
                            <option value="website">Sites Web</option>
                            <option value="ai-agent">Agents IA</option>
                            <option value="mobile">Applications Mobiles</option>
                          </InputField>

                          {/* Date Selector */}
                          <InputField
                            label="Date de publication"
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                          />

                          {/* Devlog Type */}
                          <InputField
                            label="Type / Tag de sous-catégorie (ex: UI, Netcode, Shader, 3D)"
                            name="type"
                            type="text"
                            value={formData.type}
                            onChange={handleChange}
                            placeholder="UI, Netcode, Shader..."
                          />

                          {/* Importance */}
                          {formData.category === 'gaming' && (
                            <InputField
                              label="Importance du Devlog"
                              name="importance"
                              type="select"
                              value={formData.importance}
                              onChange={handleChange}
                            >
                              <option value="normal">Normal — standard</option>
                              <option value="minor">Minor — compact (fix / micro-feature)</option>
                              <option value="major">Major — grande mise à jour</option>
                            </InputField>
                          )}

                          {/* Tags */}
                          <div className="md:col-span-2">
                            <InputField
                              label={t('portfolio.admin.form.tags')}
                              name="tagsText"
                              type="text"
                              value={formData.tagsText}
                              onChange={handleChange}
                              placeholder="Steamworks, C#, Shaders, Unity UI (séparés par des virgules)"
                            />
                          </div>

                          {/* Gaming Options & Patch Note */}
                          {formData.category === 'gaming' && (
                            <div className="md:col-span-2 flex flex-col gap-3 mt-2 border-t border-white/5 pt-4">
                              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-on-surface-variant/70">
                                Options Générales & Patch Note
                              </span>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Discord Checkbox */}
                                <label htmlFor="postToDiscord" className="bg-surface-container-low/40 border border-white/5 hover:border-white/10 rounded-xl p-3.5 flex items-center gap-3 cursor-pointer transition-colors">
                                  <input
                                    type="checkbox"
                                    id="postToDiscord"
                                    checked={postToDiscord}
                                    onChange={(e) => setPostToDiscord(e.target.checked)}
                                    className="custom-checkbox flex-shrink-0"
                                  />
                                  <span className="text-xs font-sans font-medium text-on-surface select-none">
                                    Notification Discord (Webhook)
                                  </span>
                                </label>

                                {/* Patch Note Toggle Checkbox */}
                                <label htmlFor="hasChangelog" className="bg-surface-container-low/40 border border-white/5 hover:border-white/10 rounded-xl p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-colors">
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      id="hasChangelog"
                                      checked={formData.hasChangelog}
                                      onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        hasChangelog: e.target.checked,
                                        changelog: e.target.checked && (!prev.changelog || prev.changelog.length === 0)
                                          ? [{ type: 'fix', text: '' }]
                                          : prev.changelog
                                      }))}
                                      className="custom-checkbox flex-shrink-0"
                                    />
                                    <span className="text-xs font-sans font-medium text-on-surface select-none">
                                      Activer le Patch Note
                                    </span>
                                  </div>
                                </label>
                              </div>

                              {/* Expanded Patch Note Lines Manager */}
                              {formData.hasChangelog && (
                                <PatchNoteEditor
                                  hasChangelog={formData.hasChangelog}
                                  changelog={formData.changelog || []}
                                  onAddChangelogItem={handleAddChangelogItem}
                                  onUpdateChangelogItem={handleUpdateChangelogItem}
                                  onRemoveChangelogItem={handleRemoveChangelogItem}
                                  onMoveChangelogItemUp={handleMoveChangelogItemUp}
                                  onMoveChangelogItemDown={handleMoveChangelogItemDown}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 2: MEDIA SLOTS MANAGER */}
                      {formTab === 'media' && (
                        <MediaSlotEditor
                          slots={formData.slots || []}
                          onAddSlot={handleAddSlot}
                          onUpdateSlot={handleUpdateSlot}
                          onRemoveSlot={handleRemoveSlot}
                          onMoveSlotUp={handleMoveSlotUp}
                          onMoveSlotDown={handleMoveSlotDown}
                          onFileUpload={(e, idx) => {
                            const file = e.target.files?.[0];
                            if (file) handleSlotFileUpload(idx, file);
                          }}
                        />
                      )}

                      {/* TAB 3: CONTENT FR & EN (SSOT Language Toggle Switcher) */}
                      {formTab === 'content' && (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <span className="text-xs font-sans font-bold uppercase tracking-wider text-on-surface flex items-center gap-2">
                              <i className="fa-solid fa-language text-secondary"></i>
                              <span>Langue de Rédaction ({textLang.toUpperCase()})</span>
                            </span>

                            {/* SSOT Sliding Language Switcher Toggle */}
                            <div className="relative flex items-center p-1 bg-surface-container-low/50 rounded-xl border border-white/10 backdrop-blur-md select-none">
                              <motion.div
                                className="absolute inset-y-1 bg-secondary rounded-lg shadow-[0_0_15px_rgba(78,222,163,0.4)]"
                                animate={{
                                  x: textLang === 'fr' ? 0 : 36,
                                  width: 32
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                              />
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setTextLang('fr')}
                                  className={`relative z-10 w-8 h-7 flex items-center justify-center text-[10px] font-black transition-colors duration-200 cursor-pointer focus:outline-none ${textLang === 'fr' ? 'text-surface' : 'text-on-surface-variant hover:text-on-surface'
                                    }`}
                                >
                                  FR
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setTextLang('en')}
                                  className={`relative z-10 w-8 h-7 flex items-center justify-center text-[10px] font-black transition-colors duration-200 cursor-pointer focus:outline-none ${textLang === 'en' ? 'text-surface' : 'text-on-surface-variant hover:text-on-surface'
                                    }`}
                                >
                                  EN
                                </button>
                              </div>
                            </div>
                          </div>

                          <AnimatePresence mode="wait">
                            {textLang === 'fr' ? (
                              <motion.div
                                key="lang-fr"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-4"
                              >
                                <InputField
                                  label={t('portfolio.admin.form.title_fr')}
                                  name="titleFr"
                                  type="text"
                                  value={formData.titleFr}
                                  onChange={handleChange}
                                  placeholder="ex: Scène Menu, Lobby & Intégration Netcode"
                                  required
                                />
                                <InputField
                                  label={t('portfolio.admin.form.desc_fr')}
                                  name="descFr"
                                  type="textarea"
                                  value={formData.descFr}
                                  onChange={handleChange}
                                  rows={2}
                                  placeholder="Résumé rapide pour les cartes et aperçus..."
                                />
                                <InputField
                                  label={t('portfolio.admin.form.content_fr')}
                                  name="contentFr"
                                  type="textarea"
                                  value={formData.contentFr}
                                  onChange={handleChange}
                                  rows={5}
                                  placeholder="Description technique détaillée du devlog / projet..."
                                />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="lang-en"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col gap-4"
                              >
                                <InputField
                                  label={t('portfolio.admin.form.title_en')}
                                  name="titleEn"
                                  type="text"
                                  value={formData.titleEn}
                                  onChange={handleChange}
                                  placeholder="e.g. Menu Scene, Lobby & Netcode Integration (facultatif)"
                                />
                                <InputField
                                  label={t('portfolio.admin.form.desc_en')}
                                  name="descEn"
                                  type="textarea"
                                  value={formData.descEn}
                                  onChange={handleChange}
                                  rows={2}
                                  placeholder="English summary..."
                                />
                                <InputField
                                  label={t('portfolio.admin.form.content_en')}
                                  name="contentEn"
                                  type="textarea"
                                  value={formData.contentEn}
                                  onChange={handleChange}
                                  rows={5}
                                  placeholder="Detailed technical English description..."
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Submit & Step Navigation Bar */}
                      <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/5 flex-wrap">
                        <div className="flex items-center gap-2">
                          {formTab !== 'general' && (
                            <Button
                              variant="black"
                              type="button"
                              onClick={() => setFormTab(formTab === 'content' ? 'media' : 'general')}
                              className="!py-2 !px-3 text-xs"
                            >
                              <i className="fa-solid fa-arrow-left mr-1.5"></i>
                              Précédent
                            </Button>
                          )}
                          {formTab !== 'content' && (
                            <Button
                              variant="green-outline"
                              type="button"
                              onClick={() => setFormTab(formTab === 'general' ? 'media' : 'content')}
                              className="!py-2 !px-3 text-xs"
                            >
                              Suivant
                              <i className="fa-solid fa-arrow-right ml-1.5"></i>
                            </Button>
                          )}
                        </div>

                        <Button variant="green" type="submit" disabled={loading} className="w-full sm:w-auto">
                          <i className="fa-solid fa-floppy-disk text-xs mr-2"></i>
                          {editingId ? t('portfolio.admin.submit_edit') : t('portfolio.admin.submit_create')}
                        </Button>
                      </div>

                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Custom Modal (SSOT Cyber Glassmorphism) */}
      <AnimatePresence>
        {deletingPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface-container-low/95 backdrop-blur-xl border border-red-500/30 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)] flex flex-col gap-5 relative overflow-hidden"
            >
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-2xl bg-red-950/60 border border-red-800/50 flex items-center justify-center text-red-400 text-lg flex-shrink-0">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                  <h3 className="font-sans font-black text-base text-on-surface uppercase tracking-wider">
                    Supprimer ce Projet ?
                  </h3>
                  <p className="text-[10px] font-mono text-red-400">ACTION DÉFINITIVE & IRRÉVERSIBLE</p>
                </div>
              </div>

              <p className="text-xs font-sans text-on-surface-variant/90 leading-relaxed bg-black/30 border border-white/5 p-3.5 rounded-xl">
                Êtes-vous sûr de vouloir supprimer définitivement le projet <strong className="text-on-surface">"{deletingPost.title?.fr}"</strong> ?
              </p>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                <Button variant="black" type="button" onClick={() => setDeletingPost(null)}>
                  Annuler
                </Button>
                <Button variant="red" type="button" onClick={confirmDelete}>
                  <i className="fa-solid fa-trash-can mr-1.5 text-xs"></i>
                  Supprimer définitivement
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
