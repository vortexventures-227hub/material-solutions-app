// frontend/src/components/InventoryDetailModal.js
import React, { useState, useEffect, useRef } from 'react';
import ListingTemplates from './ListingTemplates';
import PublishModal from './PublishModal';
import PublishButton from './PublishButton';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { Loader2, CheckCircle, Clock, AlertCircle, ShoppingCart, Megaphone, X, ChevronLeft, ChevronRight, Archive, Trash2, Edit3, Save } from 'lucide-react';

const InventoryDetailModal = ({ isOpen, onClose, inventory, onUpdate, onDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [marketplaceStatus, setMarketplaceStatus] = useState({ hasLiveListings: false, hasStagedListings: false });
  const { addToast } = useToast();
  const modalRef = useRef(null);

  // Check if item already has live marketplace listings. Website-listed is not
  // the same thing as externally posted, and manual_required rows must not hide
  // the Publish Button.
  useEffect(() => {
    if (isOpen && inventory?.id) {
      api.get(`/api/publish/${inventory.id}`)
        .then((res) => {
          const listings = Array.isArray(res.data.listings) ? res.data.listings : [];
          const hasLiveListings = listings.some((listing) => listing.status === 'published' && listing.platform_url);
          const hasStagedListings = listings.some((listing) => ['manual_required', 'publishing'].includes(listing.status));
          setMarketplaceStatus({ hasLiveListings, hasStagedListings });
        })
        .catch(() => setMarketplaceStatus({ hasLiveListings: false, hasStagedListings: false }));
    }
  }, [isOpen, inventory?.id]);

  useEffect(() => {
    if (!inventory) return;

    setCurrentImageIndex(0);
    setIsEditing(false);
    setEditForm({
      make: inventory.make || '',
      model: inventory.model || '',
      year: inventory.year || '',
      serial: inventory.serial || inventory.serial_number || '',
      hours: inventory.hours || '',
      capacity_lbs: inventory.capacity_lbs || '',
      mast_type: inventory.mast_type || '',
      lift_height_inches: inventory.lift_height_inches || '',
      power_type: inventory.power_type || '',
      battery_info: inventory.battery_info || '',
      condition_score: inventory.condition_score || '',
      condition_notes: inventory.condition_notes || '',
      purchase_price: inventory.purchase_price || '',
      listing_price: inventory.listing_price || '',
      floor_price: inventory.floor_price || '',
      status: inventory.status || 'intake',
    });
  }, [inventory]);

  const toOptionalNumber = (value) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };

  const pruneEmptyFields = (payload) =>
    Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== '' && value !== undefined && value !== null)
    );

  const handleEditChange = (event) => {
    setEditForm(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

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

  const saveDetails = async () => {
    if (isUpdating || !inventory?.id) return;

    setIsUpdating(true);
    try {
      const payload = pruneEmptyFields({
        ...editForm,
        year: toOptionalNumber(editForm.year),
        hours: toOptionalNumber(editForm.hours),
        capacity_lbs: toOptionalNumber(editForm.capacity_lbs),
        lift_height_inches: toOptionalNumber(editForm.lift_height_inches),
        condition_score: toOptionalNumber(editForm.condition_score),
        purchase_price: toOptionalNumber(editForm.purchase_price),
        listing_price: toOptionalNumber(editForm.listing_price),
        floor_price: toOptionalNumber(editForm.floor_price),
      });

      const response = await api.patch(`/api/inventory/${inventory.id}`, payload);

      if (onUpdate) {
        onUpdate(response.data);
      }
      setIsEditing(false);
      addToast('Inventory details saved', 'success');
    } catch (err) {
      console.error('Error saving inventory:', err);
      addToast('Failed to save inventory details', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteInventory = async () => {
    if (isUpdating || !inventory?.id) return;
    const confirmed = window.confirm(`Delete ${inventory.year || ''} ${inventory.make || ''} ${inventory.model || ''}? This removes it from the FSM inventory list.`);
    if (!confirmed) return;

    setIsUpdating(true);
    try {
      await api.delete(`/api/inventory/${inventory.id}`);
      if (onDelete) {
        onDelete(inventory.id);
      }
      addToast('Inventory item deleted', 'success');
    } catch (err) {
      console.error('Error deleting inventory:', err);
      addToast('Failed to delete inventory item', 'error');
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
            onClick={() => setIsEditing((value) => !value)}
            className="text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-muted transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label={isEditing ? 'Close edit form' : 'Edit inventory'}
          >
            <Edit3 size={18} />
          </button>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-muted transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Publish Action Bar - Always visible at top */}
        <div className="px-4 lg:px-6 pt-4 pb-2">
          {marketplaceStatus.hasLiveListings ? (
            <div className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl text-sm font-bold bg-neon-green/10 text-neon-green border-2 border-neon-green/30 cursor-default">
              <CheckCircle size={18} />
              <span>Live Marketplace Listing Detected</span>
            </div>
          ) : inventory.status === 'sold' || inventory.status === 'archived' ? (
            <div className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl text-sm font-bold bg-muted text-muted-foreground border border-border cursor-not-allowed opacity-50">
              <Megaphone size={18} />
              <span>{inventory.status === 'sold' ? 'Item Sold — Cannot Publish' : 'Archived — Cannot Publish'}</span>
            </div>
          ) : (
            <>
              {marketplaceStatus.hasStagedListings && (
                <div className="mb-3 flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                  <AlertCircle size={16} />
                  <span>Marketplace staging exists; no live external URL detected yet.</span>
                </div>
              )}
              <PublishButton
                unit={inventory}
                onClick={() => setShowPublishModal(true)}
                className="w-full"
              />
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6 pt-2">
          {isEditing && (
            <div className="mb-6 bg-muted/30 border border-border/30 p-4 lg:p-5 rounded-2xl">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="text-sm font-semibold text-foreground">Edit Inventory Details</h3>
                <button
                  type="button"
                  onClick={saveDetails}
                  disabled={isUpdating}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-brand-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                  Save
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  ['make', 'Make'],
                  ['model', 'Model'],
                  ['year', 'Year'],
                  ['serial', 'Serial'],
                  ['hours', 'Hours'],
                  ['capacity_lbs', 'Capacity lbs'],
                  ['mast_type', 'Mast Type'],
                  ['lift_height_inches', 'Lift Height Inches'],
                  ['power_type', 'Power Type'],
                  ['battery_info', 'Battery Info'],
                  ['condition_score', 'Condition Score'],
                  ['purchase_price', 'Purchase Price'],
                  ['listing_price', 'Listing Price'],
                  ['floor_price', 'Floor Price'],
                ].map(([name, label]) => (
                  <label key={name} className="text-xs font-semibold text-muted-foreground">
                    {label}
                    <input
                      name={name}
                      value={editForm[name] ?? ''}
                      onChange={handleEditChange}
                      className="mt-1 w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </label>
                ))}
                <label className="text-xs font-semibold text-muted-foreground">
                  Status
                  <select
                    name="status"
                    value={editForm.status || 'intake'}
                    onChange={handleEditChange}
                    className="mt-1 w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {['intake', 'listed', 'reserved', 'pending', 'sold', 'archived'].map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <label className="sm:col-span-2 lg:col-span-3 text-xs font-semibold text-muted-foreground">
                  Condition Notes
                  <textarea
                    name="condition_notes"
                    value={editForm.condition_notes ?? ''}
                    onChange={handleEditChange}
                    className="mt-1 w-full min-h-[90px] rounded-xl border border-border/60 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </label>
              </div>
            </div>
          )}

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

            {/* Publish to Marketplaces - Quick Action */}
            {!marketplaceStatus.hasLiveListings && inventory.status !== 'sold' && inventory.status !== 'archived' && (
              <PublishButton
                unit={inventory}
                onClick={() => setShowPublishModal(true)}
                className="w-full mb-4"
              />
            )}
            {marketplaceStatus.hasLiveListings && (
              <div className="w-full mb-4 flex items-center justify-center gap-2 p-4 rounded-xl text-sm font-bold bg-neon-green/10 text-neon-green border-2 border-neon-green/30 cursor-default">
                <CheckCircle size={18} />
                <span>Live Marketplace Listing Detected</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { status: 'listed', label: 'LISTED', icon: <CheckCircle size={15} />, activeColor: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-2 border-emerald-200 dark:border-emerald-800' },
                { status: 'reserved', label: 'RESERVED', icon: <Clock size={15} />, activeColor: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-2 border-amber-200 dark:border-amber-800' },
                { status: 'pending', label: 'PENDING', icon: <AlertCircle size={15} />, activeColor: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-2 border-orange-200 dark:border-orange-800' },
                { status: 'sold', label: 'SOLD', icon: <ShoppingCart size={15} />, activeColor: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-800' },
                { status: 'archived', label: 'ARCHIVE', icon: <Archive size={15} />, activeColor: 'bg-gray-100 dark:bg-gray-800/50 text-gray-500 border-2 border-gray-300 dark:border-gray-700' },
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
            <button
              type="button"
              onClick={deleteInventory}
              disabled={isUpdating}
              className="mt-3 w-full flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-semibold transition-all active:scale-[0.95] disabled:cursor-not-allowed bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/30"
            >
              {isUpdating ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={15} />}
              <span>DELETE INVENTORY ITEM</span>
            </button>
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
          const results = data?.results || [];
          const succeeded = results.filter((result) => result.status === 'published' && result.url).length;
          const staged = results.filter((result) => result.manualPasteRequired || result.status === 'not_implemented').length;
          setMarketplaceStatus({
            hasLiveListings: succeeded > 0,
            hasStagedListings: staged > 0,
          });
          if (onUpdate && inventory.status === 'intake') {
            onUpdate({ ...inventory, status: 'listed' });
          }
          addToast(
            succeeded > 0
              ? `Prepared ${succeeded} marketplace listing${succeeded === 1 ? '' : 's'}.`
              : staged > 0
                ? `Staged ${staged} browser-posting handoff${staged === 1 ? '' : 's'}.`
                : 'No marketplace listings were prepared.',
            succeeded > 0 || staged > 0 ? 'success' : 'error'
          );
        }}
      />
    </div>
  );
};

export default InventoryDetailModal;
