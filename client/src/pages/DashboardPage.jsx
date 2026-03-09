import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/ui/Navbar';
import { interviewService, reportService } from '../services/api';
import { Plus, TrendingUp, Clock, Award, ChevronRight, BarChart3, Target, Brain } from 'lucide-react';

const roleColors = {
  'Frontend Developer': 'text-cyan-400 bg-cyan-500/10',
  'Backend Developer': 'text-green-400 bg-green-500/10',
  'Full Stack Developer': 'text-violet-400 bg-violet-500/10',
  'Data Scientist': 'text-orange-400 bg-orange-500/10',
  'AI Engineer': 'text-pink-400 bg-pink-500/10',
  'DevOps Engineer': 'text-yellow-400 bg-yellow-500/10',
  'Mobile Developer': 'text-blue-400 bg-blue-500/10',
};

const statusColors = {
  completed: 'text-emerald-400 bg-emerald-500/10',
  'in-progress': 'text-yellow-400 bg-yellow-500/10',
  abandoned: 'text-red-400 bg-red-500/10',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, completed: 0, avgScore: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await interviewService.getAll({ limit: 6 });
        const all = res.data.interviews;
        setInterviews(all);
        const completed = all.filter(i => i.status === 'completed');
        const avgScore = completed.length
          ? completed.reduce((s, i) => s + (i.score?.overallScore || 0), 0) / completed.length
          : 0;
        setStats({ total: res.data.pagination.total, completed: completed.length, avgScore: Math.round(avgScore * 10) / 10 });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="stat-card">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-white font-display">{value}</div>
      <div className="text-white/40 text-sm mt-1">{label}</div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-white/40 mt-1">Ready to practice? Your next opportunity awaits.</p>
          </div>
          <Link to="/interview/new" className="btn-primary flex items-center gap-2 self-start">
            <Plus className="w-5 h-5" /> New Interview
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Target} label="Total Interviews" value={stats.total} color="bg-violet-500/10 text-violet-400" />
          <StatCard icon={Award} label="Completed" value={stats.completed} color="bg-emerald-500/10 text-emerald-400" />
          <StatCard icon={TrendingUp} label="Avg. Score" value={stats.avgScore ? `${stats.avgScore}/10` : '—'} color="bg-cyan-500/10 text-cyan-400" />
          <StatCard icon={BarChart3} label="Success Rate" value={stats.total ? `${Math.round((stats.completed / stats.total) * 100)}%` : '—'} color="bg-orange-500/10 text-orange-400" />
        </div>

        {/* Quick start cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link to="/interview/new" className="glass-card group hover:bg-violet-500/10 border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 hover:-translate-y-1">
            <Brain className="w-8 h-8 text-violet-400 mb-3" />
            <h3 className="text-white font-semibold mb-1">Technical Interview</h3>
            <p className="text-white/40 text-sm">Practice coding & system design questions</p>
            <div className="flex items-center gap-1 text-violet-400 text-sm mt-3 group-hover:gap-2 transition-all">
              Start now <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
          <Link to="/interview/new" className="glass-card group hover:bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1">
            <Target className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-white font-semibold mb-1">HR Interview</h3>
            <p className="text-white/40 text-sm">Master behavioral and culture fit questions</p>
            <div className="flex items-center gap-1 text-cyan-400 text-sm mt-3 group-hover:gap-2 transition-all">
              Start now <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
          <Link to="/resume" className="glass-card group hover:bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1">
            <Award className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="text-white font-semibold mb-1">Resume Analysis</h3>
            <p className="text-white/40 text-sm">Get AI feedback on your resume</p>
            <div className="flex items-center gap-1 text-emerald-400 text-sm mt-3 group-hover:gap-2 transition-all">
              Analyze <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Recent Interviews */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Interviews</h2>
            <Link to="/history" className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : interviews.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">No interviews yet. Start your first one!</p>
              <Link to="/interview/new" className="btn-primary mt-4 inline-flex items-center gap-2">
                <Plus className="w-4 h-4" /> Start Interview
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {interviews.map((interview) => (
                <div key={interview._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded-lg text-xs font-medium ${roleColors[interview.role] || 'text-white/60 bg-white/10'}`}>
                      {interview.role?.split(' ')[0]}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{interview.role}</p>
                      <p className="text-white/40 text-xs">{interview.difficulty} · {interview.type} · {new Date(interview.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {interview.status === 'completed' && interview.score?.overallScore != null && (
                      <span className="text-white font-bold text-sm">{interview.score.overallScore}/10</span>
                    )}
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[interview.status]}`}>
                      {interview.status}
                    </span>
                    {interview.status === 'completed' && (
                      <Link to={`/results/${interview._id}`}
                        className="text-violet-400 hover:text-violet-300 text-xs flex items-center gap-1">
                        Report <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                    {interview.status === 'in-progress' && (
                      <Link to={`/interview/${interview._id}`}
                        className="text-yellow-400 hover:text-yellow-300 text-xs flex items-center gap-1">
                        Resume <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
