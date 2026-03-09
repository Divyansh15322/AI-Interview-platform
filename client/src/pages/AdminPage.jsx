import React, { useEffect, useState } from 'react';
import Navbar from '../components/ui/Navbar';
import { adminService } from '../services/api';
import { Users, BarChart3, Trophy, Trash2, Loader2, Shield, Activity, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [tab, setTab] = useState('overview');

  const load = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers()
      ]);
      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    setDeleting(userId);
    try {
      await adminService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (e) {
      alert('Failed to delete user.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const roleChartData = (stats?.roleStats || []).map(r => ({
    name: r._id?.split(' ')[0] || 'Unknown',
    count: r.count
  }));

  const COLORS = ['#8b5cf6', '#22d3ee', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#a78bfa'];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/40">Platform analytics and user management</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[{ id: 'overview', label: 'Overview', icon: BarChart3 }, { id: 'users', label: 'Users', icon: Users }, { id: 'activity', label: 'Recent Activity', icon: Activity }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.id ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
              }`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Users, label: 'Total Users', value: stats?.totalUsers, color: 'violet' },
                { icon: BarChart3, label: 'Total Interviews', value: stats?.totalInterviews, color: 'cyan' },
                { icon: Trophy, label: 'Completed', value: stats?.completedInterviews, color: 'green' },
                { icon: TrendingUp, label: 'Avg Score', value: stats?.avgOverallScore ? `${stats.avgOverallScore}/10` : '—', color: 'orange' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="glass-card">
                  <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 text-${color}-400 flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold text-white font-display">{value ?? '—'}</div>
                  <div className="text-white/40 text-sm mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Role distribution chart */}
            {roleChartData.length > 0 && (
              <div className="glass-card">
                <h2 className="text-lg font-semibold text-white mb-4">Interviews by Role</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={roleChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'white' }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {roleChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-card">
                <h3 className="text-white font-semibold mb-2">Completion Rate</h3>
                <div className="text-4xl font-bold font-display text-violet-400">{stats?.completionRate}%</div>
                <div className="mt-3 h-2 bg-white/10 rounded-full">
                  <div className="h-full bg-violet-500 rounded-full" style={{ width: `${stats?.completionRate}%` }} />
                </div>
              </div>
              <div className="glass-card">
                <h3 className="text-white font-semibold mb-2">Total Reports</h3>
                <div className="text-4xl font-bold font-display text-cyan-400">{stats?.totalReports}</div>
                <p className="text-white/40 text-sm mt-2">Generated performance reports</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="glass-card">
            <h2 className="text-lg font-semibold text-white mb-4">Registered Users ({users.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Name', 'Email', 'Interviews', 'Avg Score', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-2 text-white/40 text-sm font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-violet-500/20 rounded-full flex items-center justify-center text-xs text-violet-400 font-bold">
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span className="text-white text-sm">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-white/60 text-sm">{u.email}</td>
                      <td className="py-3 px-2 text-white/60 text-sm">{u.totalInterviews || 0}</td>
                      <td className="py-3 px-2 text-white/60 text-sm">{u.averageScore ? `${u.averageScore}/10` : '—'}</td>
                      <td className="py-3 px-2 text-white/40 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-2">
                        <button onClick={() => handleDelete(u._id)} disabled={deleting === u._id}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50">
                          {deleting === u._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'activity' && (
          <div className="glass-card">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Completed Interviews</h2>
            <div className="space-y-3">
              {(stats?.recentInterviews || []).map((iv) => (
                <div key={iv._id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <p className="text-white text-sm font-medium">{iv.userId?.name || 'Unknown'}</p>
                    <p className="text-white/40 text-xs">{iv.role} · {iv.difficulty} · {new Date(iv.completedAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm">{iv.score?.overallScore}/10</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
