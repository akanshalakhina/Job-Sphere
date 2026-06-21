import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Calendar, Percent } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export default function AdminOffers() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountPercentage: 10,
    applicablePlan: 'Premium Plan',
    expiresAt: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/offers', formData);
      addToast('Promotional offer created successfully!', 'success');
      setFormData({ title: '', description: '', discountPercentage: 10, applicablePlan: 'Premium Plan', expiresAt: '' });
    } catch (err) {
      addToast('Failed to create offer.', 'error');
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
        <h4 className="text-sm font-bold text-slate-800 dark:text-white">Promotional Offers Management</h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Create discount campaigns for recruiters (e.g., Diwali Special, Summer Hiring).</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 max-w-xl">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Offer Title</label>
          <div className="relative">
            <Tag className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Diwali Festival Offer"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 text-sm focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Description</label>
          <textarea 
            required
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Get 20% OFF on all premium plans..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 text-sm h-20 focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Discount %</label>
            <div className="relative">
              <Percent className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="number" 
                required
                min="1" max="100"
                value={formData.discountPercentage}
                onChange={e => setFormData({...formData, discountPercentage: parseInt(e.target.value)})}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Applicable Plan</label>
            <select 
              value={formData.applicablePlan}
              onChange={e => setFormData({...formData, applicablePlan: e.target.value})}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 text-sm focus:ring-2 focus:ring-brand-500"
            >
              <option value="Basic Plan">Basic Plan</option>
              <option value="Premium Plan">Premium Plan</option>
              <option value="All">All Plans</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Expiration Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="date" 
              required
              value={formData.expiresAt}
              onChange={e => setFormData({...formData, expiresAt: e.target.value})}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 text-sm focus:ring-2 focus:ring-brand-500 text-slate-700 dark:text-slate-300"
            />
          </div>
        </div>

        <button type="submit" className="mt-2 w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow shadow-brand-500/20 transition-all">
          Launch Offer Campaign
        </button>
      </form>
    </motion.div>
  );
}
