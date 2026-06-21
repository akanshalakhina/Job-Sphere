import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Users, MessageSquare } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export default function AdminNotifications() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    targetRole: 'All',
    title: '',
    message: '',
    type: 'popup'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/notifications/blast', formData);
      addToast('Notification blast sent successfully!', 'success');
      setFormData({ ...formData, title: '', message: '' });
    } catch (err) {
      addToast('Failed to send notification.', 'error');
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
        <h4 className="text-sm font-bold text-slate-800 dark:text-white">Notification Blaster</h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Send alerts, updates, or career guidance to all users or specific roles.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Audience</label>
            <div className="relative">
              <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <select 
                value={formData.targetRole}
                onChange={e => setFormData({...formData, targetRole: e.target.value})}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 text-sm focus:ring-2 focus:ring-brand-500"
              >
                <option value="All">All Users</option>
                <option value="Candidate">Candidates Only</option>
                <option value="Recruiter">Recruiters Only</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Notification Type</label>
            <select 
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 text-sm focus:ring-2 focus:ring-brand-500"
            >
              <option value="popup">Popup Alert</option>
              <option value="banner">Dashboard Banner</option>
              <option value="inbox">Silent (Inbox Only)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Notification Title</label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. New Top Tech Skills in Demand!"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 text-sm focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Message Body</label>
          <textarea 
            required
            value={formData.message}
            onChange={e => setFormData({...formData, message: e.target.value})}
            placeholder="Type your alert message here..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 text-sm h-24 focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <button type="submit" className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow shadow-indigo-500/20 transition-all flex justify-center items-center gap-2">
          <Send className="w-4 h-4" /> Blast Notification
        </button>
      </form>
    </motion.div>
  );
}
