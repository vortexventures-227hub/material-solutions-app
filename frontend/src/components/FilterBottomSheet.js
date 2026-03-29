import React, { useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { Button } from './ui/button';

const FilterBottomSheet = ({ isOpen, onClose, options, value, onChange, title = "Filter" }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center lg:hidden">
      {/* Backdrop */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="relative w-full bg-white dark:bg-slate-950 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 safe-area-bottom max-h-[80vh] flex flex-col">
        {/* Handle */}
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 dark:border-slate-900">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-900 text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Options */}
        <div className="overflow-y-auto px-2 py-4 space-y-1">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  onClose();
                }}
                className={`
                  w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all active:scale-[0.98]
                  ${isSelected 
                    ? 'bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 font-bold' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-900'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  {option.icon && (
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isSelected ? 'bg-brand-100 dark:bg-brand-900' : 'bg-gray-50 dark:bg-slate-900'}`}>
                      {option.icon}
                    </div>
                  )}
                  <span className="text-base">{option.label}</span>
                </div>
                {isSelected && <Check size={20} className="text-brand-600" />}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-slate-900">
          <Button 
            variant="outline" 
            className="w-full rounded-xl py-6 font-bold"
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBottomSheet;
