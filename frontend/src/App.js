import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './components/theme-provider';
import { trackPageView } from './utils/analytics';
import Navigation from './components/Navigation';
import ToastContainer from './components/Toast';
import { SkeletonPage } from './components/SkeletonCard';
import { SkipLink } from './components/SkipLink';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Intake = lazy(() => import('./pages/Intake'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Leads = lazy(() => import('./pages/Leads'));
const Login = lazy(() => import('./pages/Login'));
const Services = lazy(() => import('./pages/Services'));
const Resources = lazy(() => import('./pages/Resources'));
const Pipeline = lazy(() => import('./pages/Pipeline'));
const David = lazy(() => import('./pages/David'));
const Analytics = lazy(() => import('./pages/Analytics'));

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <SkeletonPage />;
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Track SPA navigation
  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SkipLink />
      {isAuthenticated && <Navigation />}
      <Suspense fallback={<SkeletonPage />}>
        <main id="main-content" tabIndex={-1}>
          <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/intake"
          element={
            <ProtectedRoute>
              <Intake />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <Inventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pipeline"
          element={
            <ProtectedRoute>
              <Pipeline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/david"
          element={
            <ProtectedRoute>
              <David />
            </ProtectedRoute>
          }
        />
        <Route
          path="/services"
          element={
            <ProtectedRoute>
              <Services />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          }
        />
      </Routes>
        </main>
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="material-solutions-theme">
        <AuthProvider>
          <ToastProvider>
            <ToastContainer />
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
