import { lazy, Suspense } from 'react';
import { useAdmin } from '../../context/AdminContext';

const Login = lazy(() => import('./AdminLoginModal'));
const Project = lazy(() => import('./AdminProjectEditModal'));
const Devlog = lazy(() => import('./AdminDevlogEditModal'));
const Banner = lazy(() => import('./AdminBannerEditModal'));
const Confirm = lazy(() => import('./AdminConfirmModal'));

// Visitors do not download the editing interface until it is requested.
export default function AdminModals() {
  const { isLoginModalOpen, isPostModalOpen, editingPost, defaultCategory, bannerModalType, confirmModalState } = useAdmin();
  const category = editingPost?.category || defaultCategory;
  return <Suspense fallback={null}>
    {isLoginModalOpen && <Login />}
    {isPostModalOpen && (category === 'gaming' ? <Devlog /> : <Project />)}
    {bannerModalType && <Banner />}
    {confirmModalState && <Confirm />}
  </Suspense>;
}
