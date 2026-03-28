// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { SkeletonKPICard, SkeletonActivityCard } from '../components/SkeletonCard';

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const response = await api.get('/api/dashboard/kpis');
        setKpis(response.data);
      } catch (err) {
        console.error('Error fetching KPIs:', err);
        addToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchKPIs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="animate-pulse">
              <div className="h-8 w-40 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-64 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonKPICard key={i} />
            ))}
          </div>
          <div className="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <SkeletonActivityCard />
            <SkeletonActivityCard />
          </div>
        </div>
      </div>
    );
  }

  // Empty / getting started state
  const isEmpty = !kpis || (kpis.totalInventory === 0 && kpis.totalLeads === 0);

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Welcome! Let's get started.</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Getting Started</h2>
            <p className="text-gray-500">Complete these steps to start managing your equipment sales.</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/intake')}
              className="w-full bg-white rounded-xl shadow-card hover:shadow-card-hover p-5 flex items-center gap-4 transition-all text-left focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Add Your First Equipment</h3>
                <p className="text-sm text-gray-500">Upload photos and let AI auto-fill the details.</p>
              </div>
              <svg className="w-5 h-5 text-gray-500 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => navigate('/inventory')}
              className="w-full bg-white rounded-xl shadow-card hover:shadow-card-hover p-5 flex items-center gap-4 transition-all text-left focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Inventory</h3>
                <p className="text-sm text-gray-500">View, price, and list your equipment for sale.</p>
              </div>
              <svg className="w-5 h-5 text-gray-500 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => navigate('/leads')}
              className="w-full bg-white rounded-xl shadow-card hover:shadow-card-hover p-5 flex items-center gap-4 transition-all text-left focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Track Your Leads</h3>
                <p className="text-sm text-gray-500">Monitor buyer interest and close deals faster.</p>
              </div>
              <svg className="w-5 h-5 text-gray-500 ml-auto flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: 'Total Inventory',
      value: kpis?.totalInventory || 0,
      icon: '🚜',
      gradient: 'from-brand-500 to-brand-600',
      change: '+2 this week',
      changeType: 'positive'
    },
    {
      label: 'Listed Units',
      value: kpis?.listedUnits || 0,
      icon: '✅',
      gradient: 'from-green-500 to-green-600',
      change: `${kpis?.listedUnits || 0} available`,
      changeType: 'neutral'
    },
    {
      label: 'Total Revenue',
      value: `$${(kpis?.totalRevenue || 0).toLocaleString()}`,
      icon: '💰',
      gradient: 'from-purple-500 to-purple-600',
      change: '+12% vs last month',
      changeType: 'positive'
    },
    {
      label: 'Active Leads',
      value: kpis?.totalLeads || 0,
      icon: '👥',
      gradient: 'from-accent-500 to-accent-600',
      change: `${kpis?.hotLeads || 0} hot`,
      changeType: 'positive'
    },
    {
      label: 'Avg Deal Size',
      value: kpis?.avgSalePrice ? `$${Math.round(kpis.avgSalePrice).toLocaleString()}` : '$0',
      icon: '📈',
      gradient: 'from-brand-400 to-brand-600',
      change: '+8% vs avg',
      changeType: 'positive'
    },
    {
      label: 'Conversion Rate',
      value: kpis?.conversionRate ? `${kpis.conversionRate}%` : '0%',
      icon: '🎯',
      gradient: 'from-accent-400 to-accent-600',
      change: 'Industry avg: 2.5%',
      changeType: 'neutral'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's your sales overview.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {kpiCards.map((kpi, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Gradient Header */}
              <div className={`h-2 bg-gradient-to-r ${kpi.gradient}`}></div>

              {/* Content */}
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-3 lg:mb-4">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${kpi.gradient} rounded-lg flex items-center justify-center text-xl lg:text-2xl shadow-md`}>
                    {kpi.icon}
                  </div>

                  {/* Change Badge */}
                  <span className={`
                    text-xs font-medium px-2 py-1 rounded-full
                    ${kpi.changeType === 'positive'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-50 text-gray-600'
                    }
                  `}>
                    {kpi.change}
                  </span>
                </div>

                <h3 className="text-sm font-medium text-gray-500 mb-1">{kpi.label}</h3>
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">{kpi.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="mt-6 lg:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Recent Listings */}
          <div className="bg-white rounded-xl shadow-card p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">Recent Listings</h2>
              <button
                onClick={() => navigate('/inventory')}
                className="text-sm text-brand-600 hover:text-brand-500 font-medium min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
              >
                View All →
              </button>
            </div>

            <div className="space-y-2 lg:space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors min-h-[56px]">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    🚜
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">2018 Raymond Reach Truck</p>
                    <p className="text-xs text-gray-500">Listed 2 hours ago</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600 flex-shrink-0">$28,500</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hot Leads */}
          <div className="bg-white rounded-xl shadow-card p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base lg:text-lg font-semibold text-gray-900">Hot Leads</h2>
              <button
                onClick={() => navigate('/leads')}
                className="text-sm text-brand-600 hover:text-brand-500 font-medium min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-brand-500 rounded"
              >
                View All →
              </button>
            </div>

            <div className="space-y-2 lg:space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors min-h-[56px]">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    JD
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                    <p className="text-xs text-gray-500">ABC Logistics</p>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <span className="text-xs font-medium px-2 py-1 bg-red-50 text-red-700 rounded-full">
                      Hot
                    </span>
                    <span className="text-xs text-gray-500">85</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 lg:mt-8 bg-gradient-to-r from-brand-500 to-brand-600 rounded-xl shadow-lg p-4 lg:p-6 text-white">
          <h2 className="text-lg lg:text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
            <button
              onClick={() => navigate('/intake')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all duration-200 backdrop-blur-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-600"
            >
              <div className="text-2xl lg:text-3xl mb-2">📸</div>
              <p className="text-sm font-medium">Add Inventory</p>
            </button>
            <button
              onClick={() => navigate('/leads')}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all duration-200 backdrop-blur-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-600"
            >
              <div className="text-2xl lg:text-3xl mb-2">👤</div>
              <p className="text-sm font-medium">New Lead</p>
            </button>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all duration-200 backdrop-blur-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-600">
              <div className="text-2xl lg:text-3xl mb-2">📊</div>
              <p className="text-sm font-medium">Reports</p>
            </button>
            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition-all duration-200 backdrop-blur-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand-600">
              <div className="text-2xl lg:text-3xl mb-2">⚙️</div>
              <p className="text-sm font-medium">Settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
