import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-16 flex flex-col items-center text-center z-10 relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl border border-white/10 bg-surface-container-low/60 backdrop-blur-xl p-8 md:p-12 shadow-2xl flex flex-col items-center max-w-lg w-full"
      >
        {/* Terminal Header */}
        <div className="w-full flex items-center justify-between pb-4 mb-6 border-b border-white/5 font-mono text-[10px] text-red-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
          </div>
          <span className="tracking-widest uppercase">ERROR_404_PAGE_NOT_FOUND</span>
        </div>

        {/* Media */}
        <img
          src="/notfound.gif"
          alt="404 Not Found"
          className="w-48 h-48 object-contain rounded-xl mb-6 opacity-90"
        />

        <h1 className="font-display font-black text-4xl md:text-5xl text-primary mb-2 tracking-wider">
          404
        </h1>

        <p className="font-mono text-sm text-on-surface-variant mb-8 max-w-sm">
          Cette coordonnée réseau n'existe pas ou a été déplacée.
        </p>

        <Link to="/">
          <Button variant="primary">
            <i className="fa-solid fa-house text-xs mr-2" />
            Retour à l'accueil
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
