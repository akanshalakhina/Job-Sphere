import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AppStateProvider } from './context/AppStateContext';
import { MainLayout } from './layouts/MainLayout';

// Page Imports
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

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppStateProvider>
          <Router>
            <MainLayout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/opportunities" element={<OpportunitiesPage />} />
                <Route path="/jobs" element={<JobListingPage />} />
                <Route path="/jobs/:id" element={<JobDetailsPage />} />
                <Route path="/analyzer" element={<ResumeAnalyzerPage />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
                <Route path="/recruiter-dashboard" element={<RecruiterDashboard />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
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
