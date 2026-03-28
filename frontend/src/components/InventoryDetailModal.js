// frontend/src/components/InventoryDetailModal.js
import React, { useState, useEffect, useRef } from 'react';
import ListingTemplates from './ListingTemplates';

const InventoryDetailModal = ({ isOpen, onClose, inventory }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const modalRef = useRef(null);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Focus the modal for accessibility
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
      intake: 'bg-gray-100 text-gray-800',
      listed: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-orange-100 text-orange-800',
      sold: 'bg-blue-100 text-blue-800',
      archived: 'bg-gray-100 text-gray-500'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${inventory.year} ${inventory.make} ${inventory.model} details`}
    >
      {/* Mobile: full-screen | Desktop: centered modal */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white w-full h-full lg:rounded-lg lg:shadow-xl lg:max-w-4xl lg:w-full lg:max-h-[90vh] lg:h-auto overflow-y-auto lg:m-4 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — sticky on all sizes */}
        <div className="sticky top-0 bg-white border-b px-4 lg:px-6 py-3 lg:py-4 flex justify-between items-center z-10">
          <div className="min-w-0 flex-1 mr-3">
            <h2 className="text-lg lg:text-2xl font-bold text-gray-800 truncate">
              {inventory.year} {inventory.make} {inventory.model}
            </h2>
            <span className={`inline-block mt-1 lg:mt-2 px-3 py-1 rounded-full text-xs lg:text-sm font-semibold ${getStatusColor(inventory.status)}`}>
              {inventory.status?.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="mb-6">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden h-[250px] sm:h-[350px] lg:h-[400px]">
                <img
                  src={images[currentImageIndex]}
                  alt={`${inventory.make} ${inventory.model}`}
                  className="w-full h-full object-contain"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2 shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 hover:bg-opacity-100 rounded-full p-2 shadow-lg min-w-[44px] min-h-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand-500"
                      aria-label="Next image"
                    >
                      ›
                    </button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-brand-500 rounded ${
                        idx === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                      }`}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-16 h-16 lg:w-20 lg:h-20 object-cover rounded"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-6">
            {/* Basic Specs */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-800">Specifications</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Serial Number:</span>
                  <span className="font-medium">{inventory.serial || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hours:</span>
                  <span className="font-medium">{inventory.hours?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{inventory.capacity_lbs ? `${inventory.capacity_lbs} lbs` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mast Type:</span>
                  <span className="font-medium">{inventory.mast_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lift Height:</span>
                  <span className="font-medium">{inventory.lift_height_inches ? `${inventory.lift_height_inches}"` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Power Type:</span>
                  <span className="font-medium">{inventory.power_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Battery Info:</span>
                  <span className="font-medium">{inventory.battery_info || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-base lg:text-lg font-semibold mb-3 text-gray-800">Pricing</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Purchase Price:</span>
                  <span className="font-medium">{formatCurrency(inventory.purchase_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Listing Price:</span>
                  <span className="font-medium text-green-600">{formatCurrency(inventory.listing_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Floor Price:</span>
                  <span className="font-medium">{formatCurrency(inventory.floor_price)}</span>
                </div>
                {inventory.sold_price && (
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-gray-600">Sold Price:</span>
                    <span className="font-medium text-blue-600">{formatCurrency(inventory.sold_price)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attachments */}
          {inventory.attachments && inventory.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base lg:text-lg font-semibold mb-2 text-gray-800">Attachments</h3>
              <div className="flex flex-wrap gap-2">
                {inventory.attachments.map((attachment, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {attachment}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Condition */}
          <div className="mb-6">
            <h3 className="text-base lg:text-lg font-semibold mb-2 text-gray-800">Condition</h3>
            <div className="flex items-center gap-3 lg:gap-4 mb-2">
              <span className="text-sm text-gray-600">Score:</span>
              <div className="flex gap-1" role="img" aria-label={`Condition score ${inventory.condition_score} out of 10`}>
                {[...Array(10)].map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-6 h-2 lg:w-8 lg:h-2 rounded ${
                      idx < (inventory.condition_score || 0) ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold">{inventory.condition_score}/10</span>
            </div>
            {inventory.condition_notes && (
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {inventory.condition_notes}
              </p>
            )}
          </div>

          {/* Listing Templates */}
          {inventory.status === 'listed' && (
            <div className="border-t pt-6">
              <ListingTemplates inventory={inventory} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailModal;
