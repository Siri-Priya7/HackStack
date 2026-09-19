import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import OtpLogin from './pages/OtpLogin';
import VoiceOnboarding from './pages/VoiceOnboarding';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import VoiceCommand from './pages/VoiceCommand';
import Transactions from './pages/Transactions';
import Alerts from './pages/Alerts';
import AdminDashboard from './pages/AdminDashboard';
import StaffManagement from './pages/StaffManagement';

function AppContent() {
  const { user, isAdmin, isStaff, language } = useAuth();

  const [authView, setAuthView] = useState('landing'); // 'landing' | 'otp-login' | 'voice-onboard'
  const [initialOnboardPhone, setInitialOnboardPhone] = useState('');
  
  // Set default tab according to user role
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (isAdmin) {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('dashboard');
    }
  }, [user?.role]);

  // Unauthenticated Flow: Landing -> Voice Onboard or OTP Login
  if (!user) {
    if (authView === 'otp-login') {
      return (
        <OtpLogin
          key={language}
          onBackToHome={() => setAuthView('landing')}
          onGoToOnboarding={(phone) => {
            setInitialOnboardPhone(phone);
            setAuthView('voice-onboard');
          }}
        />
      );
    }

    if (authView === 'voice-onboard') {
      return (
        <VoiceOnboarding
          onBackToHome={() => setAuthView('landing')}
          initialPhone={initialOnboardPhone}
        />
      );
    }

    // Default: Public Landing Page with interactive buttons
    return (
      <LandingPage
        key={language}
        onSelectAuthView={(view) => setAuthView(view)}
      />
    );
  }

  // Authenticated Role-Based Workspace
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Role-Aware Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onGoHome={() => setAuthView('landing')}
      />

      {/* Main Content Area — key forces full re-render on language change for instant i18n */}
      <main key={language} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 transition-opacity duration-150">
        {/* Platform Admin Only */}
        {isAdmin && activeTab === 'admin-dashboard' && <AdminDashboard />}

        {/* Shop Owner & Staff Screens */}
        {!isAdmin && activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {!isAdmin && activeTab === 'voice' && <VoiceCommand />}
        {!isAdmin && activeTab === 'inventory' && <Inventory />}
        {!isAdmin && activeTab === 'transactions' && <Transactions />}
        
        {/* Shop Owner Specific Screens */}
        {!isAdmin && !isStaff && activeTab === 'alerts' && <Alerts />}
        {!isAdmin && !isStaff && activeTab === 'staff' && <StaffManagement />}
      </main>

      {/* Quick Footer */}
      <footer className="hidden md:block border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <p className="font-medium">
            Voice-First Inventory Management for Indian Kirana & Small Merchants
          </p>
          <div className="flex items-center gap-4">
            <span className="font-bold text-orange-600">Apna Kirana AI • Multi-Tenant RBAC</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
