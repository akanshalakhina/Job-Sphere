import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Briefcase, Sparkles, Menu, X, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAppState } from '../context/AppStateContext';
import { ImageWithFallback } from './ImageWithFallback';
import NotificationCenter from './NotificationCenter';

export const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { userRole, currentUser, isSignedIn, logout } = useAppState();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Jobs', path: '/jobs' },
    { name: 'Feed', path: '/feed' },
    { name: 'Opportunities', path: '/opportunities' },
    { name: 'Resume Analyzer', path: '/analyzer' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-slate-200/55 dark:border-navy-800/40 bg-slate-50/80 dark:bg-navy-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-all duration-300">
            <Sparkles className="w-5 h-5 text-white animate-pulse-slow" />
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            JobSphere<span className="text-brand-500 font-extrabold">.ai</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-all duration-200 relative py-1 ${
                isActive(link.path)
                  ? 'text-brand-500 dark:text-brand-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 dark:bg-brand-400 rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Action Panel */}
        <div className="hidden md:flex items-center gap-4">
          {isSignedIn ? (
            <>
              {/* Quick Dashboard link */}
              <Link
                to={userRole === 'candidate' ? '/candidate-dashboard' : userRole === 'recruiter' ? '/recruiter-dashboard' : '/admin-dashboard'}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-navy-800 bg-white/50 dark:bg-navy-900/50 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-brand-500" />
                {userRole === 'candidate' ? 'Student Workspace' : userRole === 'recruiter' ? 'Recruiter Suite' : 'Admin Console'}
              </Link>

              {/* Notification Center */}
              {currentUser && (
                <NotificationCenter role={userRole} userId={currentUser.id || currentUser._id} />
              )}

              {/* Profile Dropdown */}
              {currentUser && (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdown(!profileDropdown)}
                    className="flex items-center gap-2 p-1 rounded-full border border-slate-200 dark:border-navy-800 hover:bg-slate-100 dark:hover:bg-navy-800 transition-all duration-200"
                  >
                    <ImageWithFallback
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover"
                      type="avatar"
                    >
                    </ImageWithFallback>
                    <ChevronDown className="w-4 h-4 text-slate-500 mr-1" />
                  </button>

                  {profileDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setProfileDropdown(false)} />
                      <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-2 shadow-2xl z-20 transition-all duration-300">
                        <div className="px-3 py-2 border-b border-slate-100 dark:border-navy-800 mb-2">
                          <p className="text-xs text-slate-400 dark:text-slate-400">Signed in as</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{currentUser.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-300 truncate">{currentUser.email}</p>
                        </div>

                        <button
                          data-testid="logout-btn"
                          onClick={() => {
                            setProfileDropdown(false);
                            logout();
                            navigate('/auth');
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout / Change Account
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <Link
              to="/auth"
              className="text-xs font-semibold px-4 py-2 rounded-full bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-navy-800 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white/50 dark:bg-navy-900/50"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white/50 dark:bg-navy-900/50"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5 text-slate-700 dark:text-white" /> : <Menu className="w-5 h-5 text-slate-700 dark:text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200/55 dark:border-navy-800/40 bg-slate-50 dark:bg-navy-950 px-4 pt-3 pb-6 flex flex-col gap-3 shadow-inner">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`text-sm font-medium py-2 px-3 rounded-xl transition-all ${
                isActive(link.path)
                  ? 'bg-brand-50 dark:bg-navy-900 text-brand-500 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-navy-900/50'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
