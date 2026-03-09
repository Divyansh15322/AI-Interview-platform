import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import { reportService } from '../services/api';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Download, Trophy, TrendingUp, AlertTriangle, BookOpen, Brain, CheckCircle, XCircle, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const ScoreCircle = ({ score, label, color }) => {
  const pct = (score / 10) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDash = (pct / 100) * circumference;
  const colorMap = { violet: '#8b5cf6', cyan: '#22d3ee', green: '#10b981', orange: '#f59e0b' };
  const clr = colorMap[color] || colorMap.violet;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
        <circle cx="55" cy="55" r="45" fill="none" stroke={clr} strokeWidth="8"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round" transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
        <text x="55" y="51" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="Syne">{score}</text>
        <text x="55" y="67" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="11">/10</text>
      </svg>
      <span className="text-white/60 text-sm font-medium">{label}</span>
    </div>
  );
};

export default function ResultsPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState(null);

  useEffect(() => {
    reportService.getByInterviewId(id)
      .then(r => { setReport(r.data.report); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const downloadPDF = () => {
    import('jspdf').then(({ default: jsPDF }) => {
      const doc = new jsPDF();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('InterviewAI - Performance Report', 20, 25);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Role: ${report.role}`, 20, 40);
      doc.text(`Difficulty: ${report.difficulty} | Type: ${report.type}`, 20, 48);
      doc.text(`Date: ${new Date(report.completedAt).toLocaleDateString()}`, 20, 56);
      doc.line(20, 62, 190, 62);
      doc.setFont('helvetica', 'bold');
      doc.text('Scores', 20, 72);
      doc.setFont('helvetica', 'normal');
      doc.text(`Overall: ${report.scores.overallScore}/10`, 20, 82);
      doc.text(`Technical: ${report.scores.technicalScore}/10`, 20, 90);
      doc.text(`Communication: ${report.scores.communicationScore}/10`, 20, 98);
      doc.text(`Problem Solving: ${report.scores.problemSolvingScore}/10`, 20, 106);
      doc.line(20, 112, 190, 112);
      doc.setFont('helvetica', 'bold');
      doc.text('AI Feedback', 20, 122);
      doc.setFont('helvetica', 'normal');
      const feedbackLines = doc.splitTextToSize(report.aiFeedback || '', 170);
      doc.text(feedbackLines, 20, 132);
      let y = 132 + (feedbackLines.length * 7);
      doc.setFont('helvetica', 'bold');
      doc.text('Strengths', 20, y + 10);
      doc.setFont('helvetica', 'normal');
      (report.strengths || []).forEach((s, i) => doc.text(`• ${s}`, 20, y + 20 + (i * 8)));
      y += 20 + (report.strengths?.length || 0) * 8;
      doc.setFont('helvetica', 'bold');
      doc.text('Areas for Improvement', 20, y + 10);
      doc.setFont('helvetica', 'normal');
      (report.weaknesses || []).forEach((s, i) => doc.text(`• ${s}`, 20, y + 20 + (i * 8)));
      doc.save(`InterviewAI_Report_${report.role.replace(/ /g, '_')}.pdf`);
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!report) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-white/60">Report not found.</p>
      <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
    </div>
  );

  const radarData = [
    { subject: 'Technical', score: report.scores.technicalScore },
    { subject: 'Communication', score: report.scores.communicationScore },
    { subject: 'Problem Solving', score: report.scores.problemSolvingScore },
  ];

  const overallScore = report.scores.overallScore;
  const getGrade = (s) => s >= 9 ? { label: 'Exceptional', color: 'text-emerald-400' } : s >= 7 ? { label: 'Strong Hire', color: 'text-green-400' } : s >= 5 ? { label: 'Potential Hire', color: 'text-yellow-400' } : { label: 'Needs Work', color: 'text-red-400' };
  const grade = getGrade(overallScore);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h1 className="text-3xl font-display font-bold text-white">Interview Complete!</h1>
            </div>
            <p className="text-white/40">{report.role} · {report.difficulty} · {report.type}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={downloadPDF} className="btn-secondary flex items-center gap-2">
              <Download className="w-4 h-4" /> Download PDF
            </button>
            <Link to="/interview/new" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Interview
            </Link>
          </div>
        </div>

        {/* Overall score banner */}
        <div className="glass-card mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-cyan-600/5" />
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <ScoreCircle score={overallScore} label="Overall Score" color="violet" />
            <div>
              <div className={`text-2xl font-bold font-display mb-1 ${grade.color}`}>{grade.label}</div>
              <p className="text-white/60 text-sm max-w-lg leading-relaxed">{report.aiFeedback}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Score breakdown */}
          <div className="glass-card">
            <h2 className="text-lg font-semibold text-white mb-6">Score Breakdown</h2>
            <div className="flex justify-around">
              <ScoreCircle score={report.scores.technicalScore} label="Technical" color="cyan" />
              <ScoreCircle score={report.scores.communicationScore} label="Communication" color="green" />
              <ScoreCircle score={report.scores.problemSolvingScore} label="Problem Solving" color="orange" />
            </div>
          </div>

          {/* Radar chart */}
          <div className="glass-card">
            <h2 className="text-lg font-semibold text-white mb-4">Performance Radar</h2>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="glass-card">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Strengths</h2>
            </div>
            <ul className="space-y-2">
              {(report.strengths || []).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="glass-card">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-white">Areas to Improve</h2>
            </div>
            <ul className="space-y-2">
              {(report.weaknesses || []).map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-white/70 text-sm">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        <div className="glass-card mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-violet-400" />
            <h2 className="text-lg font-semibold text-white">Recommended Study Topics</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(report.recommendations || []).map((r, i) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm">
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Question Breakdown */}
        {report.questionBreakdown && report.questionBreakdown.length > 0 && (
          <div className="glass-card">
            <h2 className="text-lg font-semibold text-white mb-4">Question-by-Question Breakdown</h2>
            <div className="space-y-3">
              {report.questionBreakdown.map((q, i) => (
                <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-violet-400 text-sm font-medium">Q{i + 1}</span>
                      <span className="text-white/80 text-sm text-left">{q.question.slice(0, 80)}...</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-sm font-bold ${q.score >= 7 ? 'text-emerald-400' : q.score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {q.score}/10
                      </span>
                      {expandedQ === i ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                    </div>
                  </button>
                  {expandedQ === i && (
                    <div className="px-4 pb-4 space-y-3 border-t border-white/10">
                      <div>
                        <p className="text-white/40 text-xs mb-1">Question</p>
                        <p className="text-white/80 text-sm">{q.question}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">Your Answer</p>
                        <p className="text-white/70 text-sm bg-white/5 rounded-lg p-3">{q.answer || 'No answer provided'}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">AI Feedback</p>
                        <p className="text-white/70 text-sm">{q.feedback}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
