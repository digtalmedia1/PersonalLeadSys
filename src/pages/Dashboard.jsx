import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  Users, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import CalendarSidebar from '@/components/CalendarSidebar';
import { useNavigate } from 'react-router-dom';
import { getLeads } from '@/lib/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { title: 'סה"כ לידים', value: '0', change: '0%', trend: 'neutral', icon: Users, color: '#00D9FF' },
    { title: 'יחס המרה', value: '0%', change: '0%', trend: 'neutral', icon: Target, color: '#9D4EDD' },
    { title: 'הכנסות משוערות', value: '₪0', change: '0%', trend: 'neutral', icon: DollarSign, color: '#FF006E' },
    { title: 'לידים חדשים החודש', value: '0', change: '0%', trend: 'neutral', icon: Activity, color: '#FFA500' },
  ]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const leads = await getLeads();
      const currentMonth = new Date().toISOString().slice(0, 7);
      
      const totalLeads = leads.length;
      const totalValue = leads.reduce((acc, lead) => acc + (Number(lead.value) || 0), 0);
      const wonLeads = leads.filter(l => l.status === 'closed' || l.status === 'won').length;
      const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;
      const newLeadsThisMonth = leads.filter(l => l.created_at && l.created_at.startsWith(currentMonth)).length;

      setStats([
        { title: 'סה"כ לידים', value: totalLeads.toString(), change: '+12%', trend: 'up', icon: Users, color: '#00D9FF' },
        { title: 'יחס המרה', value: `${conversionRate}%`, change: '+0.4%', trend: 'up', icon: Target, color: '#9D4EDD' },
        { title: 'הכנסות משוערות', value: `₪${totalValue.toLocaleString()}`, change: '+18%', trend: 'up', icon: DollarSign, color: '#FF006E' },
        { title: 'לידים חדשים החודש', value: newLeadsThisMonth.toString(), change: '-2%', trend: 'down', icon: Activity, color: '#FFA500' },
      ]);

      // Get 5 most recent leads
      const sortedLeads = [...leads].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
      
      // Normalize data for display
      setRecentLeads(sortedLeads.map(l => ({
        id: l.id,
        name: l.contact_name || l.title || 'Unknown',
        source: l.source || 'General',
        time: getTimeAgo(l.created_at)
      })));

    } catch (e) {
      console.error('Error calculating dashboard stats', e);
      setError('שגיאה בטעינת הנתונים מהשרת.');
    }
    setLoading(false);
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);
    
    if (diffInMinutes < 60) return `לפני ${diffInMinutes} דקות`;
    if (diffInMinutes < 1440) return `לפני ${Math.floor(diffInMinutes / 60)} שעות`;
    return `לפני ${Math.floor(diffInMinutes / 1440)} ימים`;
  };

  return (
    <>
      <Helmet>
        <title>לוח בקרה - Empire Leads Hub</title>
      </Helmet>
      
      <div className="relative min-h-full font-rubik text-right" dir="rtl">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: `linear-gradient(#00D9FF 1px, transparent 1px), linear-gradient(90deg, #00D9FF 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
        />
        
        {/* Calendar Sidebar Integration */}
        <CalendarSidebar />

        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 relative z-10 md:mr-0 transition-all duration-300">
          <header className="mb-8">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#00D9FF] to-[#9D4EDD] tracking-tighter mb-2 drop-shadow-[0_0_10px_rgba(0,217,255,0.3)]">
              לוח בקרה ראשי
            </h1>
            <p className="text-[#00D9FF]/80 font-medium text-sm tracking-wide">
              סקירה כללית של ביצועי המערכת בזמן אמת.
            </p>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#050A18]/60 backdrop-blur-xl border border-[#00D9FF]/20 rounded-2xl p-6 relative overflow-hidden group hover:border-[#00D9FF] transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(0,217,255,0.1)]"
              >
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-xl transition-all group-hover:opacity-20" style={{ backgroundColor: stat.color }}></div>
                
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl bg-[#0A0E27] border border-white/5 shadow-inner">
                    <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'up' ? 'text-green-400 bg-green-400/10' : (stat.trend === 'down' ? 'text-red-400 bg-red-400/10' : 'text-gray-400 bg-gray-400/10')}`}>
                    {stat.change}
                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : (stat.trend === 'down' ? <ArrowDownRight className="w-3 h-3 mr-1" /> : null)}
                  </div>
                </div>
                
                <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
                <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Main Chart Area Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 bg-[#050A18]/60 backdrop-blur-xl border border-[#00D9FF]/20 rounded-2xl p-6 min-h-[400px]"
            >
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">מגמות מכירות</h3>
              <div className="h-64 flex items-center justify-center text-gray-500 border border-dashed border-gray-800 rounded-xl bg-[#0A0E27]/50">
                <TrendingUp className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-sm">גרף פעילות יוצג כאן</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-[#050A18]/60 backdrop-blur-xl border border-[#9D4EDD]/20 rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-white mb-6 border-b border-white/5 pb-4">פעילות אחרונה</h3>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-center text-gray-500 py-4">טוען נתונים...</p>
                ) : error ? (
                  <p className="text-center text-red-400 py-4">{error}</p>
                ) : recentLeads.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">אין לידים חדשים להצגה</p>
                ) : (
                  recentLeads.map((lead, i) => (
                    <div
                      key={lead.id || i}
                      onClick={() => navigate(`/leads/${lead.id}`)}
                      className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#00D9FF] to-[#9D4EDD] p-[1px]">
                        <div className="w-full h-full rounded-full bg-[#050A18] flex items-center justify-center text-xs font-bold text-white">
                          {lead.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-200 group-hover:text-[#00D9FF] transition-colors">{lead.name}</p>
                        <p className="text-xs text-gray-500">{lead.time} • מקור: {lead.source}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;