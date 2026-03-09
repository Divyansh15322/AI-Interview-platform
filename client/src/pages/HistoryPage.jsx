import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import { interviewService } from '../services/api';
import { ChevronRight, Brain, Plus, Filter } from 'lucide-react';

const statusColors = {
  completed: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  'in-progress': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  abandoned: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function HistoryPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await interviewService.getAll({ page, limit: 10 });
        setInterviews(res.data.interviews);
        setPagination(res.data.pagination);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page]);

  const filtered = filter === 'all' ? interviews : interviews.filter(i => i.status === filter);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">Interview History</h1>
            <p className="text-white/40 mt-1">{pagination.total || 0} total interviews</p>
          </div>
          <Link to="/interview/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Interview
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'completed', 'in-progress', 'abandoned'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                filter === f ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
              }`}>
              {f === 'all' ? 'All' : f.replace('-', ' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 glass-card">
            <Brain className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/40 text-lg">No interviews found</p>
            <Link to="/interview/new" className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Start Your First Interview
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(iv => (
              <div key={iv._id} className="glass-card hover:bg-white/10 transition-all duration-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-violet-500/10 border border-violet-500/20 rounded-xl flex items-center justify-center">
                      <Brain className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold truncate">{iv.role}</p>
                      <p className="text-white/40 text-sm">{iv.difficulty} · {iv.type} · {new Date(iv.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {iv.status === 'completed' && iv.score?.overallScore != null && (
                      <div className="text-center">
                        <div className="text-white font-bold">{iv.score.overallScore}/10</div>
                        <div className="text-white/30 text-xs">Score</div>
                      </div>
                    )}
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusColors[iv.status]}`}>
                      {iv.status.replace('-', ' ')}
                    </span>
                    {iv.status === 'completed' ? (
                      <Link to={`/results/${iv._id}`} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1">
                        Report <ChevronRight className="w-3 h-3" />
                      </Link>
                    ) : iv.status === 'in-progress' ? (
                      <Link to={`/interview/${iv._id}`} className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1">
                        Resume <ChevronRight className="w-3 h-3" />
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(pagination.pages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  page === i + 1 ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 text-white/50 hover:text-white'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
