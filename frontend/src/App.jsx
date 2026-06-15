import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { MainLayout } from './layouts/MainLayout';

import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { JobListingPage } from './pages/JobListingPage';
import { JobDetailsPage } from './pages/JobDetailsPage';
import { ResumeAnalyzerPage } from './pages/ResumeAnalyzerPage';
import { FeedPage } from './pages/FeedPage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PublicProfilePage } from './pages/PublicProfilePage';

// Route Protection Wrapper Component
const ProtectedRoute = ({ children, allowedRole }) => {
  const { isSignedIn, authLoaded, userRole } = useAppState();

  if (!authLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={`/${userRole}-dashboard`} replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppStateProvider>
          <Router>
            <MainLayout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth/*" element={<AuthPage />} />
                <Route path="/jobs" element={<JobListingPage />} />
                <Route path="/jobs/:id" element={<JobDetailsPage />} />
                <Route path="/analyzer" element={
                  <ProtectedRoute><ResumeAnalyzerPage /></ProtectedRoute>
                } />
                <Route path="/candidate-dashboard" element={
                  <ProtectedRoute allowedRole="candidate"><CandidateDashboard /></ProtectedRoute>
                } />
                <Route path="/recruiter-dashboard" element={
                  <ProtectedRoute allowedRole="recruiter"><RecruiterDashboard /></ProtectedRoute>
                } />
                <Route path="/admin-dashboard" element={
                  <ProtectedRoute allowedRole="admin"><AdminDashboard /></ProtectedRoute>
                } />
                <Route path="/feed" element={
                  <ProtectedRoute><FeedPage /></ProtectedRoute>
                } />
                <Route path="/opportunities" element={<OpportunitiesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/profile/:clerkId" element={<PublicProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </MainLayout>
          </Router>
        </AppStateProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
