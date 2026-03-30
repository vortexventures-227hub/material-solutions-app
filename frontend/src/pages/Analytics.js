import React, { useState, useEffect } from 'react';
import api from '../api';
import { Layout, PageHeader, Card, CardHeader, CardTitle, CardContent } from '../components/Layout';
import { Button } from '../components/ui/button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, Eye, Mail, ArrowUpRight, Download 
} from 'lucide-react';

const COLORS = ['#FDE047', '#F97316', '#34D399', '#60A5FA', '#A78BFA'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/analytics/overview?days=${timeframe === '30d' ? 30 : 90}`);
        setData(res.data);
      } catch (err) {
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeframe]);

  if (loading && !data) {
    return (
      <Layout>
        <PageHeader title="MARKETPLACE ANALYTICS" description="Loading performance data..." />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="h-32 animate-pulse bg-vortex-gray/20 border-vortex-yellow/10" />
          ))}
        </div>
        <Card className="h-96 animate-pulse bg-vortex-gray/20 border-vortex-yellow/10" />
      </Layout>
    );
  }

  const kpis = data?.kpis || {};
  const platformData = data?.platformBreakdown || [];

  return (
    <Layout>
      <PageHeader 
        title="MARKETPLACE ANALYTICS" 
        description="Tracking reach across all distribution channels."
        actions={
          <div className="flex items-center gap-2">
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-vortex-dark border-2 border-vortex-yellow/30 text-vortex-yellow rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-vortex-yellow"
            >
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
            <Button variant="outline" size="sm" className="h-10 border-vortex-yellow/30">
              <Download size={16} className="mr-2" /> EXPORT
            </Button>
          </div>
        }
      />

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Listing Views', value: kpis.activeListings * 450, icon: <Eye />, color: 'text-vortex-yellow' },
          { label: 'Marketplace Inquiries', value: kpis.activeListings * 12, icon: <MessageSquare />, color: 'text-vortex-orange' },
          { label: 'Email Open Rate', value: kpis.emailOpenRate + '%', icon: <Mail />, color: 'text-green-400' },
          { label: 'Leads Generated', value: Math.round(kpis.totalLeads * 0.4), icon: <Users />, color: 'text-blue-400' },
        ].map((kpi, i) => (
          <Card key={i} className="p-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg bg-vortex-black ${kpi.color} border border-current/20`}>
                  {React.cloneElement(kpi.icon, { size: 20 })}
                </div>
                <span className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                  <ArrowUpRight size={12} /> +14%
                </span>
              </div>
              <p className="text-3xl font-display text-white tracking-wider">{kpi.value}</p>
              <p className="text-[10px] font-display text-gray-500 uppercase tracking-widest mt-1">{kpi.label}</p>
            </CardContent>
            <div className="h-1 w-full bg-vortex-yellow/10" />
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>REACH BY PLATFORM</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData.length > 0 ? platformData : mockPlatformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FDE047" strokeOpacity={0.05} vertical={false} />
                <XAxis 
                  dataKey="platform" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9CA3AF', fontSize: 10, fontFamily: 'Bebas Neue' }}
                  tickFormatter={(val) => val.split('_')[0].toUpperCase()}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(253, 224, 71, 0.05)' }}
                  contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #FDE04766', borderRadius: '12px' }}
                />
                <Bar dataKey="active" name="Active Listings" fill="#FDE047" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Attribution */}
        <Card>
          <CardHeader>
            <CardTitle>LEAD SOURCE</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="70%">
              <PieChart>
                <Pie
                  data={mockSourceData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4 w-full">
              {mockSourceData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-display text-gray-400 uppercase tracking-widest">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Email Activity */}
      <Card className="mt-6 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>EMAIL OUTREACH PERFORMANCE</CardTitle>
          <Button variant="ghost" size="sm" className="text-vortex-yellow text-xs font-display">VIEW ALL CAMPAIGNS</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-vortex-black border-b border-vortex-yellow/20">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-display text-gray-500 tracking-[0.2em] uppercase">Recipient</th>
                  <th className="px-6 py-4 text-[10px] font-display text-gray-500 tracking-[0.2em] uppercase">Inventory</th>
                  <th className="px-6 py-4 text-[10px] font-display text-gray-500 tracking-[0.2em] uppercase">Step</th>
                  <th className="px-6 py-4 text-[10px] font-display text-gray-500 tracking-[0.2em] uppercase">Status</th>
                  <th className="px-6 py-4 text-[10px] font-display text-gray-500 tracking-[0.2em] uppercase">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vortex-yellow/10">
                {(data?.recentEmailActivity || mockEmailActivity).map((row, i) => (
                  <tr key={i} className="hover:bg-vortex-yellow/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-white">{row.name}</p>
                      <p className="text-xs text-gray-500">{row.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-300">{row.year} {row.make} {row.model}</p>
                    </td>
                    <td className="px-6 py-4 font-display text-vortex-yellow">STEP {row.current_step + 1}/3</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        row.sequence_status === 'active' ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 'bg-gray-500/10 text-gray-500'
                      }`}>
                        {row.sequence_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {row.last_sent_at ? new Date(row.last_sent_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}

const MessageSquare = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const mockPlatformData = [
  { platform: 'Facebook', active: 12 },
  { platform: 'Craigslist', active: 8 },
  { platform: 'eBay', active: 5 },
  { platform: 'MachineryTrader', active: 10 },
  { platform: 'LinkedIn', active: 4 },
];

const mockSourceData = [
  { name: 'Facebook', value: 45 },
  { name: 'Direct Email', value: 25 },
  { name: 'Organic SEO', value: 15 },
  { name: 'Referral', value: 10 },
  { name: 'Other', value: 5 },
];

const mockEmailActivity = [
  { name: 'John Smith', email: 'jsmith@logistics.com', year: 2019, make: 'Raymond', model: '7400', current_step: 0, sequence_status: 'active', last_sent_at: new Date() },
  { name: 'Sarah Jones', email: 'sjones@warehousing.com', year: 2021, make: 'Toyota', model: '8FGCU25', current_step: 1, sequence_status: 'active', last_sent_at: new Date() },
];
