// frontend/src/components/InventoryDetailModal.js
import React, { useState, useEffect, useRef } from 'react';
import ListingTemplates from './ListingTemplates';
import PublishModal from './PublishModal';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { Loader2, CheckCircle, Clock, AlertCircle, ShoppingCart, Megaphone, X, ChevronLeft, ChevronRight } from 'lucide-react';

const InventoryDetailModal = ({ isOpen, onClose, inventory, onUpdate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [hasListings, setHasListings] = useState(false);
  const { addToast } = useToast();
  const modalRef = useRef(null);

  // Check if item already has marketplace listings
  useEffect(() => {
    if (isOpen && inventory?.id) {
      api.get(`/api/inventory/${inventory.id}/listings`)
        .then((res) => setHasListings(res.data.listings?.length > 0))
        .catch(() => setHasListings(false));
    }
  }, [isOpen, inventory?.id]);

  const updateStatus = async (newStatus) => {
    if (isUpdating || inventory.status === newStatus) return;

    setIsUpdating(true);
    try {
      const response = await api.patch(`/api/inventory/${inventory.id}`, {
        status: newStatus
      });

      if (onUpdate) {
        onUpdate(response.data);
      }

      addToast(`Status updated to ${newStatus}`, 'success');
    } catch (err) {
      console.error('Error updating status:', err);
      addToast('Failed to update status', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !inventory) return null;

  const images = Array.isArray(inventory.images) ? inventory.images : [];

  const nextImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      intake: 'bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400',
      listed: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
      reserved: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
      pending: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
      sold: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
      archived: 'bg-gray-100 dark:bg-gray-800/50 text-gray-500'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const formatCurrency = (value) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${inventory.year} ${inventory.make} ${inventory.model} details`}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-card text-card-foreground w-full h-full lg:rounded-2xl lg:shadow-2xl lg:max-w-4xl lg:w-full lg:max-h-[90vh] lg:h-auto overflow-y-auto lg:m-4 outline-none border-0 lg:border lg:border-border/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-xl border-b border-border/50 px-4 lg:px-6 py-3 lg:py-4 flex justify-between items-center z-10">
          <div className="min-w-0 flex-1 mr-3">
            <h2 className="text-lg lg:text-xl font-bold text-foreground truncate">
              {inventory.year} {inventory.make} {inventory.model}
            </h2>
            <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${getStatusColor(inventory.status)}`}>
              {inventory.status?.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-muted transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="mb-6">
              <div className="relative bg-muted rounded-2xl overflow-hidden h-[250px] sm:h-[350px] lg:h-[400px]">
                <img
                  src={images[currentImageIndex]}
                  alt={`${inventory.make} ${inventory.model}`}
                  className="w-full h-full object-contain"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card rounded-xl p-2 shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card rounded-xl p-2 shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-foreground/60 backdrop-blur-sm text-background px-3 py-1 rounded-lg text-xs font-medium tabular-nums">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-xl overflow-hidden transition-all ${
                        idx === currentImageIndex ? 'ring-2 ring-brand-500 opacity-100' : 'opacity-60 hover:opacity-80'
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-16 h-16 lg:w-20 lg:h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 mb-6">
            <div className="bg-muted/30 border border-border/30 p-5 rounded-2xl">
              <h3 className="text-sm font-semibold mb-4 text-foreground">Specifications</h3>
              <div className="space-y-3 text-sm">
                {[
                  ['Serial Number', inventory.serial || 'N/A'],
                  ['Hours', inventory.hours?.toLocaleString() || 'N/A'],
                  ['Capacity', inventory.capacity_lbs ? `${inventory.capacity_lbs} lbs` : 'N/A'],
                  ['Mast Type', inventory.mast_type || 'N/A'],
                  ['Lift Height', inventory.lift_height_inches ? `${inventory.lift_height_inches}"` : 'N/A'],
                  ['Power Type', inventory.power_type || 'N/A'],
                  ['Battery Info', inventory.battery_info || 'N/A'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/30 border border-border/30 p-5 rounded-2xl">
              <h3 className="text-sm font-semibold mb-4 text-foreground">Pricing</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Purchase Price</span>
                  <span className="font-medium text-foreground">{formatCurrency(inventory.purchase_price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Listing Price</span>
                  <span className="font-semibold text-emerald-500">{formatCurrency(inventory.listing_price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Floor Price</span>
                  <span className="font-medium text-foreground">{formatCurrency(inventory.floor_price)}</span>
                </div>
                {inventory.sold_price && (
                  <div className="flex justify-between items-center pt-3 border-t border-border/30">
                    <span className="text-muted-foreground">Sold Price</span>
                    <span className="font-semibold text-brand-500">{formatCurrency(inventory.sold_price)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-8 border-t border-border/50 pt-6">
            <h3 className="text-sm font-semibold mb-4 text-foreground flex items-center gap-2">
              <span className="w-1 h-5 bg-brand-500 rounded-full" />
              Quick Actions
            </h3>

            {/* Publish to Marketplaces - Always visible */}
            <button
              onClick={() => setShowPublishModal(true)}
              disabled={hasListings || inventory.status === 'sold' || inventory.status === 'archived'}
              className={`
                w-full mb-4 flex items-center justify-center gap-2 p-4 rounded-xl text-sm font-bold transition-all duration-200
                ${hasListings
                  ? 'bg-neon-green/10 text-neon-green border-2 border-neon-green/30 cursor-default'
                  : inventory.status === 'sold' || inventory.status === 'archived'
                    ? 'bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white hover:shadow-glow-neon hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] shadow-md shadow-neon-cyan/20'
                }
              `}
            >
              <Megaphone size={18} />
              <span>
                {hasListings
                  ? 'Already Published to Marketplaces'
                  : inventory.status === 'sold'
                    ? 'Item Sold — Cannot Publish'
                    : 'Publish to Marketplaces'}
              </span>
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { status: 'listed', label: 'LISTED', icon: <CheckCircle size={15} />, activeColor: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-800' },
                { status: 'reserved', label: 'RESERVED', icon: <Clock size={15} />, activeColor: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-2 border-amber-200 dark:border-amber-800' },
                { status: 'pending', label: 'PENDING', icon: <AlertCircle size={15} />, activeColor: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-2 border-orange-200 dark:border-orange-800' },
                { status: 'sold', label: 'SOLD', icon: <ShoppingCart size={15} />, activeColor: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-800' },
              ].map(({ status, label, icon, activeColor }) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={isUpdating || inventory.status === status}
                  className={`
                    flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all active:scale-[0.95] disabled:cursor-not-allowed
                    ${inventory.status === status
                      ? activeColor
                      : 'bg-card text-muted-foreground border border-border/50 hover:border-border hover:text-foreground shadow-sm'
                    }
                  `}
                >
                  {isUpdating && inventory.status !== status ? <Loader2 className="animate-spin" size={14} /> : icon}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Attachments */}
          {inventory.attachments && inventory.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-foreground">Attachments</h3>
              <div className="flex flex-wrap gap-2">
                {inventory.attachments.map((attachment, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium"
                  >
                    {attachment}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Condition */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-3 text-foreground">Condition</h3>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-muted-foreground">Score:</span>
              <div className="flex gap-1" role="img" aria-label={`Condition score ${inventory.condition_score} out of 10`}>
                {[...Array(10)].map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-6 h-2 lg:w-8 lg:h-2.5 rounded-full transition-colors ${
                      idx < (inventory.condition_score || 0) ? 'bg-emerald-500' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-foreground tabular-nums">{inventory.condition_score}/10</span>
            </div>
            {inventory.condition_notes && (
              <p className="text-sm text-muted-foreground bg-muted/30 border border-border/30 p-3 rounded-xl">
                {inventory.condition_notes}
              </p>
            )}
          </div>

          {/* Listing Templates */}
          {inventory.status === 'listed' && (
            <div className="border-t border-border/50 pt-6">
              <ListingTemplates inventory={inventory} />
            </div>
          )}
        </div>
      </div>

      {/* Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        inventory={inventory}
        onPublished={(data) => {
          setHasListings(true);
          if (onUpdate && inventory.status === 'intake') {
            onUpdate({ ...inventory, status: 'listed' });
          }
          addToast(`Published to ${data.listings?.length || 0} marketplace(s)!`, 'success');
        }}
      />
    </div>
  );
};

export default InventoryDetailModal;
