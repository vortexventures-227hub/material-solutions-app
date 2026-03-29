import React, { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { Layout, PageHeader } from '../components/Layout';
import { Search, ArrowRight, Package, Megaphone, Users, UserCheck, CheckCircle2 } from 'lucide-react';

const PIPELINE_STAGES = [
  { key: 'intake', label: 'Intake', icon: <Package size={18} />, color: 'neon-cyan', description: 'Uploaded to system' },
  { key: 'listed', label: 'Listed', icon: <Megaphone size={18} />, color: 'neon-purple', description: 'Published to marketplaces' },
  { key: 'leads', label: 'Leads', icon: <Users size={18} />, color: 'neon-yellow', description: 'Inquiries received' },
  { key: 'qualified', label: 'Qualified', icon: <UserCheck size={18} />, color: 'neon-green', description: 'Conversation completed' },
  { key: 'sold', label: 'Closed', icon: <CheckCircle2 size={18} />, color: 'neon-green', description: 'Sold' },
];

const Pipeline = () => {
  const [inventory, setInventory] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch independently so one failure doesn't block the other
        const results = await Promise.allSettled([
          api.get('/api/inventory'),
          api.get('/api/leads'),
        ]);

        const invRes = results[0];
        const leadsRes = results[1];

        if (invRes.status === 'fulfilled') {
          const invData = invRes.value?.data;
          setInventory(Array.isArray(invData?.inventory) ? invData.inventory : Array.isArray(invData) ? invData : []);
        } else {
          console.error('Error fetching inventory:', invRes.reason);
        }

        if (leadsRes.status === 'fulfilled') {
          const leadsData = leadsRes.value?.data;
          setLeads(Array.isArray(leadsData?.leads) ? leadsData.leads : Array.isArray(leadsData) ? leadsData : []);
        } else {
          console.error('Error fetching leads:', leadsRes.reason);
        }

        if (invRes.status === 'rejected' && leadsRes.status === 'rejected') {
          setError('Failed to load pipeline data');
          addToast('Failed to load pipeline data', 'error');
        }
      } catch (err) {
        console.error('Error fetching pipeline data:', err);
        setError('Failed to load pipeline data');
        addToast('Failed to load pipeline data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getStageItems = (stageKey) => {
    try {
      const safeLeads = Array.isArray(leads) ? leads : [];
      const safeInventory = Array.isArray(inventory) ? inventory : [];
      const q = (searchQuery || '').toLowerCase();

      if (stageKey === 'leads') {
        return safeLeads.filter((l) =>
          !q || l.name?.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q)
        );
      }
      if (stageKey === 'qualified') {
        return safeLeads.filter((l) => l.status === 'qualified' || l.status === 'converted');
      }
      return safeInventory.filter((item) => {
        const matchesStage = item.status === stageKey;
        const matchesSearch = !q ||
          item.make?.toLowerCase().includes(q) ||
          item.model?.toLowerCase().includes(q) ||
          item.serial?.toLowerCase().includes(q) ||
          String(item.id || '').includes(searchQuery);
        return matchesStage && matchesSearch;
      });
    } catch (err) {
      console.error('Error filtering pipeline stage:', stageKey, err);
      return [];
    }
  };

  const stageColorMap = {
    'neon-cyan': { bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/30', text: 'text-neon-cyan', dot: 'bg-neon-cyan', shadow: 'shadow-glow' },
    'neon-purple': { bg: 'bg-neon-purple/10', border: 'border-neon-purple/30', text: 'text-neon-purple', dot: 'bg-neon-purple', shadow: 'shadow-glow-purple' },
    'neon-yellow': { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400', shadow: '' },
    'neon-green': { bg: 'bg-neon-green/10', border: 'border-neon-green/30', text: 'text-neon-green', dot: 'bg-neon-green', shadow: 'shadow-glow-green' },
  };

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-10 w-48 bg-muted rounded-xl mb-4" />
          <div className="h-4 w-72 bg-muted rounded-lg mb-8" />
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="min-w-[260px] h-64 bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error && inventory.length === 0 && leads.length === 0) {
    return (
      <Layout>
        <PageHeader title="Pipeline" description="Track inventory through the sales pipeline" />
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4">
            <Package size={28} className="text-red-500" />
          </div>
          <p className="text-lg font-semibold text-foreground mb-2">Unable to load pipeline data</p>
          <p className="text-sm text-muted-foreground mb-6">Please check your connection and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-neon-cyan text-white rounded-xl font-semibold text-sm hover:shadow-glow transition-all"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title="Pipeline"
        description="Track inventory through the sales pipeline"
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by ID, vendor, lead, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan/50 transition-all"
          />
        </div>
        <select
          value={selectedItem || ''}
          onChange={(e) => setSelectedItem(e.target.value || null)}
          className="px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan/50 transition-all"
        >
          <option value="">All Inventory</option>
          {inventory.map((item) => (
            <option key={item.id} value={item.id}>
              {item.year} {item.make} {item.model}
            </option>
          ))}
        </select>
      </div>

      {/* Pipeline Visual Stages Header */}
      <div className="hidden md:flex items-center justify-between mb-6 p-4 bg-card/50 border border-border/50 rounded-2xl">
        {PIPELINE_STAGES.map((stage, idx) => {
          const colors = stageColorMap[stage.color];
          const count = getStageItems(stage.key).length;
          return (
            <React.Fragment key={stage.key}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center ${colors.text}`}>
                  {stage.icon}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${colors.text}`}>{stage.label}</p>
                  <p className="text-xs text-muted-foreground">{count} items</p>
                </div>
              </div>
              {idx < PIPELINE_STAGES.length - 1 && (
                <ArrowRight size={16} className="text-muted-foreground/40 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Pipeline Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0">
        {PIPELINE_STAGES.map((stage) => {
          const colors = stageColorMap[stage.color];
          const items = getStageItems(stage.key);

          return (
            <div key={stage.key} className="min-w-[260px] flex-1">
              <div className={`rounded-2xl border ${colors.border} bg-card/50 overflow-hidden`}>
                {/* Stage Header */}
                <div className={`p-3 border-b ${colors.border} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                    <span className={`text-sm font-semibold ${colors.text}`}>{stage.label}</span>
                  </div>
                  <span className={`text-xs font-bold ${colors.text} ${colors.bg} px-2 py-0.5 rounded-lg`}>
                    {items.length}
                  </span>
                </div>

                {/* Stage Items */}
                <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">No items</p>
                  ) : (
                    items.slice(0, 10).map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-3 bg-card border border-border/50 rounded-xl hover:border-neon-cyan/30 hover:shadow-glow transition-all cursor-pointer group"
                      >
                        {stage.key === 'leads' || stage.key === 'qualified' ? (
                          <>
                            <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.company || item.email}</p>
                            {item.phone && (
                              <p className="text-xs text-muted-foreground mt-1">{item.phone}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.year} {item.make} {item.model}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.serial || `ID: ${item.id}`}
                            </p>
                            {item.listing_price && (
                              <p className="text-xs font-semibold text-neon-green mt-1">
                                ${Number(item.listing_price).toLocaleString()}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    ))
                  )}
                  {items.length > 10 && (
                    <p className="text-xs text-center text-muted-foreground py-2">
                      +{items.length - 10} more
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
};

export default Pipeline;
