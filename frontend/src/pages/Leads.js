import React, { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { SkeletonLeadRow, SkeletonLeadCard } from '../components/SkeletonCard';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const url = filter
          ? `/api/leads?status=${filter}`
          : '/api/leads';
        const response = await api.get(url);
        setLeads(response.data);
      } catch (err) {
        console.error('Error fetching leads:', err);
        addToast('Failed to load leads', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-red-600 font-bold';
    if (score >= 50) return 'text-orange-600 font-semibold';
    if (score >= 20) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getStatusBadge = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-purple-100 text-purple-800',
      engaged: 'bg-indigo-100 text-indigo-800',
      qualified: 'bg-green-100 text-green-800',
      hot: 'bg-red-100 text-red-800',
      converted: 'bg-emerald-100 text-emerald-800',
      lost: 'bg-gray-100 text-gray-600',
    };
    return colors[status] || 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Leads</h2>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter leads by status"
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-base sm:text-sm min-h-[44px]"
            >
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="engaged">Engaged</option>
              <option value="qualified">Qualified</option>
              <option value="hot">Hot</option>
              <option value="converted">Converted</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {loading ? (
          <>
            {/* Mobile skeleton */}
            <div className="md:hidden space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonLeadCard key={i} />
              ))}
            </div>
            {/* Desktop skeleton */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow-card overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 lg:px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-4 lg:px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonLeadRow key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : leads.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No leads yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Leads will appear here as potential buyers express interest in your equipment.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card Layout (below md) */}
            <div className="md:hidden space-y-3">
              {leads.map((lead) => (
                <div key={lead.id} className="bg-white rounded-xl shadow-card p-4 active:scale-[0.98] transition-transform">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{lead.name}</h3>
                      {lead.company && (
                        <p className="text-sm text-gray-500">{lead.company}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-lg ${getScoreColor(lead.score)}`}>{lead.score}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    {lead.email && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 w-5">✉️</span>
                        <a href={`mailto:${lead.email}`} className="text-brand-600 truncate">{lead.email}</a>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-500 w-5">📱</span>
                        <a href={`tel:${lead.phone}`} className="text-brand-600">{lead.phone}</a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table Layout (md and up) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full bg-white rounded-xl shadow-card overflow-hidden">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 lg:px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-4 lg:px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4 text-sm font-medium text-gray-900">{lead.name}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-600">{lead.company || '-'}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-600">{lead.email || '-'}</td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-600">{lead.phone || '-'}</td>
                      <td className={`px-4 lg:px-6 py-4 text-sm text-center ${getScoreColor(lead.score)}`}>
                        {lead.score}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(lead.status)}`}>
                          {lead.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leads;
