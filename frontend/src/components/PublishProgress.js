import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react';

/**
 * PublishProgress — shows real-time publish status
 */
export default function PublishProgress({ progress, platforms, emailsSent, emailsQueued }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative bg-vortex-dark w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] border-2 border-vortex-yellow/30 overflow-hidden p-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-vortex-yellow/10 border-2 border-vortex-yellow mb-4">
            <Loader2 size={32} className="text-vortex-yellow animate-spin" />
          </div>
          <h2 className="font-display text-2xl text-vortex-yellow tracking-widest uppercase">Publishing in Progress</h2>
          <p className="text-gray-400 text-sm mt-1">Please wait while we distribute your listing...</p>
        </div>

        {/* Platform Progress */}
        <div className="space-y-4 mb-8">
          {platforms.map((platform) => {
            const status = progress[platform]?.status || 'queued';
            return (
              <div key={platform} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'complete' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                    status === 'error' ? 'bg-red-500' :
                    'bg-vortex-yellow animate-pulse'
                  }`} />
                  <span className="text-sm font-medium text-gray-200 capitalize">
                    {platform.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${
                    status === 'complete' ? 'text-green-500' :
                    status === 'error' ? 'text-red-500' :
                    'text-vortex-yellow'
                  }`}>
                    {status === 'complete' ? 'Done' : status === 'error' ? 'Failed' : 'Working...'}
                  </span>
                  {status === 'complete' ? <CheckCircle2 size={14} className="text-green-500" /> : 
                   status === 'error' ? <AlertCircle size={14} className="text-red-500" /> :
                   <Loader2 size={14} className="text-vortex-yellow animate-spin" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Email Outreach Status */}
        {(emailsSent > 0 || emailsQueued > 0) && (
          <div className="bg-vortex-black/50 rounded-xl border border-vortex-yellow/20 p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <Mail size={18} className="text-vortex-yellow" />
              <span className="text-sm font-bold text-white tracking-wide">EMAIL OUTREACH</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-display text-vortex-yellow">{emailsSent}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Sent</p>
              </div>
              <div>
                <p className="text-2xl font-display text-gray-400">{emailsQueued}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Queued</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em]">Estimated time: 2-3 minutes</p>
        </div>
      </div>
    </div>
  );
}
