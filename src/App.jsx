import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InteractiveGrid from './components/InteractiveGrid';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import MentionsLegales from './pages/MentionsLegales';
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite';
import PortfolioSection from './pages/PortfolioSection';
import GamingDevlog from './pages/GamingDevlog';
import NotFound from './pages/NotFound';
import { Services, Service } from './pages/Services';
import Contact from './pages/Contact';
import Seo from './components/Seo';
import { SiteContentContext } from './context/SiteContentContext';
import { AnimatePresence } from 'framer-motion';
import { ImageLightboxProvider } from './context/ImageLightboxContext';
import { AdminProvider } from './context/AdminContext';
import AdminModals from './components/admin/AdminModals';

const PortfolioAdmin = lazy(() => import('./pages/PortfolioAdmin'));
const AdminPromo = lazy(() => import('./pages/AdminPromo'));
const OfferPage = lazy(() => import('./pages/OfferPage'));
const CodePage = lazy(() => import('./pages/CodePage'));
// Lien de l'offre de lancement : /b-ledger/offre (QR codes imprimés) en reste l'alias.
const LAUNCH_SLUG = 'lancement-b-ledger';


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

function App({ RouterComponent = Router, routerProps = {}, initialContent = {} }) {
  return (
    <SiteContentContext.Provider value={initialContent}>
      <ImageLightboxProvider>
        <AdminProvider>
          <RouterComponent {...routerProps}>
            <Seo />
            <ScrollToAnchor />
            <AnimatePresence initial={false}>
          <div className="relative min-h-screen flex flex-col bg-surface text-on-surface selection:bg-primary/30 selection:text-primary">
            {/* Interactive Background Grid */}
            <InteractiveGrid />

            {/* Global Responsive Navigation Bar */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-grow pt-24 pb-12 flex flex-col justify-center relative z-10">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:slug" element={<Service />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/portfolio/section/gaming" element={<GamingDevlog />} />
                {['website', 'mobile', 'ai-agent'].map(category => <Route key={category} path={`/portfolio/section/${category}`} element={<PortfolioSection key={category} category={category} />} />)}
                <Route path="/b-ledger/offre" element={<Suspense fallback={<p className="text-center">Chargement…</p>}><OfferPage slug={LAUNCH_SLUG} /></Suspense>} />
                <Route path="/offre/:slug" element={<Suspense fallback={<p className="text-center">Chargement…</p>}><OfferPage /></Suspense>} />
                <Route path="/code/:code" element={<Suspense fallback={<p className="text-center">Chargement…</p>}><CodePage /></Suspense>} />
                <Route path="/portfolio/admin" element={<Suspense fallback={<p className="text-center">Administration…</p>}><PortfolioAdmin /></Suspense>} />
                <Route path="/portfolio/admin/promo" element={<Suspense fallback={<p className="text-center">Administration…</p>}><AdminPromo /></Suspense>} />
                <Route path="/game" element={<Navigate to="/portfolio/section/gaming" replace />} />
                <Route path="/dkp" element={<ExternalRedirect url="https://dkp95.fr" />} />
                <Route path="/dkp95" element={<ExternalRedirect url="https://dkp95.fr" />} />
                <Route path="/dkprenovation" element={<ExternalRedirect url="https://dkp95.fr" />} />
                <Route path="/mentions-legales" element={<MentionsLegales />} />
                <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialite />} />
                <Route path="/devlog" element={<Navigate to="/portfolio/section/gaming" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            {/* Global Minimal Footer */}
            <Footer />

            {/* In-Context Admin Modals */}
            <AdminModals />
          </div>
            </AnimatePresence>
          </RouterComponent>
        </AdminProvider>
      </ImageLightboxProvider>
    </SiteContentContext.Provider>
  );
}



export default App;

