import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import VoiceCommand from './pages/VoiceCommand';
import Transactions from './pages/Transactions';
import Alerts from './pages/Alerts';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'

  // If not logged in, show Login / Register
  if (!user) {
    return authView === 'login' ? (
      <Login onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'voice' && <VoiceCommand />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'alerts' && <Alerts />}
        {activeTab === 'transactions' && <Transactions />}
      </main>

      {/* Desktop Quick Footer */}
      <footer className="hidden md:block border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <p className="font-medium">
            Voice-First Inventory Management for Small Indian Kirana Businesses
          </p>
          <div className="flex items-center gap-4">
            <span>Powered by Multilingual NLP & Speech Recognition</span>
            <span className="font-bold text-orange-600">Apna Kirana AI</span>
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
