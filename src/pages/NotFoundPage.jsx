import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 min-h-[50vh] relative z-10">
      <div className="glow-mesh glow-blue w-80 h-80 opacity-15" />
      
      <div className="flex flex-col items-center gap-6 max-w-md relative z-10">
        
        {/* Holographic badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-650 dark:text-brand-400 text-[10px] font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          Sourcing Route Missing
        </div>

        {/* 404 Visual */}
        <h1 className="text-8xl font-black bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent leading-none">404</h1>

        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Page Not Found</h2>
          <p className="text-xs text-slate-450 dark:text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
            The page you're searching for does not exist or has been shifted during our latest platform upgrades.
          </p>
        </div>

        <div className="flex gap-4 w-full justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 max-w-[150px] py-2.5 rounded-xl border border-slate-250 dark:border-navy-800 bg-white/40 dark:bg-navy-900/40 hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-bold text-slate-700 dark:text-slate-250 flex items-center justify-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="flex-1 max-w-[150px] py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/10 flex items-center justify-center gap-1.5 transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            Home Page
          </button>
        </div>

      </div>
    </div>
  );
};
