import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, ArrowRight } from 'lucide-react';
import api from '../lib/api';

export default function OfferBanner({ userRole }) {
  const [offers, setOffers] = useState([]);
  const [visibleOffers, setVisibleOffers] = useState([]);

  useEffect(() => {
    // Only fetch for recruiters or candidates if we eventually add candidate offers
    if (userRole === 'recruiter') {
      fetchOffers();
    }
  }, [userRole]);

  const fetchOffers = async () => {
    try {
      const { data } = await api.get('/offers/active');
      setOffers(data);
      setVisibleOffers(data.map(o => o._id));
    } catch (err) {
      console.error("Failed to fetch offers", err);
    }
  };

  const dismissOffer = (id) => {
    setVisibleOffers(prev => prev.filter(offerId => offerId !== id));
  };

  if (offers.length === 0 || visibleOffers.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-3 mb-4">
      <AnimatePresence>
        {offers.filter(o => visibleOffers.includes(o._id)).map((offer) => (
          <motion.div
            key={offer._id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            {/* Background design */}
            <div className="absolute -right-10 -top-10 opacity-20 pointer-events-none">
              <Gift className="w-32 h-32 text-white" />
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner shrink-0">
                <span className="font-black text-sm">{offer.discountPercentage}%</span>
              </div>
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  🎉 {offer.title}
                </h4>
                <p className="text-xs text-brand-100 mt-0.5 leading-relaxed">
                  {offer.description} <span className="font-semibold text-white">(Valid for {offer.applicablePlan})</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
              <button className="flex-1 sm:flex-none px-4 py-2 bg-white text-brand-600 hover:bg-slate-50 text-xs font-extrabold rounded-xl shadow-sm transition-all flex justify-center items-center gap-1.5 whitespace-nowrap">
                Claim Offer <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => dismissOffer(offer._id)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
