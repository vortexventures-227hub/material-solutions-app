import React from 'react';
import { ExternalLink, Check, AlertTriangle, Mail, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

/**
 * PublishResults — shown after publish completes
 * Shows platform links, email stats, SEO summary
 */
export default function PublishResults({ results, unit, seoData, onClose }) {
  const total = results?.results?.length || 0;
  const succeeded = results?.results?.filter(r => r.status === 'published').length || 0;
  const failed = results?.results?.filter(r => r.status === 'error').length || 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-vortex-dark w-full sm:max-w-2xl max-h-[90vh] rounded-t-3xl sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] border-2 border-vortex-yellow/30 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-vortex-yellow/20 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 border-2 border-green-500 flex items-center justify-center">
                <Check size={24} className="text-green-400" />
              </div>
              <div>
                <h2 className="font-display text-2xl text-vortex-yellow tracking-widest uppercase">Distribution Complete</h2>
                <p className="text-gray-400 text-xs mt-0.5">{unit.year} {unit.make} {unit.model}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl text-vortex-yellow leading-none">{succeeded}/{total}</p>
              <p className="text-[10px] text-gray-500 font-display uppercase tracking-widest mt-1">Published</p>
            </div>
          </div>

          {failed > 0 && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{failed} channel{failed > 1 ? 's' : ''} encountered errors. Details listed below.</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Platform Links */}
          <section>
            <h3 className="font-display text-xs text-gray-500 uppercase tracking-[0.2em] mb-4">Marketplace Channels</h3>
            <div className="grid grid-cols-1 gap-2">
              {results?.results?.map((result, i) => (
                <div 
                  key={i}
                  className={`
                    flex items-center justify-between p-4 rounded-xl border-2 transition-all
                    ${result.status === 'published' 
                      ? 'border-green-500/20 bg-vortex-black/40 hover:border-green-500/40' 
                      : 'border-red-500/20 bg-red-500/5'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      result.status === 'published' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {result.status === 'published' ? <Check size={16} /> : <AlertTriangle size={14} />}
                    </div>
                    <div>
                      <p className="font-display text-white text-sm tracking-wide capitalize">{result.platform?.replace('_', ' ')}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${result.status === 'published' ? 'text-green-500/80' : 'text-red-500'}`}>
                        {result.status === 'published' ? 'Live Now' : 'Failed'}
                      </p>
                    </div>
                  </div>
                  
                  {result.status === 'published' && result.url ? (
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-vortex-yellow/10 flex items-center justify-center text-vortex-yellow hover:bg-vortex-yellow hover:text-vortex-black transition-all"
                    >
                      <ExternalLink size={14} />
                    </a>
                  ) : result.status === 'error' ? (
                    <span className="text-[10px] text-red-400/60 font-mono italic pr-2">{result.error || 'API Error'}</span>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          {/* Email Outreach Summary */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xs text-gray-500 uppercase tracking-[0.2em]">Email Campaign</h3>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">Active</span>
            </div>
            <div className="bg-vortex-black/50 rounded-2xl border border-vortex-yellow/10 p-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-white text-sm font-bold tracking-wide">MATCHED LEADS NOTIFIED</p>
                  <p className="text-gray-400 text-xs mt-0.5">3-step sequence triggered for matching leads</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-t border-vortex-yellow/5 pt-4 mt-2">
                <div className="text-center border-r border-vortex-yellow/5">
                  <p className="text-xl font-display text-vortex-yellow">12</p>
                  <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Matched</p>
                </div>
                <div className="text-center border-r border-vortex-yellow/5">
                  <p className="text-xl font-display text-white">8</p>
                  <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Sent</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-display text-gray-400">4</p>
                  <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Queued</p>
                </div>
              </div>
            </div>
          </section>

          {/* SEO/AEO Assets */}
          <section>
            <h3 className="font-display text-xs text-gray-500 uppercase tracking-[0.2em] mb-4">AEO & SEO Assets</h3>
            <div className="bg-vortex-yellow/5 rounded-2xl border-2 border-dashed border-vortex-yellow/20 p-5">
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'JSON-LD', icon: '{}' },
                  { label: 'Meta Tags', icon: '<>' },
                  { label: 'AEO FAQ', icon: '?' },
                  { label: 'OG Tags', icon: '🖼' }
                ].map((tag, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-vortex-dark border border-vortex-yellow/20 rounded-lg">
                    <span className="text-vortex-yellow font-mono text-xs">{tag.icon}</span>
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">{tag.label}</span>
                    <Check size={10} className="text-green-500" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-4 leading-relaxed italic">
                Platform-specific descriptions and keywords have been generated using Gemini-1.5-Pro for maximum search visibility.
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-vortex-yellow/20 bg-vortex-black/30 shrink-0">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-14 font-display tracking-widest uppercase" onClick={onClose}>
              Close
            </Button>
            <Button variant="brand" className="h-14 font-display tracking-widest uppercase" onClick={() => window.location.href = '/analytics'}>
              View Stats <ChevronRight size={18} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
