import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';

/**
 * PublishButton — shown on InventoryDetailModal
 * Triggers PublishModal
 */
export default function PublishButton({ unit, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center gap-2 px-5 py-3
        bg-gradient-to-r from-vortex-yellow to-amber-400
        text-vortex-black font-display text-base tracking-widest
        rounded-xl shadow-[0_4px_14px_rgba(253,224,71,0.4)]
        hover:shadow-[0_6px_20px_rgba(253,224,71,0.55)]
        hover:-translate-y-0.5 active:scale-95
        transition-all duration-200 border-2 border-vortex-yellow-dark
        ${className}
      `}
    >
      <Globe size={18} />
      <span>PUBLISH LISTING</span>
      <ExternalLink size={14} className="opacity-60" />
    </button>
  );
}
