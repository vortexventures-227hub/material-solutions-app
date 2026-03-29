// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { SkeletonKPICard, SkeletonActivityCard } from '../components/SkeletonCard';
import { LocalBusinessSchema } from '../components/SEO';
import { Layout, PageHeader, Grid } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

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
      <Layout>
        <div className="animate-pulse">
          <div className="h-10 w-48 bg-muted rounded mb-4" />
          <div className="h-4 w-72 bg-muted rounded mb-8" />
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
    { label: 'Total Inventory', value: kpis?.totalInventory || 0, icon: '🚜', change: '+2 this week', type: 'positive' },
    { label: 'Listed Units', value: kpis?.listedUnits || 0, icon: '✅', change: `${kpis?.listedUnits || 0} available`, type: 'neutral' },
    { label: 'Total Revenue', value: `$${(kpis?.totalRevenue || 0).toLocaleString()}`, icon: '💰', change: '+12% vs last month', type: 'positive' },
    { label: 'Active Leads', value: kpis?.totalLeads || 0, icon: '👥', change: `${kpis?.hotLeads || 0} hot`, type: 'positive' },
    { label: 'Avg Deal Size', value: kpis?.avgSalePrice ? `$${Math.round(kpis.avgSalePrice).toLocaleString()}` : '$0', icon: '📈', change: '+8% vs avg', type: 'positive' },
    { label: 'Conversion Rate', value: kpis?.conversionRate ? `${kpis.conversionRate}%` : '0%', icon: '🎯', change: 'Industry avg: 2.5%', type: 'neutral' },
  ];

  return (
    <Layout>
      <LocalBusinessSchema />
      <PageHeader 
        title="Dashboard" 
        description="Welcome back! Here's your sales overview."
      >
        <Button variant="brand" onClick={() => navigate('/intake')}>
          📸 Add Equipment
        </Button>
      </PageHeader>

      <Grid cols={3} mobile={2}>
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="overflow-hidden active:scale-95 transition-all cursor-pointer select-none touch-manipulation" onClick={() => navigate('/inventory')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <div className="text-2xl">{kpi.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className={`text-xs mt-1 ${kpi.type === 'positive' ? 'text-green-600' : 'text-muted-foreground'}`}>
                {kpi.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </Grid>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Listings</CardTitle>
            <Button variant="link" onClick={() => navigate('/inventory')}>View All →</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-xl">🚜</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">2018 Raymond Reach Truck</p>
                  <p className="text-xs text-muted-foreground">Listed 2 hours ago</p>
                </div>
                <span className="text-sm font-semibold text-green-600">$28,500</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Hot Leads</CardTitle>
            <Button variant="link" onClick={() => navigate('/leads')}>View All →</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">JD</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">John Doe</p>
                  <p className="text-xs text-muted-foreground">ABC Logistics</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full">Hot</span>
                  <span className="text-xs text-muted-foreground">85</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8 bg-brand-600 text-white border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-5 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white flex flex-col gap-2 rounded-2xl active:scale-95 transition-all shadow-lg" onClick={() => navigate('/intake')}>
              <span className="text-3xl">📸</span>
              <span className="font-bold">Add Inventory</span>
            </Button>
            <Button variant="outline" className="h-auto py-5 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white flex flex-col gap-2 rounded-2xl active:scale-95 transition-all shadow-lg" onClick={() => navigate('/leads')}>
              <span className="text-3xl">👤</span>
              <span className="font-bold">New Lead</span>
            </Button>
            <Button variant="outline" className="h-auto py-5 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white flex flex-col gap-2 rounded-2xl active:scale-95 transition-all shadow-lg">
              <span className="text-3xl">📊</span>
              <span className="font-bold">Reports</span>
            </Button>
            <Button variant="outline" className="h-auto py-5 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white flex flex-col gap-2 rounded-2xl active:scale-95 transition-all shadow-lg" onClick={() => navigate('/settings')}>
              <span className="text-3xl">⚙️</span>
              <span className="font-bold">Settings</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default Dashboard;
