import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { Terminal, MessageSquare } from 'lucide-react';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider, useToast } from './components/ui/Toast.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppShell from './components/ui/AppShell.jsx';
import Card from './components/ui/Card.jsx';
import StatusPill from './components/ui/StatusPill.jsx';
import ChatRefinement from './components/ChatRefinement.jsx';
import useAuth from './hooks/useAuth.js';

// Auth Components & Modals
import AuthModal from './components/AuthModal.jsx';
import TripRequestForm from './components/TripRequestForm.jsx';

// Direct Link Auth Pages (kept for email verify / resets)
import VerifyEmailPage from './pages/auth/VerifyEmailPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import TwoFactorSetupPage from './pages/auth/TwoFactorSetupPage.jsx';

// Itinerary Results Page
import ItineraryResultsPage from './pages/ItineraryResultsPage.jsx';

// My Trips Page
import MyTripsPage from './pages/MyTrips.jsx';

// Settings Page
import SettingsPage from './pages/Settings.jsx';

// Explore Page
import ExplorePage from './pages/Explore.jsx';

// Shared Itinerary Page
import SharedItineraryPage from './pages/SharedItinerary.jsx';

// Main Application View (Publicly accessible to guests)
const Dashboard = () => {
  const { user, isAuthenticated, handleOAuthToken } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Handle Google OAuth token passing via URL redirects
  useEffect(() => {
    const token = searchParams.get('token');
    const oauthError = searchParams.get('error');

    if (token) {
      handleOAuthToken(token)
        .then(() => {
          showSuccessToast('Successfully signed in with Google!');
          setSearchParams({});
        })
        .catch(() => {
          showErrorToast('Failed to sign in with Google.');
          setSearchParams({});
        });
    } else if (oauthError) {
      showErrorToast(decodeURIComponent(oauthError) || 'OAuth authentication failed');
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, handleOAuthToken, showSuccessToast, showErrorToast]);

  return (
    <AppShell>
      <div className="w-full px-5 md:px-8 py-16 space-y-16 animate-fade-in flex-grow flex flex-col">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <StatusPill label="AGENT READY" color="blue" pulsing={true} />
          <h1 className="display-lg text-[#e5e2e1]">
            Plan Your Next <span className="text-[#eac249]">Indian Adventure</span>
          </h1>
          <p className="body-lg text-[#c4c7c7] max-w-2xl mx-auto">
            AI-powered travel planning for the modern explorer. Discover curated routes, optimize your journey, and experience India like never before.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Trip Request Form Section */}
          <Card className="w-full">
            <TripRequestForm onSubmitSuccess={(request) => {
              console.log('Trip Request Submitted successfully:', request);
            }} />
          </Card>

          {/* Live Orchestration Logs */}
          <Card noPadding className="overflow-hidden border border-[#4d4635] w-full min-h-[400px] relative">
            <div className="bg-gradient-to-b from-[#2a2a2a] to-[#202020] px-4 py-3 border-b border-[#4d4635] flex items-center justify-between">
              <span className="label-system text-[#8e9192] flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                LIVE ORCHESTRATION ENGINE
              </span>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[#a5c8ff] shadow-[0_0_4px_rgba(165,200,255,0.6)]"></span>
                <span className="w-2 h-2 rounded-full bg-[#a5c8ff] shadow-[0_0_4px_rgba(165,200,255,0.6)]"></span>
                <span className="w-2 h-2 rounded-full bg-[#a5c8ff] shadow-[0_0_4px_rgba(165,200,255,0.6)]"></span>
              </div>
            </div>
            <div className="p-4 bg-[#0e0e0e] font-mono text-xs text-[#8e9192] space-y-2.5 h-full overflow-y-auto shadow-[inset_4px_4px_8px_rgba(0,0,0,0.6),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]">
              <div className="flex gap-4">
                <span className="text-[#8e9192]">[SYSTEM]</span>
                <span className="text-[#e5e2e1]">System listening. Ready to build itinerary corridors.</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#8e9192]">[OK]</span>
                <span className="text-[#e5e2e1]">Initialized connection with anonymous guest correlation session.</span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#eac249]">[AI]</span>
                <span className="text-[#e5e2e1]">Waiting for input...</span>
              </div>
            </div>
            <div className="absolute bottom-4 right-4">
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-12 h-12 rounded-full bg-gradient-to-b from-[#eac249] to-[#af8d11] text-[#3d2f00] flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.5)] active:bg-gradient-to-b active:from-[#af8d11] active:to-[#eac249] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] active:translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </Card>
        </div>

        {/* Trending Escapes */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="headline-md text-[#e5e2e1]">Trending Escapes</h2>
            <a href="/explore" className="text-sm font-semibold text-[#eac249] hover:underline cursor-pointer">View all destinations →</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Trending cards will be added here */}
          </div>
        </div>
      </div>

      {/* Chat Refinement Modal */}
      <ChatRefinement
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </AppShell>
  );
};

// Routing Wrapper
const RouterContent = () => {
  const { isAuthModalOpen, authModalMessage, closeAuthModal } = useAuth();
  
  return (
    <>
      <Routes>
        {/* Public routes (accessible to guests) */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/itinerary/:id" element={<ItineraryResultsPage />} />
        <Route path="/shared/:shareToken" element={<SharedItineraryPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected routes (require registration) */}
        <Route
          path="/settings/2fa"
          element={
            <ProtectedRoute>
              <TwoFactorSetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-trips"
          element={
            <ProtectedRoute>
              <MyTripsPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Auth Modal Overlay */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        contextMessage={authModalMessage}
      />
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <RouterContent />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
