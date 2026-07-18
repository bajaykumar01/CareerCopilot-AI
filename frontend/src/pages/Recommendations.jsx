import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { analysisAPI } from '../services/api';
import { 
  Award, BookOpen, Rocket, ShieldAlert, ArrowRight,
  TrendingUp, FileText, CheckCircle, HelpCircle, Briefcase 
} from 'lucide-react';

const Recommendations = () => {
  const [activeTab, setActiveTab] = useState('skills');
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchLatestAnalysis();
  }, []);

  const fetchLatestAnalysis = async () => {
    try {
      const historyRes = await analysisAPI.getHistory();
      setHistory(historyRes.data);
      if (historyRes.data.length > 0) {
        const latestId = historyRes.data[0].id;
        const detailsRes = await analysisAPI.getDetails(latestId);
        setAnalysis(detailsRes.data);
      }
    } catch (err) {
      setError('Could not load recommendation insights.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectReport = async (e) => {
    setLoading(true);
    try {
      const res = await analysisAPI.getDetails(e.target.value);
      setAnalysis(res.data);
    } catch (err) {
      setError('Failed to load selected analysis.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'skills', name: 'Roadmap & Certifications', icon: BookOpen },
    { id: 'projects', name: 'Bridge Projects', icon: Rocket },
    { id: 'resume', name: 'Resume Tweaks', icon: FileText },
    { id: 'company', name: 'Interview Focus', icon: TrendingUp },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Personalized Growth Plan</h1>
            <p className="text-slate-400 text-sm mt-1">AI-driven instructions to patch skill gaps and optimize resume visibility.</p>
          </div>

          {/* Report Dropdown selector */}
          {history.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-500 font-semibold whitespace-nowrap">Selected Report:</label>
              <select
                onChange={handleSelectReport}
                className="bg-[#111827]/80 border border-slate-800 text-xs text-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-brand-500 cursor-pointer"
              >
                {history.map((h) => (
                  <option key={h.id} value={h.id}>
                    Report #{h.id} ({h.ats_score}% Match)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-brand-500"></div>
            <p className="text-xs text-slate-500 mt-4">Assembling roadmap details...</p>
          </div>
        ) : error || !analysis ? (
          <div className="bg-[#111827]/40 border border-slate-850 p-12 text-center rounded-3xl flex flex-col items-center justify-center min-h-[400px]">
            <ShieldAlert className="h-12 w-12 text-slate-650 mb-4" />
            <h3 className="text-slate-400 font-bold">No Analysis Found</h3>
            <p className="text-xs text-slate-550 max-w-sm mt-1.5">
              Please trigger a RAG match evaluation on the Dashboard first to generate personalized learning suggestions.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Tabs Buttons */}
            <div className="flex border-b border-slate-850 overflow-x-auto gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-xs whitespace-nowrap transition-all duration-200 outline-none ${
                      isActive
                        ? 'border-brand-500 text-brand-400 font-bold bg-brand-500/5'
                        : 'border-transparent text-slate-450 hover:text-slate-200 hover:border-slate-800'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.name}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: Skills & Roadmap */}
            {activeTab === 'skills' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Learning Roadmap (timeline style) */}
                <div className="lg:col-span-8 bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm space-y-6">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BookOpen className="h-4.5 w-4.5 text-brand-400" />
                    Sequential Learning Roadmap
                  </h3>

                  <div className="relative border-l-2 border-slate-850 ml-3.5 pl-6 space-y-6 py-2">
                    {analysis.company_recommendations?.learning_roadmap?.map((step, idx) => (
                      <div key={idx} className="relative">
                        {/* Bullet circle */}
                        <div className="absolute -left-10 top-0.5 h-6.5 w-6.5 rounded-full bg-[#0B0F19] border border-slate-800 flex items-center justify-center text-[10px] font-bold text-brand-400">
                          {step.step || (idx + 1)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                            {step.topic}
                            <span className="px-2 py-0.5 bg-brand-500/10 text-brand-400 rounded text-[9px] font-semibold">{step.duration}</span>
                          </h4>
                          <p className="text-xs text-slate-450 mt-1 leading-relaxed">{step.description}</p>
                        </div>
                      </div>
                    ))}
                    {!analysis.company_recommendations?.learning_roadmap?.length && (
                      <p className="text-xs text-slate-500 italic">No roadmap generated.</p>
                    )}
                  </div>
                </div>

                {/* Right widgets: Skill priorities & Certifications */}
                <div className="lg:col-span-4 space-y-6">
                  {/* High Priority Skills */}
                  <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm space-y-4">
                    <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider">High Priority Skill Gaps</h3>
                    <div className="flex flex-col gap-2">
                      {analysis.skill_gap_analysis?.high_priority_skills?.map((s, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-rose-500/5 border border-rose-500/15 rounded-xl text-xs font-medium text-slate-250">
                          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                          {s}
                        </div>
                      ))}
                      {!analysis.skill_gap_analysis?.high_priority_skills?.length && (
                        <p className="text-xs text-slate-500 italic">No high priority gaps marked.</p>
                      )}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm space-y-4">
                    <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Recommended Certifications</h3>
                    <div className="space-y-3.5">
                      {analysis.certification_recommendations?.map((cert, idx) => (
                        <div key={idx} className="p-3 bg-[#0B0F19]/60 border border-slate-850 rounded-xl space-y-1">
                          <h4 className="text-xs font-bold text-slate-200">{cert.name}</h4>
                          <p className="text-[10px] text-slate-500 font-medium">{cert.authority}</p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{cert.relevance}</p>
                        </div>
                      ))}
                      {!analysis.certification_recommendations?.length && (
                        <p className="text-xs text-slate-500 italic">No certificates recommended.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: Bridge Projects */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                    <Rocket className="h-4.5 w-4.5 text-brand-400" />
                    Portfolio Gap-Bridge Projects
                  </h3>
                  <p className="text-xs text-slate-400">Implement these 3-5 projects to demonstrate key competencies sought by the hiring manager.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {analysis.project_recommendations?.map((proj, idx) => (
                    <div key={idx} className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm space-y-4 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-bold text-slate-200">{proj.title}</h4>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            proj.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                            proj.difficulty === 'Intermediate' ? 'bg-amber-500/10 text-amber-400' :
                            'bg-rose-500/10 text-rose-400'
                          }`}>
                            {proj.difficulty}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.technologies?.map((tech, tid) => (
                            <span key={tid} className="px-2 py-0.5 bg-[#0B0F19] text-slate-450 border border-slate-850 rounded-md text-[10px] font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-850 mt-4 space-y-2">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Learning Outcomes</h5>
                        <ul className="space-y-1">
                          {proj.learning_outcomes?.map((out, oid) => (
                            <li key={oid} className="text-xs text-slate-400 flex items-start gap-2">
                              <span className="text-brand-500 font-bold mt-0.5">✓</span>
                              {out}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                  {!analysis.project_recommendations?.length && (
                    <p className="text-xs text-slate-500 italic py-4">No project recommendations generated.</p>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Resume Tweaks */}
            {activeTab === 'resume' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Bullet point corrections */}
                <div className="lg:col-span-8 bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm space-y-5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                    <FileText className="h-4.5 w-4.5 text-brand-400" />
                    Bullet Point Improvements
                  </h3>

                  <div className="space-y-5">
                    {analysis.resume_suggestions?.bullet_point_improvements?.map((bp, idx) => (
                      <div key={idx} className="p-4 bg-[#0B0F19]/70 border border-slate-850 rounded-2xl space-y-3 shadow-inner">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-bold text-rose-450">Original Text:</span>
                          <p className="text-xs text-slate-450 mt-1 italic">"{bp.original}"</p>
                        </div>
                        <div className="pt-2.5 border-t border-slate-850">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-emerald-450">AI Optimized Text:</span>
                          <p className="text-xs text-slate-200 mt-1 font-medium">"{bp.improved}"</p>
                        </div>
                        {bp.reason && (
                          <p className="text-[10px] text-brand-400 bg-brand-500/5 px-3 py-2 rounded-lg leading-relaxed">
                            <strong>Feedback:</strong> {bp.reason}
                          </p>
                        )}
                      </div>
                    ))}
                    {!analysis.resume_suggestions?.bullet_point_improvements?.length && (
                      <p className="text-xs text-slate-500 italic">No bullet point corrections generated.</p>
                    )}
                  </div>
                </div>

                {/* Right side widgets: keywords & formatting */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Action Verbs & Keywords */}
                  <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Include Strong Action Verbs</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.resume_suggestions?.action_verbs?.map((verb, idx) => (
                        <span key={idx} className="px-2 py-1 bg-brand-500/10 text-brand-400 rounded-lg text-xs font-semibold">
                          {verb}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">Missing Keywords</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {analysis.resume_suggestions?.missing_keywords?.map((word, idx) => (
                        <span key={idx} className="px-2 py-1 bg-[#0B0F19] text-slate-350 border border-slate-800 rounded-lg text-xs font-medium">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Formatting & Quantifying tips */}
                  <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm space-y-4">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quantifying Achievements</h3>
                    <ul className="space-y-2">
                      {analysis.resume_suggestions?.quantified_achievements_tips?.map((tip, idx) => (
                        <li key={idx} className="text-xs text-slate-400 flex items-start gap-2 leading-relaxed">
                          <span className="text-brand-500 font-bold mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>

                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">Formatting Suggestions</h3>
                    <ul className="space-y-2">
                      {analysis.resume_suggestions?.formatting_improvements?.map((tip, idx) => (
                        <li key={idx} className="text-xs text-slate-400 flex items-start gap-2 leading-relaxed">
                          <span className="text-brand-500 font-bold mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: Interview & Company Recommendations */}
            {activeTab === 'company' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Tech to Learn */}
                <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm space-y-4">
                  <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl w-fit">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Required Technologies</h3>
                  <p className="text-xs text-slate-500">Essential stack items heavily referenced in target JD.</p>
                  <ul className="space-y-2 pt-2">
                    {analysis.company_recommendations?.technologies_to_learn?.map((t, idx) => (
                      <li key={idx} className="text-xs text-slate-350 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
                        {t}
                      </li>
                    ))}
                    {!analysis.company_recommendations?.technologies_to_learn?.length && (
                      <li className="text-xs text-slate-500 italic">No technologies listed.</li>
                    )}
                  </ul>
                </div>

                {/* Important Concepts */}
                <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm space-y-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl w-fit">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Core Concepts & Theory</h3>
                  <p className="text-xs text-slate-500">Key conceptual domains you will be grilled on.</p>
                  <ul className="space-y-2 pt-2">
                    {analysis.company_recommendations?.important_concepts?.map((c, idx) => (
                      <li key={idx} className="text-xs text-slate-350 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                        {c}
                      </li>
                    ))}
                    {!analysis.company_recommendations?.important_concepts?.length && (
                      <li className="text-xs text-slate-500 italic">No concepts listed.</li>
                    )}
                  </ul>
                </div>

                {/* Interview Focus Areas */}
                <div className="bg-[#111827]/60 border border-slate-800/60 rounded-3xl p-6 backdrop-blur-sm space-y-4">
                  <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl w-fit">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">Interview Focus Areas</h3>
                  <p className="text-xs text-slate-500">Topics heavily weighted during technical filters.</p>
                  <ul className="space-y-2 pt-2">
                    {analysis.company_recommendations?.interview_focus_areas?.map((fa, idx) => (
                      <li key={idx} className="text-xs text-slate-350 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
                        {fa}
                      </li>
                    ))}
                    {!analysis.company_recommendations?.interview_focus_areas?.length && (
                      <li className="text-xs text-slate-500 italic">No focus areas listed.</li>
                    )}
                  </ul>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </Layout>
  );
};

export default Recommendations;
