import React, { useState, useRef } from 'react';
import Navbar from '../components/ui/Navbar';
import { resumeService } from '../services/api';
import { Upload, FileText, Loader2, CheckCircle, AlertTriangle, Zap, Target, TrendingUp, Award } from 'lucide-react';

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    if (f.type !== 'application/pdf') { setError('Please upload a PDF file.'); return; }
    if (f.size > 5 * 1024 * 1024) { setError('File size must be under 5MB.'); return; }
    setFile(f);
    setError('');
    setAnalysis(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('resume', file);
      const res = await resumeService.analyze(fd);
      setAnalysis(res.data.analysis);
    } catch (e) {
      setError(e.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (s) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = (s) => s >= 80 ? 'bg-emerald-500/10 border-emerald-500/20' : s >= 60 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-bold text-white mb-2">AI Resume Analyzer</h1>
          <p className="text-white/40 max-w-xl mx-auto">Upload your resume and get instant AI-powered feedback on skills, gaps, and improvements.</p>
        </div>

        {/* Upload area */}
        <div
          className={`glass-card mb-6 border-2 border-dashed transition-all duration-200 cursor-pointer ${
            dragging ? 'border-violet-500/60 bg-violet-500/10' : file ? 'border-emerald-500/40' : 'border-white/20 hover:border-violet-500/40'
          }`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}>
          <input ref={fileRef} type="file" accept=".pdf" className="hidden"
            onChange={e => handleFile(e.target.files[0])} />
          <div className="text-center py-8">
            {file ? (
              <>
                <FileText className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <p className="text-white font-semibold">{file.name}</p>
                <p className="text-white/40 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/60 font-medium">Drop your resume PDF here</p>
                <p className="text-white/30 text-sm mt-1">or click to browse · Max 5MB</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {file && !analysis && (
          <div className="text-center mb-8">
            <button onClick={handleAnalyze} disabled={loading} className="btn-primary flex items-center gap-2 mx-auto">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing with AI...</> : <><Zap className="w-5 h-5" /> Analyze Resume</>}
            </button>
          </div>
        )}

        {analysis && (
          <div className="space-y-6">
            {/* Score & Level */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className={`glass-card border text-center ${scoreBg(analysis.overallScore)}`}>
                <div className={`text-4xl font-bold font-display mb-1 ${scoreColor(analysis.overallScore)}`}>{analysis.overallScore}</div>
                <div className="text-white/60 text-sm">Resume Score /100</div>
              </div>
              <div className="glass-card text-center">
                <div className="text-2xl font-bold text-white font-display mb-1">{analysis.experienceLevel}</div>
                <div className="text-white/40 text-sm">Experience Level</div>
              </div>
              <div className="glass-card">
                <p className="text-white/40 text-xs mb-2">Suggested Roles</p>
                <div className="flex flex-wrap gap-1">
                  {(analysis.suggestedRoles || []).map(r => (
                    <span key={r} className="px-2 py-1 bg-violet-500/10 text-violet-300 text-xs rounded-lg">{r}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card">
              <p className="text-white/80 text-sm leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Skills */}
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: 'Technical Skills', items: analysis.extractedSkills?.technical, color: 'violet' },
                { title: 'Soft Skills', items: analysis.extractedSkills?.soft, color: 'cyan' },
                { title: 'Tools & Frameworks', items: analysis.extractedSkills?.tools, color: 'green' },
              ].map(({ title, items, color }) => (
                <div key={title} className="glass-card">
                  <h3 className="text-white font-semibold text-sm mb-3">{title}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {(items || []).map(s => (
                      <span key={s} className={`px-2 py-1 text-xs rounded-lg bg-${color}-500/10 text-${color}-300 border border-${color}-500/20`}>{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="glass-card">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-white font-semibold">Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {(analysis.strengths || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Gaps */}
              <div className="glass-card">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-white font-semibold">Skill Gaps</h3>
                </div>
                <ul className="space-y-2">
                  {(analysis.gaps || []).map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />{s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Missing Skills */}
            <div className="glass-card">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-red-400" />
                <h3 className="text-white font-semibold">Missing Skills to Add</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {(analysis.missingSkills || []).map(s => (
                  <span key={s} className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-lg">{s}</span>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div className="glass-card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-violet-400" />
                <h3 className="text-white font-semibold">Section-by-Section Improvements</h3>
              </div>
              <div className="space-y-3">
                {(analysis.improvements || []).map((imp, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-violet-400 text-xs font-semibold">{imp.section}</span>
                    <p className="text-white/70 text-sm mt-1">{imp.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button onClick={() => { setFile(null); setAnalysis(null); }} className="btn-secondary">
                Analyze Another Resume
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
