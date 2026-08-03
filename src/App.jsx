import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InteractiveGrid from './components/InteractiveGrid';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import MentionsLegales from './pages/MentionsLegales';
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';
import PortfolioSection from './pages/PortfolioSection';
import PortfolioAdmin from './pages/PortfolioAdmin';
import GamingDevlog from './pages/GamingDevlog';


/**
 * ScrollToAnchor component handles scrolling smoothly to anchors when URL changes.
 */
function ScrollToAnchor() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return null;
}

/**
 * ExternalRedirect component for instant client-side redirection
 */
function ExternalRedirect({ url }) {
  useEffect(() => {
    window.location.href = url;
  }, [url]);
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-on-surface-variant font-mono text-xs">
      <p className="animate-pulse">Redirection vers {url}...</p>
    </div>
  );
}

import { ImageLightboxProvider } from './context/ImageLightboxContext';
import { AdminProvider } from './context/AdminContext';
import AdminLoginModal from './components/admin/AdminLoginModal';
import AdminPostEditModal from './components/admin/AdminPostEditModal';
import AdminBannerEditModal from './components/admin/AdminBannerEditModal';
import AdminConfirmModal from './components/admin/AdminConfirmModal';

function App() {
  return (
    <ImageLightboxProvider>
      <AdminProvider>
        <Router>
          <ScrollToAnchor />
          <div className="relative min-h-screen flex flex-col bg-surface text-on-surface selection:bg-primary/30 selection:text-primary">
            {/* Interactive Background Grid */}
            <InteractiveGrid />

            {/* Global Responsive Navigation Bar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-grow pt-24 pb-12 flex flex-col justify-center relative z-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/portfolio/section/gaming" element={<GamingDevlog />} />
                <Route path="/portfolio/section/:category" element={<PortfolioSection />} />
                <Route path="/portfolio/admin" element={<PortfolioAdmin />} />
                <Route path="/game" element={<Navigate to="/portfolio/section/gaming" replace />} />
                <Route path="/dkp" element={<ExternalRedirect url="https://dkp95.fr" />} />
                <Route path="/dkp95" element={<ExternalRedirect url="https://dkp95.fr" />} />
                <Route path="/dkprenovation" element={<ExternalRedirect url="https://dkp95.fr" />} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialite />} />
              </Routes>
            </main>

            {/* Global Minimal Footer */}
            <Footer />

            {/* In-Context Admin Modals */}
            <AdminLoginModal />
            <AdminPostEditModal />
            <AdminBannerEditModal />
            <AdminConfirmModal />
          </div>
        </Router>
      </AdminProvider>
    </ImageLightboxProvider>
  );
}


export default App;

