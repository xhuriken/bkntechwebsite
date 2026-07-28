import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InteractiveGrid from './components/InteractiveGrid';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Game from './pages/Game';
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
      const element = document.getElementById(id);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return () => clearTimeout(timer);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return null;
}

/**
 * Main Application Component
 * Sets up global styling structure, background grid, routing, header, and footer.
 */
function App() {
  return (
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
            <Route path="/game" element={<Game />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="/politique-de-confidentialite" element={<PolitiqueConfidentialite />} />
          </Routes>
        </main>

        {/* Global Minimal Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
