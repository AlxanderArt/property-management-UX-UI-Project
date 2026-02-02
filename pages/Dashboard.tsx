
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { DashboardStats } from '../types';

interface DashboardProps {
  stats: DashboardStats;
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const chartData = [
    { name: 'Jan', amount: 8200 },
    { name: 'Feb', amount: 9500 },
    { name: 'Mar', amount: 11200 },
    { name: 'Apr', amount: stats.totalMonthlyRevenue },
  ];

  const occupancyData = [
    { name: 'Leased', value: stats.occupiedProperties },
    { name: 'Ready', value: stats.vacantProperties },
  ];

  // Safe occupancy calculation to avoid division by zero
  const occupancyRate = stats.totalProperties > 0
    ? Math.round((stats.occupiedProperties / stats.totalProperties) * 100)
    : 0;

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Portfolio Summary</h2>
          <p className="text-slate-500 mt-2 font-medium">Monitoring {stats.totalProperties} high-value assets across your region.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 sm:px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500">
            Download Report
          </button>
          <button className="px-4 sm:px-5 py-2.5 bg-[#0F172A] text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-indigo-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500">
            View Analytics
          </button>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
        <StatCard title="Total Assets" value={stats.totalProperties} subtitle="Active units" icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" color="indigo" />
        <StatCard title="Portfolio Value" value={`$${(stats.totalMonthlyRevenue * 12).toLocaleString()}`} subtitle="Annual projected" icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" color="emerald" />
        <StatCard title="Occupancy" value={`${occupancyRate}%`} subtitle="Target 98%" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" color="blue" />
        <StatCard title="Collections" value={stats.pendingPayments} subtitle="Actions required" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Advanced Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 gap-4">
            <div>
              <h3 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight">Revenue Dynamics</h3>
              <p className="text-sm text-slate-400 font-medium">Trailing 4 months performance</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-emerald-100 self-start">
              +14.2% Growth
            </div>
          </div>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 600}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 600}} width={50} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  itemStyle={{ color: '#0F172A', fontWeight: 800 }}
                  labelStyle={{ color: '#64748B', fontWeight: 600, marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#revenueGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Chart */}
        <div className="bg-[#0F172A] p-6 sm:p-8 rounded-[24px] sm:rounded-[32px] shadow-2xl text-white">
          <h3 className="font-black text-lg sm:text-xl tracking-tight mb-2">Asset Status</h3>
          <p className="text-slate-400 text-sm mb-8 sm:mb-10 font-medium">Real-time occupancy metrics</p>

          <div className="h-48 sm:h-64 mb-6 sm:mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11, fontWeight: 700}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px' }} />
                <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={40}>
                  {occupancyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10B981' : '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true"></div>
                <span className="text-sm font-bold text-slate-300">Active Leases</span>
              </div>
              <span className="font-black">{stats.occupiedProperties}</span>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" aria-hidden="true"></div>
                <span className="text-sm font-bold text-slate-300">Pending Vacancy</span>
              </div>
              <span className="font-black">{stats.vacantProperties}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, color }: { title: string; value: string | number; subtitle: string; icon: string; color: string }) => {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-600 text-white shadow-indigo-200',
    emerald: 'bg-emerald-600 text-white shadow-emerald-200',
    blue: 'bg-blue-600 text-white shadow-blue-200',
    amber: 'bg-amber-500 text-white shadow-amber-200'
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-[20px] sm:rounded-[28px] shadow-sm border border-slate-100 flex flex-col items-start gap-3 sm:gap-4 transition-all hover:shadow-xl hover:-translate-y-1">
      <div className={`${colors[color]} p-2.5 sm:p-3 rounded-xl sm:rounded-2xl`}>
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={icon} />
        </svg>
      </div>
      <div>
        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{title}</p>
        <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">{value}</p>
        <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-wider">{subtitle}</p>
      </div>
    </div>
  );
};

export default Dashboard;
