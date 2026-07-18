import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ResumeUpload from '../components/ResumeUpload';
import MetricCard from '../components/MetricCard';
import { jobAPI, analysisAPI } from '../services/api';
import { 
  FileText, Briefcase, Play, Calendar, CheckCircle2, 
  XCircle, Award, Target, ArrowRight, ClipboardCopy 
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [history, setHistory] = useState([]);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch past analyses on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await analysisAPI.getHistory();
      setHistory(res.data);
      if (res.data.length > 0 && !activeAnalysis) {
        // Load latest analysis as default
        setActiveAnalysis(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load analysis history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleResumeSuccess = (uploadedResume) => {
    setResume(uploadedResume);
  };

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    if (!resume) {
      setError('Please upload your resume PDF first.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please paste the target job description.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // 1. Save Job Description
      const jobRes = await jobAPI.create(
        jobTitle || 'Target Role', 
        company || 'Target Company', 
        jobDescription
      );
      
      // 2. Trigger RAG Match Analysis
      const analysisRes = await analysisAPI.run(resume.id, jobRes.data.id);
      setActiveAnalysis(analysisRes.data);
      
      // Refresh history list
      await fetchHistory();
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during matching analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = async (analysisId) => {
    setLoading(true);
    setError('');
    try {
      const res = await analysisAPI.getDetails(analysisId);
      setActiveAnalysis(res.data);
    } catch (err) {
      setError('Failed to load analysis report.');
    } finally {
      setLoading(false);
    }
  };

  const getATSColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30';
    if (score >= 60) return 'text-amber-400 border-amber-500/30';
    return 'text-red-400 border-red-500/30';
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Banner/Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">AI Matching Center</h1>
          <p className="text-slate-400 text-sm mt-1">Upload your resume and target job requirements to generate ATS match metrics.</p>
        </div>

        {/* Dashboard Grid split into Left (Controls) and Right (Results/History) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Uploads & Job Inputs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Step 1: Resume Upload */}
            <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <span className="bg-brand-500/10 text-brand-400 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Upload PDF Resume
              </h2>
              <ResumeUpload onUploadSuccess={handleResumeSuccess} />
              {resume && (
                <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-brand-500/10 text-brand-400 rounded-xl text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Resume loaded successfully. Proceed to step 2.</span>
                </div>
              )}
            </div>

            {/* Step 2: Job Description */}
            <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                <span className="bg-brand-500/10 text-brand-400 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Target Role Details
              </h2>
              <form onSubmit={handleRunAnalysis} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Job Title</label>
                    <input 
                      type="text" 
                      value={jobTitle} 
                      onChange={(e) => setJobTitle(e.target.value)} 
                      placeholder="e.g. Frontend Engineer" 
                      className="w-full px-3.5 py-2.5 bg-[#0B0F19]/80 border border-slate-850 rounded-xl text-xs text-slate-200 outline-none focus:border-brand-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Company</label>
                    <input 
                      type="text" 
                      value={company} 
                      onChange={(e) => setCompany(e.target.value)} 
                      placeholder="e.g. Google" 
                      className="w-full px-3.5 py-2.5 bg-[#0B0F19]/80 border border-slate-850 rounded-xl text-xs text-slate-200 outline-none focus:border-brand-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Job Description Requirements</label>
                  <textarea 
                    rows="6"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description requirements here..."
                    className="w-full px-3.5 py-3 bg-[#0B0F19]/80 border border-slate-850 rounded-xl text-xs text-slate-200 outline-none focus:border-brand-500 transition resize-none"
                  ></textarea>
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-950/20 border border-red-500/25 p-3 rounded-xl flex items-center gap-2">
                    <XCircle className="h-4 w-4" /> {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-lg flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  {loading ? 'Running AI RAG Matching...' : 'Run RAG Match Analysis'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Results & Report View */}
          <div className="lg:col-span-7 space-y-6">
            
            {loading ? (
              <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-12 flex flex-col items-center justify-center text-center backdrop-blur-sm min-h-[500px]">
                <div className="relative flex items-center justify-center">
                  <div className="h-24 w-24 animate-spin rounded-full border-4 border-slate-800 border-t-brand-500"></div>
                  <Target className="absolute h-8 w-8 text-brand-400 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-slate-200 mt-6">Analyzing Candidate fit</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-2">Embedding resume, running FAISS vector lookup, and generating structured scoring matrices via Gemini LLM...</p>
              </div>
            ) : activeAnalysis ? (
              <div className="space-y-6">
                
                {/* Score Header */}
                <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Gauge */}
                  <div className="md:col-span-4 flex justify-center">
                    <div className={`relative h-32 w-32 rounded-full border-8 flex flex-col items-center justify-center ${getATSColor(activeAnalysis.ats_score)}`}>
                      <span className="text-3xl font-black text-white">{activeAnalysis.ats_score}%</span>
                      <span className="text-[10px] font-bold text-slate-550 uppercase tracking-widest mt-0.5">ATS Score</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="md:col-span-8 text-center md:text-left space-y-2">
                    <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
                      <Award className="h-5 w-5 text-brand-400" />
                      RAG Score Explanation
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{activeAnalysis.ats_explanation}</p>
                    <div className="pt-2 flex justify-center md:justify-start gap-3">
                      <button 
                        onClick={() => navigate('/recommendations')}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                      >
                        Recommendations
                        <ArrowRight className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={() => navigate('/interview')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                      >
                        Mock Interview
                      </button>
                    </div>
                  </div>
                </div>

                {/* Strengths & Weaknesses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm space-y-4">
                    <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4.5 w-4.5" /> Key Strengths
                    </h3>
                    <ul className="space-y-2">
                      {activeAnalysis.strengths?.map((str, idx) => (
                        <li key={idx} className="text-xs text-slate-350 flex items-start gap-2 leading-relaxed">
                          <span className="text-emerald-500 font-bold mt-0.5">•</span>
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm space-y-4">
                    <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                      <XCircle className="h-4.5 w-4.5" /> Gaps & Weaknesses
                    </h3>
                    <ul className="space-y-2">
                      {activeAnalysis.weaknesses?.map((weak, idx) => (
                        <li key={idx} className="text-xs text-slate-350 flex items-start gap-2 leading-relaxed">
                          <span className="text-rose-500 font-bold mt-0.5">•</span>
                          {weak}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Skills Match pills */}
                <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm space-y-5">
                  <div>
                    <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Matching Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeAnalysis.matching_skills?.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                      {activeAnalysis.matching_skills?.length === 0 && (
                        <span className="text-slate-500 text-xs italic">No clear matching skills found.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-3">Missing/Unmentioned Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {activeAnalysis.missing_skills?.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                      {activeAnalysis.missing_skills?.length === 0 && (
                        <span className="text-slate-500 text-xs italic">No key missing skills identified.</span>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-[#111827]/40 border border-slate-850 border-dashed rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
                <ClipboardCopy className="h-12 w-12 text-slate-650 mb-4" />
                <h3 className="text-slate-400 font-bold">No Analysis Generated</h3>
                <p className="text-xs text-slate-550 max-w-xs mt-1.5">Upload a resume and paste target job parameters to run an evaluation RAG pipeline report.</p>
              </div>
            )}

            {/* Analysis History Side-list */}
            <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm">
              <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-slate-400" />
                Analysis Logs & History
              </h3>
              
              {historyLoading ? (
                <div className="text-center py-4 text-xs text-slate-500">Loading logs...</div>
              ) : history.length > 0 ? (
                <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                  {history.map((log) => {
                    const isSelected = activeAnalysis?.id === log.id;
                    return (
                      <div
                        key={log.id}
                        onClick={() => handleSelectHistory(log.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-brand-600/10 border-brand-500/30 text-brand-400 shadow-sm shadow-brand-500/5'
                            : 'bg-[#0B0F19]/45 border-slate-850 text-slate-450 hover:bg-slate-800/30 hover:border-slate-750'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className={`h-4.5 w-4.5 ${isSelected ? 'text-brand-400' : 'text-slate-500'}`} />
                          <div>
                            <p className="text-xs font-semibold text-slate-200 truncate max-w-[180px]">Report #{log.id}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{new Date(log.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.ats_score >= 80 ? 'bg-emerald-500/10 text-emerald-400' : 
                          log.ats_score >= 60 ? 'bg-amber-500/10 text-amber-400' : 
                          'bg-rose-500/10 text-rose-400'
                        }`}>
                          {log.ats_score}% Match
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic py-2">No past analyses recorded.</p>
              )}
            </div>

          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
