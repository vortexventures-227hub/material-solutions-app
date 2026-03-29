import React, { useState, useEffect } from 'react';
import { Layout, PageHeader, Grid } from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

// Mock data for David conversations
const MOCK_CONVERSATIONS = [
  {
    id: 'conv-001',
    leadName: 'Sarah Mitchell',
    company: 'ABC Logistics',
    email: 'sarah@abclogistics.com',
    phone: '+1-555-0123',
    status: 'qualified',
    priority: 'high',
    lastMessage: "Yes, we're looking for 3 reach trucks for our Newark warehouse. Budget is around $45,000-$50,000. Can we schedule a call with Bill?",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
    messages: 12,
    source: 'Website Chat'
  },
  {
    id: 'conv-002',
    leadName: 'Mike Johnson',
    company: 'Johnson Distribution',
    email: 'mike@johnsondist.com',
    phone: '+1-555-0456',
    status: 'active',
    priority: 'medium',
    lastMessage: "Thanks for the quote on the Raymond 7500. Let me run it by my manager and get back to you.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 mins ago
    messages: 8,
    source: 'Website Chat'
  },
  {
    id: 'conv-003',
    leadName: 'Lisa Chen',
    company: 'Premier Warehouse Co',
    email: 'lchen@premierwarehouse.com',
    phone: '+1-555-0789',
    status: 'handoff',
    priority: 'high',
    lastMessage: "Lisa is ready to buy. She needs 2 reach trucks, budget $30k-$35k per unit. She can come in tomorrow for viewing.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    messages: 23,
    source: 'Phone Intake'
  },
  {
    id: 'conv-004',
    leadName: 'Tom Rodriguez',
    company: 'FastFreight Inc',
    email: 'trodriiguez@fastfreight.com',
    phone: '+1-555-0321',
    status: 'active',
    priority: 'low',
    lastMessage: "Just curious about rental options. Do you have anything for a 6-month project?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    messages: 5,
    source: 'Website Chat'
  },
  {
    id: 'conv-005',
    leadName: 'Amanda Foster',
    company: 'Foster Manufacturing',
    email: 'afoster@fostermfg.com',
    phone: '+1-555-0654',
    status: 'closed',
    priority: 'medium',
    lastMessage: "Thank you David! The Raymond Reach Truck is perfect for our needs. I've scheduled a visit with Bill for Thursday.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    messages: 18,
    source: 'Website Chat'
  }
];

const MOCK_METRICS = {
  totalConversations: 47,
  qualifiedLeads: 12,
  conversionRate: 25.5,
  avgResponseTime: '45s',
  activeChats: 3,
  handoffsPending: 2,
  closedDeals: 8
};

const MOCK_HANDOFFS = [
  {
    id: 'handoff-001',
    leadName: 'Lisa Chen',
    company: 'Premier Warehouse Co',
    phone: '+1-555-0789',
    interest: '2x Reach Trucks',
    budget: '$30k-$35k/unit',
    urgency: 'high',
    notes: 'Ready to buy. Can visit showroom Thursday. Prefers morning appointments.',
    assignedTo: 'Bill',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
  },
  {
    id: 'handoff-002',
    leadName: 'Robert Kim',
    company: 'Kim Supply Chain',
    phone: '+1-555-0246',
    interest: 'Swing Reach Truck',
    budget: '$70k-$80k',
    urgency: 'medium',
    notes: 'Expanding their facility. Needs swing reach for narrow aisle. Prefers Toyota.',
    assignedTo: 'Bill',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5)
  }
];

// Format relative time
const formatTimeAgo = (date) => {
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Status badge component
const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30',
    qualified: 'bg-neon-green/20 text-neon-green border-neon-green/30',
    handoff: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    closed: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.active}`}>
      {status}
    </span>
  );
};

// Priority badge
const PriorityBadge = ({ priority }) => {
  const styles = {
    high: 'bg-red-500/20 text-red-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    low: 'bg-green-500/20 text-green-400'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${styles[priority] || styles.medium}`}>
      {priority.toUpperCase()}
    </span>
  );
};

