import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem('bkn_admin_pass') || '');
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

  // Verify auth on mount if password exists in localStorage
  useEffect(() => {
    if (adminPassword) {
      verifyPassword(adminPassword);
    }
  }, []);

  const verifyPassword = async (pass) => {
    if (!pass) return false;
    try {
      const res = await fetch('/api/posts?verify=true', {
        headers: {
          'x-admin-password': pass
        }
      });
      if (res.ok) {
        setIsAdmin(true);
        setAdminPassword(pass);
        localStorage.setItem('bkn_admin_pass', pass);
        return true;
      } else {
        setIsAdmin(false);
        setAdminPassword('');
        localStorage.removeItem('bkn_admin_pass');
        return false;
      }
    } catch (err) {
      console.error('Admin Auth Check Failed:', err);
      setIsAdmin(false);
      return false;
    }
  };


  const login = async (pass) => {
    const success = await verifyPassword(pass);
    if (success) {
      setIsLoginModalOpen(false);
    }
    return success;
  };

  const logout = () => {
    setIsAdmin(false);
    setAdminPassword('');
    localStorage.removeItem('bkn_admin_pass');
    setIsPostModalOpen(false);
    setBannerModalType(null);
    setConfirmModalState(null);
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
      adminPassword,
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
