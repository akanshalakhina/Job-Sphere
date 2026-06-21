import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, ExternalLink } from 'lucide-react';
import api from '../lib/api';

export default function UpskillingBanner({ userRole }) {
  const [courses, setCourses] = useState([]);
  const [visibleCourses, setVisibleCourses] = useState([]);

  useEffect(() => {
    if (userRole === 'candidate') {
      fetchCourses();
    }
  }, [userRole]);

  const fetchCourses = async () => {
    try {
      const { data } = await api.get('/courses');
      setCourses(data);
      setVisibleCourses(data.map(c => c._id));
    } catch (err) {
      console.error("Failed to fetch courses", err);
    }
  };

  const dismissCourse = (id) => {
    setVisibleCourses(prev => prev.filter(courseId => courseId !== id));
  };

  if (courses.length === 0 || visibleCourses.length === 0) return null;

  return (
    <div className="w-full flex flex-col gap-3 mb-4">
      <AnimatePresence>
        {courses.filter(c => visibleCourses.includes(c._id)).map((course) => (
          <motion.div
            key={course._id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            {/* Background design */}
            <div className="absolute -left-10 -top-10 opacity-20 pointer-events-none">
              <BookOpen className="w-32 h-32 text-white" />
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-sm shadow-inner shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  Level up your skills with {course.platform}
                </h4>
                <p className="text-xs text-emerald-100 mt-0.5 leading-relaxed">
                  Enroll in <strong>"{course.title}"</strong> to improve your {course.targetSkill} skills. 
                  {course.discountCode && <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-bold">Use code: {course.discountCode}</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 relative z-10 w-full sm:w-auto">
              <a 
                href={course.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none px-4 py-2 bg-white text-emerald-700 hover:bg-slate-50 text-xs font-extrabold rounded-xl shadow-sm transition-all flex justify-center items-center gap-1.5 whitespace-nowrap"
              >
                Enroll Now <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button 
                onClick={() => dismissCourse(course._id)}
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
