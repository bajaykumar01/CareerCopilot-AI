import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { resumeAPI, analysisAPI, interviewAPI } from '../services/api';
import { 
  Mic, MessageSquare, AlertCircle, ArrowRight, CheckCircle2, 
  Send, User, Sparkles, RefreshCw, Star, Play 
} from 'lucide-react';

const Interview = () => {
  const [resumeHistory, setResumeHistory] = useState([]);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedAnalysisId, setSelectedAnalysisId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [feedbacksList, setFeedbacksList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch histories on mount
  useEffect(() => {
    fetchHistories();
  }, []);

  const fetchHistories = async () => {
    try {
      const resResumes = await resumeAPI.getHistory();
      setResumeHistory(resResumes.data);
      if (resResumes.data.length > 0) {
        setSelectedResumeId(resResumes.data[0].id.toString());
      }

      const resAnalysis = await analysisAPI.getHistory();
      setAnalysisHistory(resAnalysis.data);
      if (resAnalysis.data.length > 0) {
        setSelectedAnalysisId(resAnalysis.data[0].id.toString());
      }
    } catch (err) {
      console.error("Failed to load histories:", err);
    }
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    if (!selectedResumeId || !selectedAnalysisId) {
      setError('Please ensure you have uploaded a resume and generated at least one analysis report.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // Find the job description ID associated with the selected analysis
      const analysisObj = analysisHistory.find(a => a.id === parseInt(selectedAnalysisId));
      if (!analysisObj) {
        throw new Error('Analysis report not found.');
      }
      
      const jobDescId = analysisObj.job_description_id;
      const res = await interviewAPI.createSession(parseInt(selectedResumeId), jobDescId);
      setSession(res.data);
      setCurrentQuestionIdx(0);
      setFeedback(null);
      setFeedbacksList([]);
      setAnswer('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to start interview session.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const currentQuestion = session.questions[currentQuestionIdx];
      const res = await interviewAPI.submitAnswer(
        session.id, 
        currentQuestion.id, 
        currentQuestion.question, 
        answer
      );
      setFeedback(res.data);
      setFeedbacksList([...feedbacksList, res.data]);
    } catch (err) {
      setError('Failed to submit answer for feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setAnswer('');
    setFeedback(null);
    setCurrentQuestionIdx(currentQuestionIdx + 1);
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Technical': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'HR': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Behavioral': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Project-based': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Scenario-based': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Mock Interview Board</h1>
          <p className="text-slate-400 text-sm mt-1">Practice responding to tailored role-specific questions and receive immediate technical accuracy reports.</p>
        </div>

        {/* Start Session Module */}
        {!session && (
          <div className="max-w-xl bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-8 backdrop-blur-sm space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-brand-400" />
              Configure Interview Parameters
            </h2>

            <form onSubmit={handleStartSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">Select Active Resume</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full bg-[#0B0F19]/80 border border-slate-850 text-xs text-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500"
                >
                  <option value="">-- Choose Resume --</option>
                  {resumeHistory.map((r) => (
                    <option key={r.id} value={r.id}>{r.filename} (Uploaded: {new Date(r.uploaded_at).toLocaleDateString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">Select Target Job Target Analysis</label>
                <select
                  value={selectedAnalysisId}
                  onChange={(e) => setSelectedAnalysisId(e.target.value)}
                  className="w-full bg-[#0B0F19]/80 border border-slate-850 text-xs text-slate-200 rounded-xl px-4 py-3 outline-none focus:border-brand-500"
                >
                  <option value="">-- Choose Analysis --</option>
                  {analysisHistory.map((a) => (
                    <option key={a.id} value={a.id}>Report #{a.id} (Score: {a.ats_score}% - Created: {new Date(a.created_at).toLocaleDateString()})</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 px-4 py-3 bg-red-950/20 border border-red-500/25 text-red-400 rounded-xl text-xs">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || resumeHistory.length === 0 || analysisHistory.length === 0}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4" />
                {loading ? 'Generating interview questions...' : 'Start Mock Interview Session'}
              </button>
            </form>
          </div>
        )}

        {/* Session Workspace */}
        {session && currentQuestionIdx < session.questions.length && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Box: Chat Panel */}
            <div className="lg:col-span-7 bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm flex flex-col justify-between min-h-[480px]">
              <div>
                {/* Progress bar */}
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-6">
                  <span>Progress Check</span>
                  <span>Question {currentQuestionIdx + 1} of {session.questions.length}</span>
                </div>
                
                {/* Question */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getCategoryColor(session.questions[currentQuestionIdx].category)}`}>
                      Category: {session.questions[currentQuestionIdx].category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 leading-relaxed">
                    "{session.questions[currentQuestionIdx].question}"
                  </h3>
                </div>
              </div>

              {/* Form Input Area */}
              <div className="mt-8 pt-6 border-t border-slate-850">
                {!feedback ? (
                  <form onSubmit={handleSubmitAnswer} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Answer Response</label>
                      <textarea
                        rows="5"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Type or dictate your detailed technical/behavioral answer here..."
                        className="w-full px-3.5 py-3 bg-[#0B0F19]/80 border border-slate-850 rounded-xl text-xs text-slate-200 outline-none focus:border-brand-500 transition resize-none"
                      ></textarea>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submitting || !answer.trim()}
                        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition"
                      >
                        <Send className="h-4 w-4" />
                        {submitting ? 'Evaluating answer...' : 'Submit Answer'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-center bg-[#0B0F19]/60 p-4 border border-slate-850 rounded-2xl">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="h-5 w-5" />
                      Answer Submitted. See AI Evaluation report on the right.
                    </div>
                    <button
                      onClick={handleNextQuestion}
                      className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition"
                    >
                      Next Question
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Box: Feedback Panel */}
            <div className="lg:col-span-5">
              {submitting ? (
                <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-8 text-center flex flex-col items-center justify-center backdrop-blur-sm h-full min-h-[400px]">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-800 border-t-brand-500"></div>
                  <h4 className="text-slate-350 font-bold mt-4">Evaluating accuracy...</h4>
                  <p className="text-[10px] text-slate-500 max-w-xs mt-1.5">Generating constructive feedback on communication style, technical accuracy, and key improvement areas...</p>
                </div>
              ) : feedback ? (
                <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm space-y-6 h-full">
                  
                  {/* Score Header */}
                  <div className="flex items-center justify-between p-3.5 bg-brand-500/5 border border-brand-500/15 rounded-2xl">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Session Evaluation</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Scored by CareerCopilot AI</p>
                    </div>
                    <div className="flex items-center gap-1 bg-[#0B0F19] px-3 py-1.5 rounded-xl border border-slate-800">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-black text-white">{feedback.confidence_score}%</span>
                    </div>
                  </div>

                  {/* Feedback Details */}
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                    <div>
                      <h5 className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Strengths</h5>
                      <p className="text-xs text-slate-350 leading-relaxed bg-[#0B0F19]/45 border border-slate-850 p-2.5 rounded-xl">{feedback.strengths}</p>
                    </div>
                    
                    <div>
                      <h5 className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider mb-1">Gaps & Weaknesses</h5>
                      <p className="text-xs text-slate-350 leading-relaxed bg-[#0B0F19]/45 border border-slate-850 p-2.5 rounded-xl">{feedback.weaknesses}</p>
                    </div>

                    <div>
                      <h5 className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider mb-1">Technical Accuracy</h5>
                      <p className="text-xs text-slate-350 leading-relaxed bg-[#0B0F19]/45 border border-slate-850 p-2.5 rounded-xl">{feedback.technical_accuracy}</p>
                    </div>

                    <div>
                      <h5 className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-1">Communication Style</h5>
                      <p className="text-xs text-slate-350 leading-relaxed bg-[#0B0F19]/45 border border-slate-850 p-2.5 rounded-xl">{feedback.communication_feedback}</p>
                    </div>

                    <div>
                      <h5 className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">Suggested Improvements</h5>
                      <p className="text-xs text-slate-350 leading-relaxed bg-[#0B0F19]/45 border border-slate-850 p-2.5 rounded-xl">{feedback.suggested_improvements}</p>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="bg-[#111827]/40 border border-slate-850 border-dashed rounded-3xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                  <MessageSquare className="h-10 w-10 text-slate-650 mb-3" />
                  <h4 className="text-slate-400 font-bold">Feedback Idle</h4>
                  <p className="text-[10px] text-slate-550 max-w-xs mt-1.5">Submit your answers in the chat workspace to review detailed AI grading statistics.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Aggregated Scorecard Panel */}
        {session && currentQuestionIdx >= session.questions.length && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Banner Card */}
            <div className="bg-brand-600 p-8 rounded-3xl text-white shadow-xl shadow-brand-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <h2 className="text-xl font-bold">Interview Completed successfully!</h2>
                <p className="text-brand-200 text-xs">You completed all 5 mock interview questions. See your detailed AI feedback report below.</p>
              </div>
              <button
                onClick={() => setSession(null)}
                className="px-5 py-2.5 bg-[#0B0F19]/80 border border-brand-500/20 text-brand-400 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap self-start md:self-center"
              >
                <RefreshCw className="h-4 w-4" />
                Practice Again
              </button>
            </div>

            {/* QA Feedback loop */}
            <div className="space-y-4">
              {feedbacksList.map((f, idx) => (
                <div key={idx} className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Question #{idx + 1}</span>
                    <span className="px-2.5 py-0.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-lg text-[10px] font-semibold flex items-center gap-1">
                      <Star className="h-3 w-3 fill-brand-400" />
                      Score: {f.confidence_score}%
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-xs">
                    <p className="text-slate-100 font-bold">Q: "{f.question_text}"</p>
                    <div className="bg-[#0B0F19]/60 p-3 border border-slate-850 rounded-xl">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Your Response:</span>
                      <p className="text-slate-300 mt-1 italic leading-relaxed">"{f.candidate_answer}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-emerald-500/5 border border-emerald-500/15 p-3.5 rounded-xl space-y-1">
                        <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Strengths & Accuracy</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{f.strengths}</p>
                      </div>
                      <div className="bg-amber-500/5 border border-amber-500/15 p-3.5 rounded-xl space-y-1">
                        <span className="text-[9px] uppercase tracking-wider text-amber-400 font-bold">Suggestions to Improve</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{f.suggested_improvements}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </Layout>
  );
};

export default Interview;
