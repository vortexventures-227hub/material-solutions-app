import React, { useState, useEffect } from 'react';
import { X, Globe, Video, Check, ChevronRight, Share2, Eye } from 'lucide-react';
import api from '../api';
import PublishProgress from './PublishProgress';
import PublishResults from './PublishResults';

const PLATFORMS = [
  {
    id: 'craigslist',
    name: 'Craigslist',
    icon: '🏙️',
    description: 'Local buyers, fast exposure',
    color: '#F97316',
    recommended: false,
  },
  {
    id: 'facebook_marketplace',
    name: 'Facebook Marketplace',
    icon: <Share2 size={24} className="text-blue-600" />,
    description: 'Wide local reach',
    color: '#1877F2',
    recommended: true,
  },
  {
    id: 'machinerytrader',
    name: 'Machinery Trader',
    icon: '🏗️',
    description: 'Equipment-focused buyers',
    color: '#1A5F7A',
    recommended: false,
  },
  {
    id: 'equipfinder',
    name: 'EquipFinder',
    icon: '🔍',
    description: 'Heavy equipment marketplace',
    color: '#7C3AED',
    recommended: false,
  },
  {
    id: 'machineryats',
    name: 'MachineryATS',
    icon: '🏭',
    description: 'Industrial equipment buyers',
    color: '#059669',
    recommended: false,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: <Video size={24} className="text-red-600" />,
    description: 'Video walkaround listing',
    color: '#FF0000',
    recommended: false,
  },
];

export default function PublishModal({ isOpen, onClose, inventory, onPublished }) {
  const [step, setStep] = useState('select'); // select, progress, results
  const [selected, setSelected] = useState(new Set(['facebook_marketplace', 'craigslist']));
  const [options] = useState({});
  const [publishResults, setPublishResults] = useState(null);
  const [progress, setProgress] = useState({});
  const [emailStats, setEmailStats] = useState({ sent: 0, queued: 0 });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setPublishResults(null);
      setProgress({});
      setEmailStats({ sent: 0, queued: 0 });
    }
  }, [isOpen]);

  if (!isOpen || !inventory) return null;

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePublish = async () => {
    if (selected.size === 0) return;
    
    setStep('progress');
    const platforms = Array.from(selected);
    
    // Initialize progress
    const initialProgress = {};
    platforms.forEach(p => initialProgress[p] = { status: 'working' });
    setProgress(initialProgress);

    try {
      // Phase 6C API Call
      const res = await api.post(`/api/publish/${inventory.id}`, {
        platforms,
        options
      });

      // Update progress with results
      const newProgress = { ...initialProgress };
      res.data.results.forEach(r => {
        newProgress[r.platform] = { 
          status: r.status === 'published' ? 'complete' : 'error',
          error: r.error 
        };
      });
      setProgress(newProgress);
      setPublishResults(res.data);

      // Trigger email outreach if requested (mock logic)
      if (platforms.length > 0) {
        setEmailStats({ sent: Math.min(platforms.length * 3, 12), queued: 0 });
      }

      // Short delay for the "working" feel before showing results
      setTimeout(() => {
        setStep('results');
        if (onPublished) onPublished(res.data);
      }, 1500);

    } catch (err) {
      console.error('Publishing failed:', err);
      // Fallback: show error in progress
      const errorProgress = { ...initialProgress };
      platforms.forEach(p => errorProgress[p] = { status: 'error', error: err.message });
      setProgress(errorProgress);
      setTimeout(() => setStep('results'), 1000);
    }
  };

  // ─── Renderers ─────────────────────────────────────────────────────────────

  if (step === 'progress') {
    return (
      <PublishProgress 
        platforms={Array.from(selected)} 
        progress={progress}
        emailsSent={emailStats.sent}
        emailsQueued={emailStats.queued}
      />
    );
  }

  if (step === 'results') {
    return (
      <PublishResults 
        results={publishResults} 
        unit={inventory} 
        seoData={publishResults?.seo}
        onClose={onClose} 
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[55] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-vortex-dark w-full sm:max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] border-2 border-vortex-yellow/30 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-vortex-yellow/20 shrink-0 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl text-vortex-yellow tracking-widest uppercase">Publish Listing</h2>
            <p className="text-gray-400 text-sm mt-0.5">{inventory.year} {inventory.make} {inventory.model}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-vortex-gray border border-vortex-yellow/30 flex items-center justify-center text-gray-400 hover:text-vortex-yellow hover:border-vortex-yellow transition-all active:scale-95"
            aria-label="Close publish modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Platform List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <p className="text-xs font-display text-gray-500 uppercase tracking-widest mb-2">Select Channels</p>

          {PLATFORMS.map((platform) => {
            const isSelected = selected.has(platform.id);
            return (
              <button
                key={platform.id}
                onClick={() => toggle(platform.id)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${isSelected
                    ? 'border-vortex-yellow bg-vortex-yellow/10'
                    : 'border-vortex-gray bg-vortex-black/50 hover:border-vortex-yellow/40'
                  }
                `}
              >
                {/* Check circle */}
                <div className={`
                  w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                  ${isSelected
                    ? 'border-vortex-yellow bg-vortex-yellow'
                    : 'border-gray-600'
                  }
                `}>
                  {isSelected && <Check size={14} className="text-vortex-black" />}
                </div>

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: platform.color + '20' }}>
                  {typeof platform.icon === 'string'
                    ? <span className="text-2xl">{platform.icon}</span>
                    : platform.icon
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-white text-base tracking-wide">{platform.name}</p>
                    {platform.recommended && (
                      <span className="text-[10px] font-display bg-vortex-yellow/20 text-vortex-yellow border border-vortex-yellow/30 px-1.5 py-0.5 rounded-full">RECOMMENDED</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5">{platform.description}</p>
                </div>

                <ChevronRight size={16} className={`shrink-0 transition-transform ${isSelected ? 'text-vortex-yellow translate-x-0' : 'text-gray-600'}`} />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-vortex-yellow/20 space-y-3 shrink-0">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-400 font-display">
              {selected.size} platform{selected.size !== 1 ? 's' : ''} selected
            </span>
            <span className="text-vortex-yellow font-display flex items-center gap-1.5">
              <Eye size={14} /> Est. {selected.size > 0 ? `${(selected.size * 2).toLocaleString()}+ views` : '—'}
            </span>
          </div>

          <button
            onClick={handlePublish}
            disabled={selected.size === 0}
            className={`
              w-full flex items-center justify-center gap-3 py-4 rounded-xl font-display text-lg tracking-widest
              transition-all duration-200 border-2
              ${selected.size === 0
                ? 'bg-vortex-gray border-vortex-gray text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-vortex-yellow to-amber-400 border-vortex-yellow-dark text-vortex-black hover:from-amber-300 hover:to-vortex-yellow shadow-[0_4px_14px_rgba(253,224,71,0.4)] hover:shadow-[0_6px_20px_rgba(253,224,71,0.55)] hover:-translate-y-0.5 active:scale-[0.98]'
              }
            `}
          >
            <Globe size={20} />
            PUBLISH NOW
          </button>

          <p className="text-center text-gray-500 text-[10px] uppercase tracking-[0.1em]">
             AI will generate platform-specific SEO content automatically
          </p>
        </div>
      </div>
    </div>
  );
}
