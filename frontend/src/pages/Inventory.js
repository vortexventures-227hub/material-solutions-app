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
import { Card, CardContent, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { SlidersHorizontal, Clock, Weight, Plus, Truck } from 'lucide-react';

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
      intake: 'bg-gray-100 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400',
      listed: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
      reserved: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
      pending: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400',
      sold: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
      archived: 'bg-gray-100 dark:bg-gray-800/50 text-gray-500 dark:text-gray-500'
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  return (
    <Layout>
      <PageHeader
        title="Inventory"
        description={`${loading ? 'Loading...' : `${pagination.total} units available`}`}
      >
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            className="flex-1 sm:hidden h-[44px] rounded-xl font-semibold flex items-center gap-2"
            onClick={() => setIsFilterOpen(true)}
          >
            <SlidersHorizontal size={16} />
            <span>Filter</span>
            {filter && <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />}
          </Button>

          <div className="hidden sm:flex items-center gap-2">
            <label htmlFor="inventory-filter" className="text-sm font-medium text-muted-foreground">Filter:</label>
            <select
              id="inventory-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-border/60 bg-card rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all min-h-[44px] w-full sm:w-auto cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <Button variant="brand" onClick={() => navigate('/intake')} className="h-[44px] sm:w-auto w-1/3 gap-1">
            <Plus size={16} />
            Add
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
        <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-border/50 shadow-premium">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck size={28} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">No equipment yet</h3>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm">Add your first piece of equipment to start managing your inventory.</p>
          <Button variant="brand" size="lg" onClick={() => navigate('/intake')}>Add Equipment</Button>
        </div>
      ) : (
        <Grid cols={3}>
          {inventory.map((item) => (
            <Card
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="cursor-pointer group overflow-hidden hover:shadow-premium-hover active:scale-[0.97] select-none touch-manipulation"
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
              <div className="h-48 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
                <Truck size={48} className="text-muted-foreground/40 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              </div>
              <CardContent className="p-5">
                <CardTitle className="text-base mb-3 group-hover:text-brand-500 transition-colors">
                  {item.year} {item.make} {item.model}
                </CardTitle>
                <div className="space-y-1.5 mb-5 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-muted-foreground/60" />
                    <span>{item.hours?.toLocaleString() || 'N/A'} hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Weight size={14} className="text-muted-foreground/60" />
                    <span>{item.capacity_lbs?.toLocaleString() || 'N/A'} lbs</span>
                  </div>
                </div>
                {item.listing_price && (
                  <div className="border-t border-border/50 pt-4 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground font-medium">Listing Price</span>
                    <span className="text-lg font-bold text-brand-500">${item.listing_price.toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </Grid>
      )}

      {!loading && inventory.length > 0 && (
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border/50">
          <Button
            variant="outline"
            disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm font-medium text-muted-foreground tabular-nums">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            disabled={!pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
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
