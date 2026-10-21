import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import useAuth from './hooks/useAuth.js';

// Modular Pages
import LandingPage from './pages/LandingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ExplorePage from './pages/Explore.jsx';
import ItineraryResultsPage from './pages/ItineraryResultsPage.jsx';
import SharedItineraryPage from './pages/SharedItinerary.jsx';
import MyTripsPage from './pages/MyTrips.jsx';
import SettingsPage from './pages/Settings.jsx';

// Auth Pages
import LoginPage from './pages/auth/LoginPage.jsx';
import SignupPage from './pages/auth/SignupPage.jsx';
import VerifyEmailPage from './pages/auth/VerifyEmailPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';
import TwoFactorSetupPage from './pages/auth/TwoFactorSetupPage.jsx';

// Feature Pages
import PackingListPage from './pages/PackingListPage.jsx';
import GroupTripsPage from './pages/GroupTripsPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import PriceTrackerPage from './pages/PriceTrackerPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import ReviewsPage from './pages/ReviewsPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';

// Premium Core Pages
import DestinationDetailPage from './pages/DestinationDetailPage.jsx';
import HelpCenterPage from './pages/HelpCenterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import BookingDetailPage from './pages/BookingDetailPage.jsx';
import AIChatPage from './pages/AIChatPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';

// UI Overlays & Effects
import AuthModal from './components/AuthModal.jsx';
import CustomCursor from './components/ui/CustomCursor.jsx';
import PageTransition, { ScrollProgress } from './components/ui/PageTransition.jsx';

// ─── Router Content Wrapper ───
const RouterContent = () => {
  const { isAuthModalOpen, authModalMessage, closeAuthModal } = useAuth();

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/planner" element={<DashboardPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/itinerary/:id" element={<ItineraryResultsPage />} />
        <Route path="/shared/:shareToken" element={<SharedItineraryPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Feature routes */}
        <Route path="/packing-list/:itineraryId" element={<PackingListPage />} />
        <Route path="/group-trip/:itineraryId" element={<GroupTripsPage />} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/price-tracker" element={<ProtectedRoute><PriceTrackerPage /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
        <Route path="/reviews/:itineraryId" element={<ProtectedRoute><ReviewsPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />

        {/* Premium Core Route Pages */}
        <Route path="/destination/:slug" element={<DestinationDetailPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/booking/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
        <Route path="/ai-chat" element={<AIChatPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Protected general routes */}
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

// ─── Main App Entry Component ───
const App = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <CustomCursor />
          <ScrollProgress />
          <PageTransition>
            <RouterContent />
          </PageTransition>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
