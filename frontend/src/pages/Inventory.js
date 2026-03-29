// frontend/src/pages/Inventory.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { SkeletonInventoryCard } from '../components/SkeletonCard';
import InventoryDetailModal from '../components/InventoryDetailModal';
import FilterBottomSheet from '../components/FilterBottomSheet';
import { ProductSchema } from '../components/SEO';
import { Layout, PageHeader, Grid } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { SlidersHorizontal } from 'lucide-react';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, hasNext: false, hasPrev: false });
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const statusOptions = [
    { value: '', label: 'All Status', icon: '🔍' },
    { value: 'intake', label: 'Intake', icon: '📝' },
    { value: 'listed', label: 'Listed', icon: '✅' },
    { value: 'reserved', label: 'Reserved', icon: '🔒' },
    { value: 'pending', label: 'Pending', icon: '⏳' },
    { value: 'sold', label: 'Sold', icon: '💰' },
  ];

  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 25 });
        if (filter) params.set('status', filter);
        const response = await api.get(`/api/inventory?${params}`);
        const { data, total, totalPages, hasNext, hasPrev } = response.data;
        setInventory(data);
        setPagination({ total, totalPages, hasNext, hasPrev });
      } catch (err) {
        console.error('Error fetching inventory:', err);
        addToast('Failed to load inventory', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [filter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleUpdate = (updatedItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setSelectedItem(updatedItem);
  };

  const getStatusColor = (status) => {
    const colors = {
      intake: 'bg-muted text-muted-foreground',
      listed: 'bg-green-100 text-green-700',
      reserved: 'bg-yellow-100 text-yellow-700',
      pending: 'bg-orange-100 text-orange-700',
      sold: 'bg-blue-100 text-blue-700',
      archived: 'bg-muted text-muted-foreground'
    };
    return colors[status] || 'bg-muted text-muted-foreground';
  };

  return (
    <Layout>
      <PageHeader 
        title="Inventory" 
        description={`${loading ? 'Loading...' : `${pagination.total} units available`}`}
      >
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* Mobile Filter Button */}
          <Button
            variant="outline"
            className="flex-1 sm:hidden h-[44px] rounded-xl font-bold flex items-center space-x-2 border-gray-200"
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal size={18} />
            <span>Filter</span>
            {filter && <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse ml-1" />}
          </Button>

          {/* Desktop Filter Select */}
          <div className="hidden sm:flex items-center space-x-2">
            <label htmlFor="inventory-filter" className="text-sm font-medium">Filter:</label>
            <select
              id="inventory-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-lg text-sm focus:ring-2 focus:ring-primary transition-all min-h-[44px] w-full sm:w-auto cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <Button variant="brand" onClick={() => navigate('/intake')} className="h-[44px] sm:w-auto w-1/3">
            + Add
          </Button>
        </div>
      </PageHeader>

      {loading ? (
        <Grid cols={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonInventoryCard key={i} />
          ))}
        </Grid>
      ) : inventory.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-xl border border-dashed border-border shadow-sm">
          <div className="text-5xl mb-4">🚜</div>
          <h3 className="text-xl font-semibold mb-2 text-foreground">No equipment yet</h3>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Add your first piece of equipment to start managing your inventory.</p>
          <Button variant="brand" size="lg" onClick={() => navigate('/intake')}>Add Equipment</Button>
        </div>
      ) : (
        <Grid cols={3}>
          {inventory.map((item, index) => (
            <Card 
              key={item.id} 
              onClick={() => handleItemClick(item)}
              className="cursor-pointer group overflow-hidden transition-all duration-300 hover:shadow-card-hover active:scale-95 select-none touch-manipulation"
            >
              <ProductSchema
                name={`${item.year} ${item.make} ${item.model}`}
                description={`${item.capacity_lbs?.toLocaleString()} lb capacity ${item.make} ${item.model}. Hours: ${item.hours}. Condition: ${item.condition_score}/10.`}
                brand={item.make}
                model={item.model}
                price={item.listing_price?.toString() || '0'}
                url={`${window.location.origin}/inventory/${item.id}`}
                specs={[
                  { name: 'Capacity', value: `${item.capacity_lbs} lbs` },
                  { name: 'Hours', value: item.hours },
                  { name: 'Serial', value: item.serial_number || 'N/A' },
                  { name: 'Year', value: item.year }
                ]}
              />
              <div className="h-48 bg-muted flex items-center justify-center relative">
                <div className="text-6xl group-hover:scale-110 transition-transform duration-300">🚜</div>
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
              <CardContent className="p-5">
                <CardTitle className="text-lg mb-4 group-hover:text-primary transition-colors">
                  {item.year} {item.make} {item.model}
                </CardTitle>
                <div className="space-y-2 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center"><span className="w-6">⏱</span> {item.hours?.toLocaleString() || 'N/A'} hours</div>
                  <div className="flex items-center"><span className="w-6">⚖️</span> {item.capacity_lbs?.toLocaleString() || 'N/A'} lbs</div>
                </div>
                {item.listing_price && (
                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Listing Price</span>
                    <span className="text-xl font-bold text-brand-600">${item.listing_price.toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </Grid>
      )}

      {!loading && inventory.length > 0 && (
        <div className="flex items-center justify-between mt-12 pt-6 border-t">
          <Button 
            variant="outline" 
            disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            Page {page} of {pagination.totalPages}
          </span>
          <Button 
            variant="outline"
            disabled={!pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </Button>
        </div>
      )}

      <InventoryDetailModal
        isOpen={isModalOpen}
        onClose={closeModal}
        inventory={selectedItem}
        onUpdate={handleUpdate}
      />

      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Inventory Filter"
        options={statusOptions}
        value={filter}
        onChange={setFilter}
      />
    </Layout>
  );
};

export default Inventory;
