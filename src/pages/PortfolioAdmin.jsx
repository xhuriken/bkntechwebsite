import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * PortfolioAdmin Page Component
 * Allows authenticated administrators to add, edit, or delete projects
 * and export the active posts.json database.
 */
export default function PortfolioAdmin() {
  const { t } = useTranslation();
  const [password, setPassword] = useState(localStorage.getItem('bkn_admin_pass') || '');
  const [isAuth, setIsAuth] = useState(false);
  const [authError, setAuthError] = useState('');

  // API loading states
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [postToDiscord, setPostToDiscord] = useState(true);
  const [formData, setFormData] = useState({
    category: 'gaming',
    type: '',
    date: new Date().toISOString().split('T')[0],
    mediaType: 'image',
    mediaUrl: '',
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
    // Test auth by attempting a fetch with password header
    fetch('/api/posts', {
      headers: { 'x-admin-password': pass }
    })
      .then(async res => {
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
          setIsAuth(true);
          localStorage.setItem('bkn_admin_pass', pass);
        } else {
          setAuthError(t('portfolio.admin.password_placeholder'));
          setIsAuth(false);
          localStorage.removeItem('bkn_admin_pass');
        }
        setLoading(false);
      })
      .catch(() => {
        setAuthError("Erreur serveur lors de l'authentification.");
        setLoading(false);
      });
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

  const handleEditSelect = (post) => {
    setEditingId(post.id);
    setFormData({
      category: post.category,
      type: post.type || '',
      date: post.date,
      mediaType: post.mediaType || 'image',
      mediaUrl: post.mediaUrl || '',
      tagsText: post.tags ? post.tags.join(', ') : '',
      titleFr: post.title.fr,
      titleEn: post.title.en,
      descFr: post.description.fr,
      descEn: post.description.en,
      contentFr: post.content.fr,
      contentEn: post.content.en,
      commentsCount: post.commentsCount !== undefined ? String(post.commentsCount) : '0'
    });
    // Scroll smoothly to form
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
      date: new Date().toISOString().split('T')[0],
      mediaType: 'image',
      mediaUrl: '',
      tagsText: '',
      titleFr: '',
      titleEn: '',
      descFr: '',
      descEn: '',
      contentFr: '',
      contentEn: '',
      commentsCount: '0'
    });
    setPostToDiscord(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ text: '', type: '' });

    const payload = {
      id: editingId, // Will create new if null, or edit if matches existing ID
      category: formData.category,
      type: formData.type || (formData.category === 'gaming' ? 'General' : ''),
      date: formData.date,
      mediaType: formData.mediaType,
      mediaUrl: formData.mediaUrl,
      tags: formData.tagsText.split(',').map(tag => tag.trim()).filter(Boolean),
      title: {
        fr: formData.titleFr,
        en: formData.titleEn
      },
      description: {
        fr: formData.descFr,
        en: formData.descEn
      },
      content: {
        fr: formData.contentFr,
        en: formData.contentEn
      },
      commentsCount: parseInt(formData.commentsCount || '0', 10),
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
          setStatusMsg({ text: t('portfolio.admin.success_save'), type: 'success' });
          setEditingId(null);
          resetForm();
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

  const handleDelete = (id) => {
    if (!window.confirm(t('portfolio.admin.confirm_delete'))) return;
    setLoading(true);
    setStatusMsg({ text: '', type: '' });

    fetch('/api/posts', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': password
      },
      body: JSON.stringify({ id })
    })
      .then(async res => {
        if (res.ok) {
          const updatedPosts = await res.json();
          setPosts(updatedPosts);
          setStatusMsg({ text: t('portfolio.admin.success_delete'), type: 'success' });
          if (editingId === id) {
            setEditingId(null);
            resetForm();
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

  return (
    <div className="w-full max-w-5xl mx-auto px-6 md:px-12 py-10 z-10 relative">
      {/* Return link */}
      <div className="mb-8">
        <Link 
          to="/portfolio" 
          className="inline-flex items-center gap-2 text-xs font-sans font-semibold uppercase tracking-wider text-on-surface hover:text-primary transition-colors group"
        >
          <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('portfolio.back')}
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-white/5 pb-6 mb-12">
        <h1 className="font-sans font-extrabold text-3xl md:text-5xl uppercase tracking-tight mb-3">
          {t('portfolio.admin.title')}
        </h1>
        <p className="text-on-surface/80 text-sm font-normal tracking-wide">
          Ajoutez, modifiez ou supprimez les projets affichés dans le portfolio bilingue.
        </p>
      </div>

      {/* Login Section */}
      {!isAuth ? (
        <div className="max-w-md mx-auto bg-surface-container-low/45 backdrop-blur-md border border-white/5 rounded-2xl p-8 shadow-xl">
          <h2 className="font-sans font-bold text-lg uppercase tracking-wider text-primary mb-6 text-center">
            {t('portfolio.admin.login_title')}
          </h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
                {t('portfolio.admin.form.title_fr')}
              </label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface border border-white/10 rounded-xl px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary/50 transition-colors"
                required
              />
            </div>
            {authError && (
              <p className="text-xs text-red-400 font-sans font-semibold text-center">{authError}</p>
            )}
            <button 
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-primary hover:bg-primary/90 text-black font-sans font-bold text-xs uppercase tracking-wider py-3 rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? t('portfolio.admin.form.content_fr') + '...' : t('portfolio.admin.login_btn')}
            </button>
          </form>
        </div>
      ) : (
        /* Authed Dashboard Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Projects List Panel (Left) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h2 className="font-sans font-bold text-md uppercase tracking-wider text-primary">
                Projets Actuels ({posts.length})
              </h2>
              <button 
                onClick={handleExport}
                className="text-[10px] font-sans font-bold uppercase tracking-wider text-secondary border border-secondary/20 hover:border-secondary/50 rounded-lg px-2.5 py-1.5 transition-colors cursor-pointer"
              >
                {t('portfolio.admin.export_btn')}
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin">
              {posts.map(post => (
                <div 
                  key={post.id}
                  className={`p-4 rounded-xl border transition-colors flex justify-between items-center bg-surface-container-low/30 backdrop-blur-sm ${
                    editingId === post.id ? 'border-primary/40 bg-primary/5' : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex flex-col gap-1 pr-4">
                    <span className="text-[9px] font-sans font-bold uppercase tracking-wider text-primary">
                      {post.category}
                    </span>
                    <h3 className="font-sans font-bold text-xs text-on-surface line-clamp-1">
                      {post.title.fr}
                    </h3>
                    <span className="text-[9px] font-sans text-on-surface-variant/60">{post.date}</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button 
                      onClick={() => handleEditSelect(post)}
                      className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-1 bg-surface hover:bg-white/5 rounded border border-white/5 text-on-surface transition-colors cursor-pointer"
                    >
                      {t('portfolio.admin.edit_btn')}
                    </button>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-1 bg-red-950/20 hover:bg-red-950/40 rounded border border-red-900/30 text-red-400 transition-colors cursor-pointer"
                    >
                      {t('portfolio.admin.delete_btn')}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleLogout}
              className="mt-4 text-center text-xs font-sans font-semibold text-on-surface-variant/60 hover:text-red-400 transition-colors uppercase tracking-wider"
            >
              {t('portfolio.admin.logout_btn')}
            </button>
          </div>

          {/* Edit Form Panel (Right) */}
          <div id="edit-form-anchor" className="lg:col-span-7 bg-surface-container-low/45 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl">
            <div className="border-b border-white/5 pb-3 flex justify-between items-center">
              <h2 className="font-sans font-bold text-md uppercase tracking-wider text-primary">
                {editingId ? "Modifier le Projet" : "Ajouter un Projet"}
              </h2>
              {editingId && (
                <button 
                  onClick={handleCancelEdit}
                  className="text-[10px] font-sans font-bold uppercase tracking-wider text-on-surface-variant/60 hover:text-on-surface transition-colors"
                >
                  {t('portfolio.admin.cancel_btn')}
                </button>
              )}
            </div>

            {statusMsg.text && (
              <div className={`p-3 rounded-xl border text-xs font-sans font-semibold ${
                statusMsg.type === 'success' 
                  ? 'bg-green-950/20 border-green-900/30 text-green-400' 
                  : 'bg-red-950/20 border-red-900/30 text-red-400'
              }`}>
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Category */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
                  {t('portfolio.admin.form.category')}
                </label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer"
                >
                  <option value="gaming">Gaming</option>
                  <option value="website">Sites Web</option>
                  <option value="ai-agent">Agents IA</option>
                  <option value="mobile">Applications Mobiles</option>
                </select>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
                  Date
                </label>
                <input 
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                  required
                />
              </div>

              {/* Media Type */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
                  {t('portfolio.admin.form.media_type')}
                </label>
                <select 
                  name="mediaType"
                  value={formData.mediaType}
                  onChange={handleChange}
                  className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50 cursor-pointer"
                >
                  <option value="image">Image (Unsplash, URL direct...)</option>
                  <option value="video">Vidéo (YouTube URL)</option>
                </select>
              </div>

              {/* Media URL */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
                  URL du Média
                </label>
                <input 
                  type="url"
                  name="mediaUrl"
                  value={formData.mediaUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                  required
                />
              </div>

              {/* Devlog Type (Gaming category specific) */}
              {formData.category === 'gaming' && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
                    Type de Devlog (ex: UI, Multiplayer, Core, 3D modeling)
                  </label>
                  <input 
                    type="text"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    placeholder="UI, Multiplayer, etc."
                    className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                    required={formData.category === 'gaming'}
                  />
                </div>
              )}

              {/* Comments Count Simulation */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
                  Nombre de Commentaires
                </label>
                <input 
                  type="number"
                  name="commentsCount"
                  value={formData.commentsCount}
                  onChange={handleChange}
                  min="0"
                  className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                  required
                />
              </div>

              {/* Discord Webhook Option (Gaming specific) */}
              {formData.category === 'gaming' && (
                <div className="md:col-span-2 flex items-center gap-2 py-1">
                  <input 
                    type="checkbox"
                    id="postToDiscord"
                    checked={postToDiscord}
                    onChange={(e) => setPostToDiscord(e.target.checked)}
                    className="rounded border-white/10 text-primary focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="postToDiscord" className="text-xs font-sans text-on-surface-variant cursor-pointer select-none">
                    Publier une notification sur Discord (Webhook)
                  </label>
                </div>
              )}

              {/* Tags */}
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
                  {t('portfolio.admin.form.tags')}
                </label>
                <input 
                  type="text"
                  name="tagsText"
                  value={formData.tagsText}
                  onChange={handleChange}
                  placeholder="React, Unity, Web3, iOS"
                  className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Title FR */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
                  {t('portfolio.admin.form.title_fr')}
                </label>
                <input 
                  type="text"
                  name="titleFr"
                  value={formData.titleFr}
                  onChange={handleChange}
                  className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                  required
                />
              </div>

              {/* Title EN */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
                  {t('portfolio.admin.form.title_en')}
                </label>
                <input 
                  type="text"
                  name="titleEn"
                  value={formData.titleEn}
                  onChange={handleChange}
                  className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                  required
                />
              </div>

              {/* Resumé FR */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
                  {t('portfolio.admin.form.desc_fr')}
                </label>
                <textarea 
                  name="descFr"
                  value={formData.descFr}
                  onChange={handleChange}
                  rows={2}
                  className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50 resize-none"
                  required
                />
              </div>

              {/* Resumé EN */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
                  {t('portfolio.admin.form.desc_en')}
                </label>
                <textarea 
                  name="descEn"
                  value={formData.descEn}
                  onChange={handleChange}
                  rows={2}
                  className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50 resize-none"
                  required
                />
              </div>

              {/* Content FR */}
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
                  {t('portfolio.admin.form.content_fr')}
                </label>
                <textarea 
                  name="contentFr"
                  value={formData.contentFr}
                  onChange={handleChange}
                  rows={5}
                  className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                  required
                />
              </div>

              {/* Content EN */}
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-[10px] font-sans font-semibold uppercase tracking-wider text-on-surface-variant/80">
                  {t('portfolio.admin.form.content_en')}
                </label>
                <textarea 
                  name="contentEn"
                  value={formData.contentEn}
                  onChange={handleChange}
                  rows={5}
                  className="bg-surface border border-white/10 rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary/50"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 mt-2">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-black font-sans font-bold text-xs uppercase tracking-wider py-3 rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {loading ? "Traitement..." : t('portfolio.admin.save_btn')}
                </button>
              </div>

            </form>
          </div>

        </div>
      )}
    </div>
  );
}
