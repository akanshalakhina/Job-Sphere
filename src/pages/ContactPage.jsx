import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquareCode, Sparkles, Globe } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ContactPage = () => {
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [isInquiry, setIsInquiry] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !msg) {
      addToast('Please complete all form fields.', 'error');
      return;
    }

    addToast('Message Sourced successfully! We will contact you soon.', 'success');
    setName('');
    setEmail('');
    setMsg('');
  };

  const contactInfos = [
    { icon: Mail, label: "Direct Sourcing Email", val: "support@jobsphere.ai" },
    { icon: Phone, label: "Hotline Support Matrix", val: "+1 (555) 840-0230" },
    { icon: MapPin, label: "Principal Sourcing Hub", val: "One Cupertino Way, Cupertino, CA" }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-12 z-10 relative">
      
      {/* Headings */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-650 dark:text-brand-400 text-[10px] font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          Direct Support Matrix
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-850 dark:text-white leading-tight">Get in touch</h2>
        <p className="text-xs text-slate-550 dark:text-slate-400 max-w-lg mt-0.5 leading-relaxed">
          Need support with the resume scanner analyzer, recruiter dashboards setups, or sponsoring hackathons? Drop our developers a message!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Directories Column */}
        <div className="flex flex-col gap-6">
          <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <h4 className="text-sm font-bold text-slate-850 dark:text-white mb-2">Direct Contact Directories</h4>
            
            <div className="flex flex-col gap-4">
              {contactInfos.map((info, i) => {
                const Icon = info.icon;
                return (
                  <div key={i} className="flex gap-3.5 items-start">
                    <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none mb-1">{info.label}</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-250">{info.val}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Chatbot Launcher card */}
          <div className="border border-slate-200/60 dark:border-navy-800/40 bg-gradient-to-br from-brand-600 to-indigo-650 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="glow-mesh glow-purple top-0 right-0 w-32 h-32 opacity-30" />
            <div className="relative z-10 flex flex-col gap-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-100 flex items-center gap-1.5">
                <MessageSquareCode className="w-3.5 h-3.5" />
                Live Chat Support
              </h4>
              <p className="text-sm font-extrabold leading-tight">Need instant responses?</p>
              <p className="text-[10.5px] text-brand-100 leading-relaxed">
                Click the bouncing chat bubble in the bottom right corner of the window to talk directly with **SphereAI**, our automated support assistant.
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Column */}
        <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm text-left">
          <div className="flex gap-2 mb-6 border-b border-slate-100 dark:border-navy-900 pb-3">
            <button
              onClick={() => { setIsInquiry(false); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                !isInquiry 
                  ? 'bg-brand-500 text-white shadow' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-navy-800/40'
              }`}
            >
              Support Ticket
            </button>
            <button
              onClick={() => { setIsInquiry(true); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                isInquiry 
                  ? 'bg-brand-500 text-white shadow' 
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-navy-800/40'
              }`}
            >
              Business Inquiry
            </button>
          </div>

          <h4 className="text-sm font-bold text-slate-850 dark:text-white mb-4">
            {isInquiry ? 'Recruiter Business Sourcing Inquiry' : 'Send Support Ticket'}
          </h4>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contact Name</label>
              <input
                type="text"
                placeholder="e.g. Alex Rivera"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-xs text-slate-800 dark:text-slate-200 outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-xs text-slate-800 dark:text-slate-200 outline-none"
                required
              />
            </div>

            {isInquiry && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Stripe"
                    className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-xs text-slate-800 dark:text-slate-200 outline-none"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sourcing Needs</label>
                  <select
                    className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl text-xs text-slate-700 dark:text-slate-200 focus:border-brand-500"
                    required
                  >
                    <option>SaaS Gold Sourcing Plan</option>
                    <option>SaaS Platinum Sourcing Plan</option>
                    <option>SaaS Custom Diamond Enterprise</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {isInquiry ? 'Inquiry Details' : 'Message details'}
              </label>
              <textarea
                placeholder={isInquiry ? "Describe your enterprise team sizes, custom sourcing integrations, and candidate volumes..." : "Type your support request or bug details here..."}
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows="4"
                className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-xs text-slate-800 dark:text-slate-200 outline-none resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-brand-650 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              {isInquiry ? 'Submit Business Inquiry' : 'Submit Support Ticket'}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
