import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Link as LinkIcon, Code } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export default function AdminUpskilling() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    platform: 'Udemy',
    targetSkill: '',
    discountCode: '',
    url: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/courses', formData);
      addToast('Partnership course added successfully!', 'success');
      setFormData({ title: '', platform: 'Udemy', targetSkill: '', discountCode: '', url: '' });
    } catch (err) {
      addToast('Failed to add course.', 'error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm"
    >
      <div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-white">Upskilling Partnerships</h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Add recommended courses for candidates that lack required skills.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 max-w-xl">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Course Title</label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. The Complete React Developer Course"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 text-sm focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Skill</label>
            <div className="relative">
              <Code className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                required
                value={formData.targetSkill}
                onChange={e => setFormData({...formData, targetSkill: e.target.value})}
                placeholder="e.g. React"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Platform</label>
            <select 
              value={formData.platform}
              onChange={e => setFormData({...formData, platform: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 text-sm focus:ring-2 focus:ring-brand-500"
            >
              <option value="Udemy">Udemy</option>
              <option value="Coursera">Coursera</option>
              <option value="Simplilearn">Simplilearn</option>
              <option value="Great Learning">Great Learning</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Referral URL</label>
          <div className="relative">
            <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="url" 
              required
              value={formData.url}
              onChange={e => setFormData({...formData, url: e.target.value})}
              placeholder="https://..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 text-sm focus:ring-2 focus:ring-brand-500 text-slate-700 dark:text-slate-300"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Discount Code (Optional)</label>
          <input 
            type="text" 
            value={formData.discountCode}
            onChange={e => setFormData({...formData, discountCode: e.target.value})}
            placeholder="e.g. JOBSPHERE10"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 text-sm focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <button type="submit" className="mt-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow shadow-emerald-500/20 transition-all">
          Add Partnership Course
        </button>
      </form>
    </motion.div>
  );
}
