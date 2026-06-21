import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileCode, CheckCircle2, AlertTriangle, Sparkles, RefreshCw, BarChart2, Star, Trash2 } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';

export const ResumeAnalyzerPage = () => {
  const navigate = useNavigate();
  const { currentUser, uploadAndAnalyzeResume } = useAppState();
  const { addToast } = useToast();

  const [isScanning, setIsScanning] = useState(false);
  const [fileName, setFileName] = useState('');
  const [scanStage, setScanStage] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      addToast('Please upload a PDF or DOCX file.', 'error');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      addToast('Please upload a resume under 10MB.', 'error');
      return;
    }

    setFileName(file.name);
    triggerScan(file);
  };

  const triggerScan = (file) => {
    setIsScanning(true);
    const stages = [
      'Extracting typography layout parameters...',
      'Mapping key technical competencies...',
      'Comparing parsed fields with enterprise Stripe/Linear indexes...',
      'Calculating final ATS Compatibility metrics...'
    ];

    stages.forEach((stageText, idx) => {
      setTimeout(() => {
        setScanStage(stageText);
        if (idx === stages.length - 1) {
          setTimeout(async () => {
            const result = await uploadAndAnalyzeResume(file);
            setIsScanning(false);
            if (!result?.success) {
              addToast(result?.error || 'Unable to analyze this resume.', 'error');
              setFileName('');
              return;
            }
            if (result.analysis?.warning) {
              addToast(result.analysis.warning, 'info', 5000);
            }
            addToast('Resume scanned successfully!', 'success');
          }, 800);
        }
      }, idx * 750);
    });
  };

  const clearResume = () => {
    uploadAndAnalyzeResume(null, 0);
    setFileName('');
    addToast('Resume data reset.', 'info');
  };

  const resumeDetails = currentUser.resumeDetails;
  const atsScore = resumeDetails ? resumeDetails.atsScore : 0;

  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = React.useRef(null);

  // Initialize chat when resumeDetails changes
  React.useEffect(() => {
    if (resumeDetails) {
      setChatMessages([
        {
          id: 'init-msg',
          sender: 'ai',
          text: `Hi ${currentUser.name || 'there'}! I've completed the ATS analysis of your document "${resumeDetails.fileName}". You scored a solid ${resumeDetails.atsScore}%. I found ${resumeDetails.skills.length} matching skills, but noticed ${resumeDetails.missingKeywords.length} key gaps (like ${resumeDetails.missingKeywords.slice(0, 2).join(', ')}). How can I help you optimize your resume today?`
        }
      ]);
    }
  }, [resumeDetails, currentUser.name]);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chatMessages, isTyping]);

  const handleSendChat = (text) => {
    if (!text.trim() || isTyping) return;

    const userMessage = {
      id: `user-chat-${Date.now()}`,
      sender: 'user',
      text
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = "That's a great question. To boost your compatibility score, make sure you highlight impact-driven metrics (e.g. 'reduced latency by 20%') and explicitly include skills like " + resumeDetails.missingKeywords.join(', ') + " if you have experience with them.";
      const query = text.toLowerCase();

      if (query.includes('stripe') || query.includes('google') || query.includes('optimize')) {
        replyText = `To optimize for companies like Stripe or Google, I highly recommend adding a project bullet point incorporating missing skills:
- **For ${resumeDetails.missingKeywords[0] || 'TypeScript'}**: "Designed and typesafe-refactored modular state systems in React & ${resumeDetails.missingKeywords[0] || 'TypeScript'}, eliminating runtime type errors and reducing code complexity by 15%."
- **For ${resumeDetails.missingKeywords[1] || 'CI/CD'}**: "Implemented automated build pipelines using Github Actions (${resumeDetails.missingKeywords[1] || 'CI/CD'}), slashing deployment failure rates by 30%."`;
      } else if (query.includes('gap') || query.includes('keyword') || query.includes('missing')) {
        replyText = `Your resume is missing the following critical keywords required by top-tier employers: **${resumeDetails.missingKeywords.join(', ')}**. 
To resolve this:
1. Insert a dedicated "Tools & Technologies" section containing these terms.
2. Integrate them organically into your "Professional Experience" descriptions.`;
      } else if (query.includes('recommendation') || query.includes('tip') || query.includes('improve')) {
        replyText = `Based on your resume audit, here is how you can implement recommendation #1 (**${resumeDetails.improvements[0]}**):
- *Before*: "Built dashboards using React and Recharts."
- *After*: "Engineered high-performance real-time analytics dashboards in React and Recharts, improving data visualization speed by 40%."`;
      }

      const aiMessage = {
        id: `ai-chat-${Date.now()}`,
        sender: 'ai',
        text: replyText
      };

      setChatMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-8 z-10 relative">
      
      {/* Headings */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Holographic ATS Optimizer
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-white leading-tight">AI Resume Analyzer</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mt-0.5 leading-relaxed">
          Evaluate keyword match metrics, typography parameters, and visual alignments against Apple-grade enterprise standards in real-time.
        </p>
      </div>

      {/* Main Drag Box or Scanning Animation Pane */}
      {isScanning ? (
        <div className="border border-brand-500/40 dark:border-brand-500/20 bg-white/70 dark:bg-navy-900/40 backdrop-blur-2xl rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-6 min-h-[300px] relative overflow-hidden shadow-2xl">
          {/* Neon scan laser overlay */}
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent animate-laser shadow-lg shadow-brand-500/60" />
          
          <RefreshCw className="w-10 h-10 text-brand-500 animate-spin" />
          <div className="flex flex-col gap-2 max-w-sm">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white animate-pulse">Scanning Resume Document</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{fileName}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-300 italic mt-2 border-t border-slate-100 dark:border-navy-800 pt-2">{scanStage}</p>
          </div>
        </div>
      ) : !currentUser.resumeUploaded ? (
        <div className="border-2 border-dashed border-slate-200/80 dark:border-navy-800 hover:border-brand-500/60 dark:hover:border-brand-500/50 bg-white/50 dark:bg-navy-900/30 backdrop-blur-xl rounded-3xl p-10 md:p-14 text-center flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 relative group">
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-navy-900 flex items-center justify-center text-slate-400 group-hover:scale-105 group-hover:text-brand-500 transition-all">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white">Drop your PDF or DOCX file here</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Drag-and-drop or browse files locally. Make sure file is under 10MB and uses selectable text when possible.
            </p>
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-brand-600 group-hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/10 transition-all mt-2">
            Upload Document
          </button>
        </div>
      ) : (
        /* Results Section */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* ATS Score card Column */}
          <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex flex-col items-center text-center justify-between gap-6">
            <div className="w-full text-left">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">ATS Score Report</h4>
            </div>

            <div className="flex flex-col items-center gap-3">
              {/* Score circle */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="62" stroke="currentColor" className="text-slate-100 dark:text-navy-800" strokeWidth="6" fill="transparent" />
                  <circle cx="72" cy="72" r="62" stroke="currentColor" className="text-brand-500" strokeWidth="8" fill="transparent"
                    strokeDasharray={2 * Math.PI * 62}
                    strokeDashoffset={2 * Math.PI * 62 * (1 - atsScore / 100)}
                  />
                </svg>
                <div className="absolute flex flex-col items-center leading-none">
                  <span className="text-3xl font-extrabold text-slate-800 dark:text-white">{atsScore}</span>
                  <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">Perfect Score</span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{resumeDetails.fileName}</p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">AI Analysis Complete</p>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2 border-t border-slate-100 dark:border-navy-800 pt-4">
              <button
                onClick={() => triggerScan(resumeDetails.fileName)}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800/40 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-brand-500" />
                Rescan Document
              </button>
              <button
                onClick={clearResume}
                className="w-full py-2.5 rounded-xl border border-rose-500/20 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                Delete Profile
              </button>
            </div>
          </div>

          {/* Details breakdown findings Column */}
          <div className="md:col-span-2 flex flex-col gap-6 w-full">
            
            {/* Extracted & Missing Keywords */}
            <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-brand-500" />
                Keyword Coverage Sourcing
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Found */}
                <div className="flex flex-col gap-2 p-4 rounded-2xl border border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40">
                  <p className="text-[10px] uppercase font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Keywords Sourced ({resumeDetails.skills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {resumeDetails.skills.map(s => (
                      <span key={s} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/10">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Missing */}
                <div className="flex flex-col gap-2 p-4 rounded-2xl border border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40">
                  <p className="text-[10px] uppercase font-bold text-rose-500 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Critical Gaps ({resumeDetails.missingKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {resumeDetails.missingKeywords.map(s => (
                      <span key={s} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/10">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Improvement checklist items */}
            <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Improvement Recommendations
              </h4>
              <div className="flex flex-col gap-3">
                {resumeDetails.improvements.map((tip, i) => (
                  <div key={i} className="flex gap-2.5 p-3 rounded-2xl border border-slate-100 dark:border-navy-800 bg-slate-50/50 dark:bg-navy-950/40 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed items-start">
                    <div className="w-5 h-5 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center font-extrabold text-[10px] flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    {tip}
                  </div>
                ))}
              </div>
            </div>

            {/* AI Resume Chat consultant */}
            <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-4 h-[400px]">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-navy-800 pb-2">
                <Sparkles className="w-5 h-5 text-brand-500 animate-pulse" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white">SphereAI Resume Consultant</h4>
                  <p className="text-[9px] text-slate-400">Ask tips on optimizing, addressing gaps, or prepping for Stripe</p>
                </div>
              </div>

              {/* Chat Transcript Area */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 scrollbar-thin">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                    }`}
                  >
                    <span className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">
                      {msg.sender === 'user' ? 'You' : 'SphereAI'}
                    </span>
                    <div
                      className={`p-3 rounded-2xl text-[10.5px] leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-brand-600 text-white rounded-tr-none font-medium'
                          : 'bg-slate-100 dark:bg-navy-950 text-slate-700 dark:text-slate-200 border border-slate-200/40 dark:border-navy-800 rounded-tl-none font-medium'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="self-start flex flex-col items-start max-w-[85%]">
                    <span className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">SphereAI</span>
                    <div className="w-56 p-3 bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-300 rounded-2xl rounded-tl-none border border-slate-200/40 dark:border-navy-800">
                      <div className="flex items-center justify-between gap-3 text-[10px] font-bold">
                        <span>Analyzing reply</span>
                        <span className="text-brand-500 dark:text-brand-400">Working</span>
                      </div>
                      <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-brand-500/10">
                        <span className="ai-loading-bar absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-brand-400" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Suggestions chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: '💡 Optimize for Stripe', query: 'How do I optimize my resume for Stripe?' },
                  { label: '🔍 How to address gaps?', query: 'Tell me how to address critical gaps in my resume.' },
                  { label: '📈 Explain recommendation #1', query: 'Can you expand on improvement tip #1?' }
                ].map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendChat(chip.query)}
                    disabled={isTyping}
                    className="text-[9px] font-bold px-2.5 py-1.5 rounded-full bg-slate-50 hover:bg-brand-500/10 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Chat Input form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChat(chatInput);
                }}
                className="flex gap-2 items-center border-t border-slate-100 dark:border-navy-800 pt-2"
              >
                <input
                  type="text"
                  placeholder="Ask SphereAI Resume Consultant..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-bold shadow-md transition-all"
                  disabled={isTyping || !chatInput.trim()}
                >
                  Send
                </button>
              </form>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
