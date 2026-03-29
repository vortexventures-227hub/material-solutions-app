// frontend/src/pages/Leads.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { SkeletonLeadRow, SkeletonLeadCard } from '../components/SkeletonCard';
import FilterBottomSheet from '../components/FilterBottomSheet';
import { Layout, PageHeader } from '../components/Layout';
import { Card, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { SlidersHorizontal } from 'lucide-react';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, hasNext: false, hasPrev: false });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { addToast } = useToast();

  const statusOptions = [
    { value: '', label: 'All Status', icon: '🔍' },
    { value: 'new', label: 'New', icon: '🆕' },
    { value: 'contacted', label: 'Contacted', icon: '📞' },
    { value: 'engaged', label: 'Engaged', icon: '🗣️' },
    { value: 'qualified', label: 'Qualified', icon: '🌟' },
    { value: 'hot', label: 'Hot', icon: '🔥' },
    { value: 'converted', label: 'Converted', icon: '💸' },
    { value: 'lost', label: 'Lost', icon: '❌' },
  ];

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page, limit: 25 });
        if (filter) params.set('status', filter);
        const response = await api.get(`/api/leads?${params}`);
        const { data, total, totalPages, hasNext, hasPrev } = response.data;
        setLeads(data);
        setPagination({ total, totalPages, hasNext, hasPrev });
      } catch (err) {
        console.error('Error fetching leads:', err);
        addToast('Failed to load leads', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [filter, page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-red-600 font-bold';
    if (score >= 50) return 'text-orange-600 font-semibold';
    if (score >= 20) return 'text-yellow-600';
    return 'text-muted-foreground';
  };

  const getStatusBadge = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-purple-100 text-purple-800',
      engaged: 'bg-indigo-100 text-indigo-800',
      qualified: 'bg-green-100 text-green-800',
      hot: 'bg-red-100 text-red-800',
      converted: 'bg-emerald-100 text-emerald-800',
      lost: 'bg-muted text-muted-foreground',
    };
    return colors[status] || 'bg-blue-100 text-blue-800';
  };

  return (
    <Layout>
      <PageHeader 
        title="Leads" 
        description={`${loading ? 'Loading...' : `${pagination.total} leads found`}`}
      >
        <div className="flex items-center gap-2 w-full sm:w-auto">
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
            <label htmlFor="leads-filter" className="text-sm font-medium">Filter:</label>
            <select
              id="leads-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-input bg-background rounded-lg text-sm focus:ring-2 focus:ring-primary transition-all min-h-[44px] w-full sm:w-auto cursor-pointer"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </PageHeader>

      {loading ? (
        <div className="space-y-4">
          <div className="md:hidden space-y-3">
            {[1, 2, 3, 4].map((i) => <SkeletonLeadCard key={i} />)}
          </div>
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => <SkeletonLeadRow key={i} />)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-xl border border-dashed border-border shadow-sm">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="text-xl font-semibold mb-2">No leads yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">Leads will appear here as potential buyers express interest in your equipment.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {leads.map((lead) => (
              <Card key={lead.id} className="active:scale-95 transition-transform select-none touch-manipulation cursor-pointer" onClick={() => {/* potentially open lead detail modal */}}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold">{lead.name}</h3>
                      {lead.company && <p className="text-sm text-muted-foreground">{lead.company}</p>}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg ${getScoreColor(lead.score)}`}>{lead.score}</span>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    {lead.email && <div className="truncate"><span className="text-muted-foreground mr-2">✉️</span> {lead.email}</div>}
                    {lead.phone && <div><span className="text-muted-foreground mr-2">📱</span> {lead.phone}</div>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <Card className="hidden md:block overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell className="text-muted-foreground">{lead.company || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{lead.email || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{lead.phone || '-'}</TableCell>
                      <TableCell className={`text-center ${getScoreColor(lead.score)}`}>{lead.score}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(lead.status)}`}>
                          {lead.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {!loading && leads.length > 0 && (
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

      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Leads Filter"
        options={statusOptions}
        value={filter}
        onChange={setFilter}
      />
    </Layout>
  );
};

export default Leads;
