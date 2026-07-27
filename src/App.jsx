import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import InteractiveGrid from './components/InteractiveGrid';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Game from './pages/Game';

/**
 * Main Application Component
 * Sets up global styling structure, background grid, routing, header, and footer.
 */
function App() {
  return (
    <Router>
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
            <Route path="/game" element={<Game />} />
          </Routes>
        </main>

        {/* Global Minimal Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
