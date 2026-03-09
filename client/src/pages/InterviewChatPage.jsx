import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { interviewService } from '../services/api';
import { Brain, Send, Mic, MicOff, Clock, ChevronRight, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

const QUESTION_TIME = 120; // seconds per question

export default function InterviewChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [answer, setAnswer] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionStart] = useState(Date.now());
  const [listening, setListening] = useState(false);
  const [voiceSupported] = useState('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const [lastEval, setLastEval] = useState(null);
  const chatRef = useRef(null);
  const textareaRef = useRef(null);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await interviewService.getById(id);
        const iv = res.data.interview;
        if (iv.status === 'completed') {
          navigate(`/results/${id}`);
          return;
        }
        setInterview(iv);
        const startQ = iv.currentQuestion || 0;
        setCurrentQ(startQ);
        // Build initial messages
        const msgs = [
          { role: 'ai', text: `Hello! I'm your AI interviewer today. We're doing a ${iv.difficulty} ${iv.type} interview for a ${iv.role} position. I'll ask you ${iv.totalQuestions} questions. Take your time to think before answering. Let's begin!`, type: 'intro' }
        ];
        // Add already-answered questions
        for (let i = 0; i < startQ; i++) {
          const q = iv.questions[i];
          msgs.push({ role: 'ai', text: q.question, type: 'question', qNum: i + 1 });
          if (q.answer) msgs.push({ role: 'user', text: q.answer });
          if (q.evaluation?.feedback) msgs.push({ role: 'ai', text: `✓ ${q.evaluation.feedback}`, type: 'feedback' });
        }
        if (startQ < iv.questions.length) {
          msgs.push({ role: 'ai', text: iv.questions[startQ].question, type: 'question', qNum: startQ + 1 });
        }
        setMessages(msgs);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!interview || loading || submitting || finishing) return;
    setTimeLeft(QUESTION_TIME);
    setQuestionStartTime(Date.now());
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // Auto-submit with current answer
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQ, interview, loading]);

  // Session duration tracker
  useEffect(() => {
    const t = setInterval(() => setSessionDuration(Math.round((Date.now() - sessionStart) / 1000)), 1000);
    return () => clearInterval(t);
  }, [sessionStart]);

  // Scroll chat
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (submitting || finishing) return;
    const finalAnswer = answer.trim() || (autoSubmit ? '[No answer provided - time expired]' : '');
    if (!finalAnswer && !autoSubmit) return;

    clearInterval(timerRef.current);
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    setSubmitting(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: finalAnswer || '[No answer - time expired]' }]);
    setAnswer('');

    try {
      const res = await interviewService.submitAnswer(id, {
        questionIndex: currentQ,
        answer: finalAnswer,
        timeTaken
      });
      const evaluation = res.data.evaluation;
      setLastEval(evaluation);

      // Show feedback
      const feedbackMsg = `Score: ${Math.round((evaluation.technicalScore + evaluation.communicationScore + evaluation.problemSolvingScore) / 3 * 10) / 10}/10 — ${evaluation.feedback}`;
      setMessages(prev => [...prev, { role: 'ai', text: feedbackMsg, type: 'feedback', eval: evaluation }]);

      const nextQ = currentQ + 1;

      if (nextQ >= interview.questions.length) {
        // Interview complete
        setTimeout(async () => {
          setMessages(prev => [...prev, { role: 'ai', text: 'Excellent! You\'ve completed all questions. Let me generate your comprehensive performance report...', type: 'completing' }]);
          setFinishing(true);
          try {
            await interviewService.complete(id, { duration: sessionDuration });
            navigate(`/results/${id}`);
          } catch (e) {
            console.error(e);
            setFinishing(false);
          }
        }, 1500);
      } else {
        // Next question
        setTimeout(() => {
          setCurrentQ(nextQ);
          const nextQuestion = interview.questions[nextQ];
          setMessages(prev => [...prev, { role: 'ai', text: nextQuestion.question, type: 'question', qNum: nextQ + 1 }]);
          setSubmitting(false);
        }, 1000);
      }
    } catch (e) {
      console.error(e);
      setSubmitting(false);
    }
  }, [answer, currentQ, id, interview, questionStartTime, sessionDuration, navigate, submitting, finishing]);

  // Voice input
  const toggleVoice = () => {
    if (!voiceSupported) return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      setAnswer(transcript);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setListening(true);
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const timerColor = timeLeft > 30 ? 'text-emerald-400' : timeLeft > 10 ? 'text-yellow-400' : 'text-red-400';

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40">Loading interview...</p>
      </div>
    </div>
  );

  if (!interview) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-400">Interview not found.</p>
    </div>
  );

  const progress = ((currentQ) / interview.totalQuestions) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="glass border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{interview.role}</p>
            <p className="text-white/40 text-xs">{interview.difficulty} · {interview.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Clock className="w-4 h-4 text-white/40" />
            <span className="text-white/40 font-mono text-xs">{formatTime(sessionDuration)}</span>
          </div>
          <div className={`font-mono font-bold text-lg ${timerColor} flex items-center gap-1`}>
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <div className="text-white/40 text-sm">
            {Math.min(currentQ + 1, interview.totalQuestions)}/{interview.totalQuestions}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/5">
        <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500"
          style={{ width: `${progress}%` }} />
      </div>

      {/* Chat area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 bg-violet-500/20 border border-violet-500/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Brain className="w-4 h-4 text-violet-400" />
              </div>
            )}
            <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
              {msg.type === 'question' && (
                <span className="text-violet-400 text-xs font-medium block mb-1">Question {msg.qNum}</span>
              )}
              {msg.type === 'feedback' && (
                <span className="text-emerald-400 text-xs font-medium block mb-1">
                  <CheckCircle2 className="w-3 h-3 inline mr-1" />AI Feedback
                </span>
              )}
              <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              {msg.eval && (
                <div className="flex gap-3 mt-3 pt-3 border-t border-white/10">
                  {[
                    { label: 'Technical', score: msg.eval.technicalScore },
                    { label: 'Communication', score: msg.eval.communicationScore },
                    { label: 'Problem Solving', score: msg.eval.problemSolvingScore },
                  ].map(({ label, score }) => (
                    <div key={label} className="text-center">
                      <div className="text-white font-bold text-sm">{score}/10</div>
                      <div className="text-white/40 text-xs">{label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {(submitting || finishing) && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 bg-violet-500/20 border border-violet-500/30 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-violet-400" />
            </div>
            <div className="chat-bubble-ai">
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="glass border-t border-white/10 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          {finishing ? (
            <div className="flex items-center justify-center gap-2 text-white/60 py-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating your performance report...
            </div>
          ) : (
            <div className="flex gap-3">
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Type your answer here... (Shift+Enter for new line, Enter to submit)"
                disabled={submitting}
                rows={3}
                className="input-field flex-1 resize-none text-sm"
              />
              <div className="flex flex-col gap-2">
                {voiceSupported && (
                  <button onClick={toggleVoice} disabled={submitting}
                    className={`p-3 rounded-xl border transition-all ${listening ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-white/5 border-white/20 text-white/60 hover:text-white'}`}>
                    {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
                <button onClick={() => handleSubmit()} disabled={submitting || !answer.trim()}
                  className="p-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-1 flex items-center justify-center">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
          <p className="text-white/20 text-xs mt-2 text-center">
            Question {Math.min(currentQ + 1, interview.totalQuestions)} of {interview.totalQuestions} · Time remaining: {formatTime(timeLeft)}
          </p>
        </div>
      </div>
    </div>
  );
}
