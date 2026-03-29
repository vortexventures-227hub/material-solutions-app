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
import { SlidersHorizontal, Mail, Phone, Users } from 'lucide-react';

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
    if (score >= 80) return 'text-red-500 font-bold';
    if (score >= 50) return 'text-orange-500 font-semibold';
    if (score >= 20) return 'text-amber-500';
    return 'text-muted-foreground';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-red-50 dark:bg-red-950/30';
    if (score >= 50) return 'bg-orange-50 dark:bg-orange-950/30';
    if (score >= 20) return 'bg-amber-50 dark:bg-amber-950/30';
    return 'bg-muted';
  };

  const getStatusBadge = (status) => {
    const colors = {
      new: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
      contacted: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400',
      engaged: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
      qualified: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
      hot: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
      converted: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
      lost: 'bg-gray-100 dark:bg-gray-800/50 text-gray-500',
    };
    return colors[status] || 'bg-blue-50 text-blue-600';
  };

  return (
    <Layout>
      <PageHeader
        title="Leads"
        description={`${loading ? 'Loading...' : `${pagination.total} leads found`}`}
      >
        <div className="flex items-center gap-2 w-full sm:w-auto">
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
            <label htmlFor="leads-filter" className="text-sm font-medium text-muted-foreground">Filter:</label>
            <select
              id="leads-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-border/60 bg-card rounded-xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all min-h-[44px] w-full sm:w-auto cursor-pointer"
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
        <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-border/50 shadow-premium">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">No leads yet</h3>
          <p className="text-muted-foreground max-w-sm mx-auto text-sm">Leads will appear here as potential buyers express interest in your equipment.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {leads.map((lead) => (
              <Card key={lead.id} className="active:scale-[0.97] transition-all select-none touch-manipulation cursor-pointer hover:shadow-premium-hover">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{lead.name}</h3>
                      {lead.company && <p className="text-xs text-muted-foreground mt-0.5">{lead.company}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm tabular-nums w-8 h-8 rounded-lg flex items-center justify-center ${getScoreColor(lead.score)} ${getScoreBg(lead.score)}`}>
                        {lead.score}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm text-muted-foreground">
                    {lead.email && (
                      <div className="flex items-center gap-2 truncate">
                        <Mail size={13} className="text-muted-foreground/60 flex-shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-muted-foreground/60 flex-shrink-0" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
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
                  <TableRow className="bg-muted/30 border-b border-border/50">
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Company</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="text-center font-semibold">Score</TableHead>
                    <TableHead className="text-center font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">{lead.name}</TableCell>
                      <TableCell className="text-muted-foreground">{lead.company || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{lead.email || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{lead.phone || '-'}</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs tabular-nums ${getScoreColor(lead.score)} ${getScoreBg(lead.score)}`}>
                          {lead.score}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${getStatusBadge(lead.status)}`}>
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
