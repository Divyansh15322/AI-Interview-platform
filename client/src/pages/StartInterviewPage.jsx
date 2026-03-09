import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import { interviewService } from '../services/api';
import { Brain, Loader2, ChevronRight, Zap, Code, Users, Server, BarChart2, Cpu, Smartphone, GitBranch } from 'lucide-react';

const roles = [
  { id: 'Frontend Developer', label: 'Frontend Developer', icon: Code, color: 'cyan', desc: 'React, Vue, CSS, JS' },
  { id: 'Backend Developer', label: 'Backend Developer', icon: Server, color: 'green', desc: 'Node, Python, APIs, DBs' },
  { id: 'Full Stack Developer', label: 'Full Stack', icon: GitBranch, color: 'violet', desc: 'End-to-end development' },
  { id: 'Data Scientist', label: 'Data Scientist', icon: BarChart2, color: 'orange', desc: 'ML, statistics, Python' },
  { id: 'AI Engineer', label: 'AI Engineer', icon: Cpu, color: 'pink', desc: 'LLMs, neural nets, MLOps' },
  { id: 'DevOps Engineer', label: 'DevOps Engineer', icon: Zap, color: 'yellow', desc: 'CI/CD, Docker, K8s' },
  { id: 'Mobile Developer', label: 'Mobile Developer', icon: Smartphone, color: 'blue', desc: 'React Native, Flutter' },
];

const difficulties = [
  { id: 'Easy', label: 'Easy', desc: 'Junior level · Fundamentals', color: 'emerald' },
  { id: 'Medium', label: 'Medium', desc: 'Mid-level · Intermediate concepts', color: 'yellow' },
  { id: 'Hard', label: 'Hard', desc: 'Senior level · Advanced topics', color: 'red' },
];

const types = [
  { id: 'Technical', label: 'Technical', desc: 'Coding, algorithms, concepts', icon: Code },
  { id: 'HR', label: 'HR / Behavioral', desc: 'Culture fit, past experiences', icon: Users },
  { id: 'System Design', label: 'System Design', desc: 'Architecture & scalability', icon: Server },
  { id: 'Behavioral', label: 'Behavioral', desc: 'STAR method scenarios', icon: Brain },
];

const questionCounts = [3, 5, 7, 10];

const colorMap = {
  cyan: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
  green: 'border-green-500/40 bg-green-500/10 text-green-400',
  violet: 'border-violet-500/40 bg-violet-500/10 text-violet-400',
  orange: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
  pink: 'border-pink-500/40 bg-pink-500/10 text-pink-400',
  yellow: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
  blue: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
  red: 'border-red-500/40 bg-red-500/10 text-red-400',
};

export default function StartInterviewPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ role: '', difficulty: '', type: '', totalQuestions: 5 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    if (!form.role || !form.difficulty || !form.type) {
      setError('Please select all options before starting.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await interviewService.create(form);
      navigate(`/interview/${res.data.interview._id}`);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create interview. Try again.');
      setLoading(false);
    }
  };

  const SelectCard = ({ item, field, colorKey }) => {
    const isSelected = form[field] === item.id;
    const Icon = item.icon;
    const clr = colorMap[colorKey || item.color] || colorMap.violet;
    return (
      <button
        onClick={() => setForm({ ...form, [field]: item.id })}
        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
          isSelected
            ? `${clr} shadow-lg`
            : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/10'
        }`}>
        <div className="flex items-start gap-3">
          {Icon && <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isSelected ? '' : 'text-white/30'}`} />}
          <div>
            <div className={`font-semibold text-sm ${isSelected ? '' : 'text-white'}`}>{item.label}</div>
            {item.desc && <div className="text-xs mt-0.5 opacity-60">{item.desc}</div>}
          </div>
          {isSelected && <div className="ml-auto w-2 h-2 bg-current rounded-full mt-1.5 flex-shrink-0" />}
        </div>
      </button>
    );
  };

  const isReady = form.role && form.difficulty && form.type;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-bold text-white mb-2">Configure Your Interview</h1>
          <p className="text-white/40">Customize your practice session to match your target role.</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Step 1: Role */}
          <div className="glass-card">
            <h2 className="text-lg font-semibold text-white mb-1">1. Select Job Role</h2>
            <p className="text-white/40 text-sm mb-4">What position are you interviewing for?</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {roles.map(r => <SelectCard key={r.id} item={r} field="role" />)}
            </div>
          </div>

          {/* Step 2: Difficulty */}
          <div className="glass-card">
            <h2 className="text-lg font-semibold text-white mb-1">2. Difficulty Level</h2>
            <p className="text-white/40 text-sm mb-4">Choose based on your experience level.</p>
            <div className="grid sm:grid-cols-3 gap-3">
              {difficulties.map(d => <SelectCard key={d.id} item={d} field="difficulty" />)}
            </div>
          </div>

          {/* Step 3: Type */}
          <div className="glass-card">
            <h2 className="text-lg font-semibold text-white mb-1">3. Interview Type</h2>
            <p className="text-white/40 text-sm mb-4">What kind of questions do you want?</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {types.map(t => <SelectCard key={t.id} item={t} field="type" />)}
            </div>
          </div>

          {/* Step 4: Question count */}
          <div className="glass-card">
            <h2 className="text-lg font-semibold text-white mb-1">4. Number of Questions</h2>
            <p className="text-white/40 text-sm mb-4">How long should the interview be?</p>
            <div className="flex gap-3 flex-wrap">
              {questionCounts.map(n => (
                <button key={n}
                  onClick={() => setForm({ ...form, totalQuestions: n })}
                  className={`px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                    form.totalQuestions === n
                      ? 'border-violet-500/40 bg-violet-500/10 text-violet-400'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
                  }`}>
                  {n} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Summary & Start */}
          {isReady && (
            <div className="glass-card border-violet-500/20 bg-violet-500/5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold mb-1">Ready to start!</h3>
                  <p className="text-white/40 text-sm">
                    {form.role} · {form.difficulty} · {form.type} · {form.totalQuestions} questions
                  </p>
                </div>
                <button onClick={handleStart} disabled={loading}
                  className="btn-primary flex items-center gap-2 whitespace-nowrap">
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating questions...</>
                  ) : (
                    <>Start Interview <ChevronRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