const David = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [conversations, setConversations] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [handoffs, setHandoffs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setConversations(MOCK_CONVERSATIONS);
      setMetrics(MOCK_METRICS);
      setHandoffs(MOCK_HANDOFFS);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <PageHeader title="David" description="AI Sales Agent Dashboard" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-neon-cyan">
            <span className="text-4xl">🤖</span>
            <p className="mt-2 text-sm">Loading David's dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader 
        title="David 🤖" 
        description="AI Sales Agent — Material Solutions"
      >
        <Button variant="outline" className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
          View All Conversations
        </Button>
      </PageHeader>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['overview', 'conversations', 'handoffs'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
              ${activeTab === tab
                ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 shadow-glow'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'handoffs' && handoffs.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[10px] font-bold">
                {handoffs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <Grid cols={4}>
            <MetricCard 
              label="Total Conversations" 
              value={metrics.totalConversations} 
              icon="💬"
              color="cyan"
            />
            <MetricCard 
              label="Qualified Leads" 
              value={metrics.qualifiedLeads} 
              icon="🎯"
              color="green"
            />
            <MetricCard 
              label="Conversion Rate" 
              value={`${metrics.conversionRate}%`} 
              icon="📈"
              color="purple"
            />
            <MetricCard 
              label="Avg Response" 
              value={metrics.avgResponseTime} 
              icon="⚡"
              color="yellow"
            />
          </Grid>

          {/* Secondary Metrics */}
          <Grid cols={3}>
            <MetricCard 
              label="Active Chats" 
              value={metrics.activeChats} 
              icon="🔥"
              color="orange"
              small
            />
            <MetricCard 
              label="Handoffs Pending" 
              value={metrics.handoffsPending} 
              icon="📋"
              color="yellow"
              small
            />
            <MetricCard 
              label="Closed Deals" 
              value={metrics.closedDeals} 
              icon="✅"
              color="green"
              small
            />
          </Grid>

          {/* Recent Activity */}
          <Card className="border-neon-cyan/20">
            <CardHeader>
              <CardTitle className="text-neon-cyan">Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {conversations.slice(0, 3).map((conv) => (
                  <ConversationRow key={conv.id} conversation={conv} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <div className="space-y-4">
          {conversations.map((conv) => (
            <Card key={conv.id} className="border-border/50 hover:border-neon-cyan/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-foreground">{conv.leadName}</span>
                      <StatusBadge status={conv.status} />
                      <PriorityBadge priority={conv.priority} />
                    </div>
                    <p className="text-sm text-muted-foreground">{conv.company}</p>
                    <p className="text-sm mt-2 line-clamp-2 text-foreground/80">
                      "{conv.lastMessage}"
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{formatTimeAgo(conv.timestamp)}</span>
                      <span>•</span>
                      <span>{conv.messages} messages</span>
                      <span>•</span>
                      <span>{conv.source}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                      View
                    </Button>
                    {conv.status === 'handoff' && (
                      <Button variant="brand" size="sm" className="bg-neon-green hover:bg-neon-green/80">
                        Call Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Handoffs Tab */}
      {activeTab === 'handoffs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Leads Ready for Human Follow-up</h2>
            <span className="text-sm text-muted-foreground">{handoffs.length} pending</span>
          </div>
          
          {handoffs.map((handoff) => (
            <Card key={handoff.id} className="border-yellow-500/30 bg-yellow-500/5">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">⚠️</span>
                      <span className="font-bold text-lg text-foreground">{handoff.leadName}</span>
                      <PriorityBadge priority={handoff.urgency} />
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{handoff.company}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Interest</p>
                        <p className="text-sm font-semibold text-foreground">{handoff.interest}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Budget</p>
                        <p className="text-sm font-semibold text-neon-green">{handoff.budget}</p>
                      </div>
                    </div>
                    
                    <div className="bg-card/50 rounded-lg p-3 border border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">David's Notes:</p>
                      <p className="text-sm text-foreground/90">{handoff.notes}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span>📞 {handoff.phone}</span>
                      <span>👤 Assigned to {handoff.assignedTo}</span>
                      <span>📅 {formatTimeAgo(handoff.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button variant="brand" className="bg-neon-cyan hover:bg-neon-cyan/80 shadow-glow">
                      📞 Call {handoff.leadName.split(' ')[0]}
                    </Button>
                    <Button variant="outline" className="border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10">
                      View Conversation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
};

// Metric Card Component
const MetricCard = ({ label, value, icon, color, small }) => {
  const colors = {
    cyan: 'border-neon-cyan/30 text-neon-cyan',
    green: 'border-neon-green/30 text-neon-green',
    purple: 'border-purple-500/30 text-purple-400',
    yellow: 'border-yellow-500/30 text-yellow-400',
    orange: 'border-orange-500/30 text-orange-400'
  };
  
  return (
    <Card className={`border ${colors[color]} ${small ? 'py-3' : ''}`}>
      <CardContent className={`${small ? 'py-3' : 'py-4'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`${small ? 'text-[10px]' : 'text-xs'} uppercase tracking-wider text-muted-foreground mb-1`}>
              {label}
            </p>
            <p className={`font-bold text-foreground ${small ? 'text-xl' : 'text-2xl'}`}>{value}</p>
          </div>
          <span className="text-2xl">{icon}</span>
        </div>
      </CardContent>
    </Card>
  );
};

// Conversation Row Component
const ConversationRow = ({ conversation }) => (
  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-white font-bold text-sm">
        {conversation.leadName.split(' ').map(n => n[0]).join('')}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground text-sm">{conversation.leadName}</span>
          <StatusBadge status={conversation.status} />
        </div>
        <p className="text-xs text-muted-foreground truncate max-w-[300px]">
          {conversation.lastMessage}
        </p>
      </div>
    </div>
    <span className="text-xs text-muted-foreground whitespace-nowrap">
      {formatTimeAgo(conversation.timestamp)}
    </span>
  </div>
);

export default David;
