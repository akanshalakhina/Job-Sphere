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

    setFileName(file.name);
    triggerScan(file.name);
  };

  const triggerScan = (name) => {
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
          setTimeout(() => {
            setIsScanning(false);
            const mockScore = Math.floor(Math.random() * 20) + 78; // Random score between 78 and 98
            uploadAndAnalyzeResume(name, mockScore);
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-8 z-10 relative">
      
      {/* Headings */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-650 dark:text-brand-400 text-[10px] font-bold">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Holographic ATS Optimizer
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-850 dark:text-white leading-tight">AI Resume Analyzer</h2>
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
            <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold">{fileName}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-350 italic mt-2 border-t border-slate-100 dark:border-navy-800 pt-2">{scanStage}</p>
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
            <p className="text-[10px] text-slate-455 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Drag-and-drop or browse files locally. Make sure file is under 5MB and uses transparent layouts.
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
              <h4 className="text-sm font-bold text-slate-850 dark:text-white">ATS Score Report</h4>
            </div>

            <div className="flex flex-col items-center gap-3">
              {/* Score circle */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="62" stroke="currentColor" className="text-slate-100 dark:text-navy-850" strokeWidth="6" fill="transparent" />
                  <circle cx="72" cy="72" r="62" stroke="currentColor" className="text-brand-500" strokeWidth="8" fill="transparent"
                    strokeDasharray={2 * Math.PI * 62}
                    strokeDashoffset={2 * Math.PI * 62 * (1 - atsScore / 100)}
                  />
                </svg>
                <div className="absolute flex flex-col items-center leading-none">
                  <span className="text-3xl font-extrabold text-slate-850 dark:text-white">{atsScore}</span>
                  <span className="text-[9px] text-slate-400 font-bold mt-1 uppercase">Perfect Score</span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">{resumeDetails.fileName}</p>
                <p className="text-[9px] text-slate-450 dark:text-slate-400 uppercase font-semibold tracking-wider">AI Analysis Complete</p>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2 border-t border-slate-100 dark:border-navy-800 pt-4">
              <button
                onClick={() => triggerScan(resumeDetails.fileName)}
                className="w-full py-2.5 rounded-xl border border-slate-250 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800/40 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-all"
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
                <div className="flex flex-col gap-2 p-4 rounded-2xl border border-slate-100 dark:border-navy-850 bg-slate-50/50 dark:bg-navy-950/40">
                  <p className="text-[10px] uppercase font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Keywords Sourced ({resumeDetails.skills.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {resumeDetails.skills.map(s => (
                      <span key={s} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-555 border border-emerald-500/10">{s}</span>
                    ))}
                  </div>
                </div>

                {/* Missing */}
                <div className="flex flex-col gap-2 p-4 rounded-2xl border border-slate-100 dark:border-navy-850 bg-slate-50/50 dark:bg-navy-950/40">
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
                  <div key={i} className="flex gap-2.5 p-3 rounded-2xl border border-slate-100 dark:border-navy-850 bg-slate-50/50 dark:bg-navy-950/40 text-[11px] text-slate-650 dark:text-slate-350 leading-relaxed items-start">
                    <div className="w-5 h-5 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center font-extrabold text-[10px] flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    {tip}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
