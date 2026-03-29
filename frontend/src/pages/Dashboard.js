// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SkeletonKPICard, SkeletonActivityCard } from '../components/SkeletonCard';
import { LocalBusinessSchema } from '../components/SEO';
import { Layout, PageHeader, Grid } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Package, CheckCircle2, DollarSign, Users, TrendingUp, Target, Camera, UserPlus, BarChart3, Settings, ArrowUpRight, Truck, GitBranch } from 'lucide-react';

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const firstName = user?.name?.split(' ')[0] || 'Chris';

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

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-10 w-48 bg-muted rounded-xl mb-4" />
          <div className="h-4 w-72 bg-muted rounded-lg mb-8" />
          <Grid cols={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonKPICard key={i} />
            ))}
          </Grid>
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonActivityCard />
            <SkeletonActivityCard />
          </div>
        </div>
      </Layout>
    );
  }

  const kpiCards = [
    {
      label: 'Total Inventory',
      value: kpis?.totalInventory || 0,
      icon: <Package size={20} />,
      iconBg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-500',
      change: '+2 this week',
      type: 'positive'
    },
    {
      label: 'Listed Units',
      value: kpis?.listedUnits || 0,
      icon: <CheckCircle2 size={20} />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500',
      change: `${kpis?.listedUnits || 0} available`,
      type: 'neutral'
    },
    {
      label: 'Total Revenue',
      value: `$${(kpis?.totalRevenue || 0).toLocaleString()}`,
      icon: <DollarSign size={20} />,
      iconBg: 'bg-green-50 dark:bg-green-950/30 text-green-500',
      change: '+12% vs last month',
      type: 'positive'
    },
    {
      label: 'Active Leads',
      value: kpis?.totalLeads || 0,
      icon: <Users size={20} />,
      iconBg: 'bg-violet-50 dark:bg-violet-950/30 text-violet-500',
      change: `${kpis?.hotLeads || 0} hot`,
      type: 'positive'
    },
    {
      label: 'Avg Deal Size',
      value: kpis?.avgSalePrice ? `$${Math.round(kpis.avgSalePrice).toLocaleString()}` : '$0',
      icon: <TrendingUp size={20} />,
      iconBg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-500',
      change: '+8% vs avg',
      type: 'positive'
    },
    {
      label: 'Conversion Rate',
      value: kpis?.conversionRate ? `${kpis.conversionRate}%` : '0%',
      icon: <Target size={20} />,
      iconBg: 'bg-rose-50 dark:bg-rose-950/30 text-rose-500',
      change: 'Industry avg: 2.5%',
      type: 'neutral'
    },
  ];

  return (
    <Layout>
      <LocalBusinessSchema />
      <PageHeader
        title="Dashboard"
        description={`Welcome Back ${firstName}. Here's your sales overview.`}
      >
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/pipeline')} className="gap-2">
            <GitBranch size={16} />
            Pipeline
          </Button>
          <Button variant="brand" onClick={() => navigate('/intake')} className="gap-2">
            <Camera size={16} />
            Add Equipment
          </Button>
        </div>
      </PageHeader>

      <Grid cols={3} mobile={2}>
        {kpiCards.map((kpi, index) => (
          <Card
            key={index}
            className="group overflow-hidden hover:shadow-premium-hover active:scale-[0.97] transition-all duration-300 cursor-pointer select-none touch-manipulation"
            onClick={() => navigate('/inventory')}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                  {kpi.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">{kpi.value}</div>
              <p className={`text-xs mt-1.5 font-medium ${kpi.type === 'positive' ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                {kpi.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </Grid>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold">Recent Listings</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/inventory')} className="text-brand-500 gap-1 hover:text-brand-600">
              View All <ArrowUpRight size={14} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors -mx-1">
                <div className="w-11 h-11 bg-muted rounded-xl flex items-center justify-center">
                  <Truck size={18} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">2018 Raymond Reach Truck</p>
                  <p className="text-xs text-muted-foreground">Listed 2 hours ago</p>
                </div>
                <span className="text-sm font-semibold text-emerald-500">$28,500</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold">Hot Leads</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/leads')} className="text-brand-500 gap-1 hover:text-brand-600">
              View All <ArrowUpRight size={14} />
            </Button>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors -mx-1">
                <div className="w-10 h-10 bg-gradient-to-br from-neon-cyan to-neon-purple text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-sm shadow-neon-cyan/20">
                  JD
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">John Doe</p>
                  <p className="text-xs text-muted-foreground">ABC Logistics</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-red-50 dark:bg-red-950/30 text-red-500 rounded-lg">Hot</span>
                  <span className="text-xs font-bold text-muted-foreground tabular-nums">85</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8 bg-gradient-to-br from-[#0F172A] via-[#1a1f3a] to-[#0F172A] text-white border border-neon-cyan/20 shadow-xl shadow-neon-cyan/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-neon-cyan/[0.08] via-neon-purple/[0.04] to-transparent" />
        <CardHeader className="relative">
          <CardTitle className="text-white text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <Camera size={22} />, label: 'Add Inventory', onClick: () => navigate('/intake') },
              { icon: <UserPlus size={22} />, label: 'New Lead', onClick: () => navigate('/leads') },
              { icon: <BarChart3 size={22} />, label: 'Reports', onClick: () => {} },
              { icon: <Settings size={22} />, label: 'Settings', onClick: () => navigate('/settings') },
            ].map((action, i) => (
              <button
                key={i}
                onClick={action.onClick}
                className="flex flex-col items-center gap-2.5 py-5 px-3 bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.1] rounded-2xl transition-all duration-200 active:scale-[0.95] backdrop-blur-sm"
              >
                <span className="opacity-90">{action.icon}</span>
                <span className="text-sm font-semibold opacity-90">{action.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Dashboard;
