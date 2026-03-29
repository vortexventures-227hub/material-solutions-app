import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { Loader2, CheckCircle, XCircle, ExternalLink, Megaphone, Globe, Share2 } from 'lucide-react';

const STEPS = [
  { key: 'content', label: 'Generating SEO content with AI...' },
  { key: 'facebook', label: 'Publishing to Facebook Marketplace...' },
  { key: 'website', label: 'Publishing to website...' },
  { key: 'done', label: 'Complete!' },
];

const platformIcons = {
  facebook_marketplace: Share2,
  website: Globe,
};

const PublishModal = ({ isOpen, onClose, inventory, onPublished }) => {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | publishing | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handlePublish = useCallback(async () => {
    setStatus('publishing');
    setStep(0);
    setError(null);

    // Animate through steps
    const stepTimer = setInterval(() => {
      setStep((prev) => {
        if (prev < STEPS.length - 2) return prev + 1;
        clearInterval(stepTimer);
        return prev;
      });
    }, 1500);

    try {
      const response = await api.post(`/api/inventory/${inventory.id}/publish`);
      clearInterval(stepTimer);
      setStep(STEPS.length - 1);
      setResult(response.data);
      setStatus('success');
      if (onPublished) onPublished(response.data);
    } catch (err) {
      clearInterval(stepTimer);
      const message = err.response?.data?.error || err.message || 'Publishing failed';
      setError(message);
      setStatus('error');
    }
  }, [inventory?.id, onPublished]);

  useEffect(() => {
    if (isOpen && status === 'idle') {
      handlePublish();
    }
  }, [isOpen, status, handlePublish]);

  const handleClose = () => {
    setStatus('idle');
    setStep(0);
    setResult(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-blue-600 px-6 py-5 text-white">
          <div className="flex items-center space-x-3">
            <Megaphone size={24} />
            <div>
              <h3 className="text-lg font-bold">Publish to Marketplaces</h3>
              <p className="text-sm text-blue-100 mt-0.5">
                {inventory.year} {inventory.make} {inventory.model}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-6">
          {status === 'publishing' && (
            <div className="space-y-4">
              {STEPS.slice(0, -1).map((s, idx) => (
                <div key={s.key} className="flex items-center space-x-3">
                  {idx < step ? (
                    <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                  ) : idx === step ? (
                    <Loader2 size={20} className="text-brand-600 animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${idx <= step ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
              <div className="mt-4 w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-brand-600 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${((step + 1) / (STEPS.length - 1)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {status === 'success' && result && (
            <div>
              <div className="flex items-center space-x-3 mb-5">
                <CheckCircle size={28} className="text-green-500" />
                <div>
                  <p className="text-lg font-bold text-gray-800">Published Successfully!</p>
                  <p className="text-sm text-gray-500">{result.listings?.length || 0} marketplace listing(s) created</p>
                </div>
              </div>

              {/* Generated Title */}
              {result.content?.title && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 font-medium mb-1">AI-Generated Title</p>
                  <p className="text-sm font-semibold text-gray-800">{result.content.title}</p>
                </div>
              )}

              {/* Listing Links */}
              <div className="space-y-3">
                {result.listings?.map((listing) => {
                  const Icon = platformIcons[listing.platform] || Globe;
                  return (
                    <div
                      key={listing.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={18} className="text-gray-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-800 capitalize">
                            {listing.platform.replace('_', ' ')}
                          </p>
                          <p className={`text-xs ${listing.status === 'active' ? 'text-green-600' : listing.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                            {listing.status}
                            {listing.note && ` — ${listing.note}`}
                          </p>
                        </div>
                      </div>
                      {listing.url && (
                        <a
                          href={listing.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:text-brand-700 p-2"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tags */}
              {result.content?.tags?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 font-medium mb-2">SEO Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.content.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-4">
              <XCircle size={40} className="text-red-500 mx-auto mb-3" />
              <p className="text-lg font-bold text-gray-800 mb-2">Publishing Failed</p>
              <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-3">
          {status === 'error' && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Retry
            </button>
          )}
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {status === 'success' ? 'Done' : status === 'publishing' ? 'Cancel' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishModal;
