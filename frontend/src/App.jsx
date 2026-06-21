import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { MainLayout } from './layouts/MainLayout';

const LandingPage = React.lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const AuthPage = React.lazy(() => import('./pages/AuthPage').then(module => ({ default: module.AuthPage })));
const CandidateDashboard = React.lazy(() => import('./pages/CandidateDashboard').then(module => ({ default: module.CandidateDashboard })));
const RecruiterDashboard = React.lazy(() => import('./pages/RecruiterDashboard').then(module => ({ default: module.RecruiterDashboard })));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const JobListingPage = React.lazy(() => import('./pages/JobListingPage').then(module => ({ default: module.JobListingPage })));
const JobDetailsPage = React.lazy(() => import('./pages/JobDetailsPage').then(module => ({ default: module.JobDetailsPage })));
const ResumeAnalyzerPage = React.lazy(() => import('./pages/ResumeAnalyzerPage').then(module => ({ default: module.ResumeAnalyzerPage })));
const FeedPage = React.lazy(() => import('./pages/FeedPage').then(module => ({ default: module.FeedPage })));
const OpportunitiesPage = React.lazy(() => import('./pages/OpportunitiesPage').then(module => ({ default: module.OpportunitiesPage })));
const ContactPage = React.lazy(() => import('./pages/ContactPage').then(module => ({ default: module.ContactPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
const PublicProfilePage = React.lazy(() => import('./pages/PublicProfilePage').then(module => ({ default: module.PublicProfilePage })));

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

// Global Loading Fallback for Lazy Routes
const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppStateProvider>
          <Router>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
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
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/profile/:clerkId" element={<PublicProfilePage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </MainLayout>
          </Router>
        </AppStateProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
