import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import api from './utils/api.js';

// Layout Components
import Sidebar from './components/Layout/Sidebar.jsx';
import GlowBackground from './components/Layout/GlowBackground.jsx';

// Pages
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tracker from './pages/Tracker.jsx';
import Analytics from './pages/Analytics.jsx';
import Goals from './pages/Goals.jsx';
import Insights from './pages/Insights.jsx';
import TalkToTwin from './pages/TalkToTwin.jsx';
import Onboarding from './pages/Onboarding.jsx';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user && !user.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

// Onboarding Route wrapper
const OnboardingRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (user && user.isOnboarded) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  const { isAuthenticated, user, loading: authLoading } = useContext(AuthContext);
  
  // Collapsible sidebar state (persisted in localStorage)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar-collapsed', String(next));
      return next;
    });
  };

  // Shared twin data state
  const [twinData, setTwinData] = useState({
    productivityScore: 0,
    burnout: { score: 10, level: 'Low', description: 'Energetic & Balanced' },
    consistencyIndex: 100,
    growthPrediction: { trend: 'stable', projectedProductivity: 50, rate: 0, forecast: '' },
    recommendations: [],
    activeStreak: 0,
    twinStatus: 'Balanced',
    logsCount: 0
  });
  const [loadingTwin, setLoadingTwin] = useState(true);
  const [goalsRefreshCounter, setGoalsRefreshCounter] = useState(0);

  const fetchTwinData = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/twin');
      setTwinData(res.data);
    } catch (error) {
      console.error('Failed to sync twin state:', error);
    }
    setLoadingTwin(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTwinData();
    } else {
      setLoadingTwin(false);
    }
  }, [isAuthenticated]);

  const triggerTwinRefresh = () => {
    fetchTwinData();
    setGoalsRefreshCounter((prev) => prev + 1);
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <span className="w-8 h-8 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
      </div>
    );
  }

  const mainClasses = `flex-1 min-h-screen transition-all duration-300 ${isCollapsed ? 'pl-28' : 'pl-72'}`;

  return (
    <div className="relative min-h-screen text-zinc-100 bg-background">
      {/* Visual background canvas */}
      <GlowBackground />

      <Routes>
        {/* Auth entry route */}
        <Route path="/auth" element={!isAuthenticated ? <Auth /> : <Navigate to="/" replace />} />

        {/* Dashboard panel */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar twinStatus={twinData.twinStatus} isCollapsed={isCollapsed} onToggleCollapse={toggleSidebar} />
                <main className={mainClasses}>
                  <Dashboard twinData={twinData} loadingTwin={loadingTwin} goalsCount={goalsRefreshCounter} />
                </main>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Tracker logging panel */}
        <Route 
          path="/tracker" 
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar twinStatus={twinData.twinStatus} isCollapsed={isCollapsed} onToggleCollapse={toggleSidebar} />
                <main className={mainClasses}>
                  <Tracker triggerTwinRefresh={triggerTwinRefresh} />
                </main>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Analytics panel */}
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar twinStatus={twinData.twinStatus} isCollapsed={isCollapsed} onToggleCollapse={toggleSidebar} />
                <main className={mainClasses}>
                  <Analytics />
                </main>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Goals panel */}
        <Route 
          path="/goals" 
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar twinStatus={twinData.twinStatus} isCollapsed={isCollapsed} onToggleCollapse={toggleSidebar} />
                <main className={mainClasses}>
                  <Goals triggerGoalsRefresh={triggerTwinRefresh} />
                </main>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Insights panel */}
        <Route 
          path="/insights" 
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar twinStatus={twinData.twinStatus} isCollapsed={isCollapsed} onToggleCollapse={toggleSidebar} />
                <main className={mainClasses}>
                  <Insights twinData={twinData} loadingTwin={loadingTwin} />
                </main>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Talk to Twin Conversational AI Panel */}
        <Route 
          path="/talk" 
          element={
            <ProtectedRoute>
              <div className="flex">
                <Sidebar twinStatus={twinData.twinStatus} isCollapsed={isCollapsed} onToggleCollapse={toggleSidebar} />
                <main className={mainClasses}>
                  <TalkToTwin />
                </main>
              </div>
            </ProtectedRoute>
          } 
        />

        {/* Onboarding Wizard Setup */}
        <Route 
          path="/onboarding" 
          element={
            <OnboardingRoute>
              <Onboarding />
            </OnboardingRoute>
          } 
        />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
