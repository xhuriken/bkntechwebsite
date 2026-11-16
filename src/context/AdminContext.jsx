import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // Post Edit/Create Modal State
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null); // null = Create Mode, object = Edit Mode
  const [defaultCategory, setDefaultCategory] = useState('gaming');

  // Banner Edit Modal State
  const [bannerModalType, setBannerModalType] = useState(null); // 'featured' | 'devlog' | null

  // Custom BKN Confirm Modal State
  const [confirmModalState, setConfirmModalState] = useState(null); // { title, message, onConfirm } | null

  // Trigger to notify components to refresh their data (posts & settings)
  const [dataRefreshCounter, setDataRefreshCounter] = useState(0);

  const triggerRefresh = () => {
    setDataRefreshCounter(prev => prev + 1);
  };

  // Lock body scroll whenever ANY modal is active
  useEffect(() => {
    const isAnyModalActive = isLoginModalOpen || isPostModalOpen || !!bannerModalType || !!confirmModalState;
    if (isAnyModalActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoginModalOpen, isPostModalOpen, bannerModalType, confirmModalState]);

  // Session admin : un cookie HttpOnly posé par l'API (illisible ici, c'est voulu).
  // Au chargement, on demande seulement au serveur « suis-je connecté ? ».
  useEffect(() => {
    localStorage.removeItem('bkn_admin_pass'); // nettoie l'ancien mot de passe stocké en clair
    fetch('/api/admin/session', { credentials: 'same-origin' })
      .then((res) => (res.ok ? res.json() : { admin: false }))
      .then((data) => setIsAdmin(data.admin === true))
      .catch(() => setIsAdmin(false));
  }, []);

  /** Renvoie { ok: true } ou { ok: false, error } (message de l'API : mot de passe, trop d'essais...). */
  const login = async (pass, trap = '') => {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass, website: trap }), // website : champ piège anti-robots
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { ok: false, error: data.error || 'Connexion impossible.' };
      setIsAdmin(true);
      setIsLoginModalOpen(false);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Serveur injoignable.' };
    }
  };

  const logout = async () => {
    setIsAdmin(false);
    setIsPostModalOpen(false);
    setBannerModalType(null);
    setConfirmModalState(null);
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
  };

  // Quick action helpers
  const openCreatePost = (category = 'gaming') => {
    setEditingPost(null);
    setDefaultCategory(category);
    setIsPostModalOpen(true);
  };

  const openEditPost = (post) => {
    setEditingPost(post);
    setIsPostModalOpen(true);
  };

  const closePostModal = () => {
    setIsPostModalOpen(false);
    setEditingPost(null);
  };

  const openBannerModal = (type = 'featured') => {
    setBannerModalType(type);
  };

  const closeBannerModal = () => {
    setBannerModalType(null);
  };

  const openConfirmModal = ({ title, message, onConfirm }) => {
    setConfirmModalState({ title, message, onConfirm });
  };

  const closeConfirmModal = () => {
    setConfirmModalState(null);
  };

  return (
    <AdminContext.Provider value={{
      isAdmin,
      isLoginModalOpen,
      setIsLoginModalOpen,
      isPostModalOpen,
      editingPost,
      defaultCategory,
      bannerModalType,
      confirmModalState,
      dataRefreshCounter,
      triggerRefresh,
      login,
      logout,
      openCreatePost,
      openEditPost,
      closePostModal,
      openBannerModal,
      closeBannerModal,
      openConfirmModal,
      closeConfirmModal
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
