// frontend/src/pages/Inventory.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { SkeletonInventoryCard } from '../components/SkeletonCard';
import InventoryDetailModal from '../components/InventoryDetailModal';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const url = filter
          ? `/api/inventory?status=${filter}`
          : '/api/inventory';
        const response = await api.get(url);
        setInventory(response.data);
      } catch (err) {
        console.error('Error fetching inventory:', err);
        addToast('Failed to load inventory', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      intake: 'bg-gray-100 text-gray-700',
      listed: 'bg-green-100 text-green-700',
      reserved: 'bg-yellow-100 text-yellow-700',
      pending: 'bg-orange-100 text-orange-700',
      sold: 'bg-blue-100 text-blue-700',
      archived: 'bg-gray-100 text-gray-500'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Inventory</h1>
              <p className="mt-1 text-sm text-gray-500">
                {loading ? 'Loading...' : `${inventory.length} units available`}
              </p>
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center space-x-3">
              <label htmlFor="inventory-filter" className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                id="inventory-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-base sm:text-sm min-h-[44px]"
              >
                <option value="">All Status</option>
                <option value="intake">Intake</option>
                <option value="listed">Listed</option>
                <option value="reserved">Reserved</option>
                <option value="pending">Pending</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonInventoryCard key={i} />
            ))}
          </div>
        ) : inventory.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No equipment yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Add your first piece of equipment to start managing your inventory.
            </p>
            <button
              onClick={() => navigate('/intake')}
              className="inline-flex items-center px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Equipment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {inventory.map((item, index) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => e.key === 'Enter' && handleItemClick(item)}
                tabIndex={0}
                role="button"
                className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer overflow-hidden group animate-fade-in active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image Placeholder */}
                <div className="h-40 sm:h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                  <div className="text-6xl opacity-50 group-hover:scale-110 transition-transform duration-300">
                    🚜
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                      {item.status?.toUpperCase()}
                    </span>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 font-semibold transform scale-90 group-hover:scale-100 transition-all duration-300">
                      View Details →
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 lg:p-5">
                  <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {item.year} {item.make} {item.model}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-5 text-gray-500">⏱</span>
                      <span>{item.hours?.toLocaleString() || 'N/A'} hours</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-5 text-gray-500">⚖️</span>
                      <span>{item.capacity_lbs?.toLocaleString() || 'N/A'} lbs</span>
                    </div>
                    {item.mast_type && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="w-5 text-gray-500">🏗</span>
                        <span>{item.mast_type}</span>
                      </div>
                    )}
                  </div>

                  {/* Condition Bar */}
                  {item.condition_score && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-500">Condition</span>
                        <span className="text-xs font-semibold text-gray-900">{item.condition_score}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                          style={{ width: `${(item.condition_score / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  {item.listing_price && (
                    <div className="border-t pt-3 lg:pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Listing Price</span>
                        <span className="text-xl lg:text-2xl font-bold text-brand-600">
                          ${item.listing_price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <InventoryDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        inventory={selectedItem}
      />
    </div>
  );
};

export default Inventory;
