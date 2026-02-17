import React, { useState, useEffect } from 'react';
import './App.css';
import LoadingPage from './pages/LoadingPage/LoadingPage';
import IntroPage from './pages/IntroPage/IntroPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage/AdminDashboardPage';
import EmailConfirmationPage from './pages/EmailConfirmationPage/EmailConfirmationPage';
import ResetPasswordPage from './pages/ResetPasswordPage/ResetPasswordPage';
import { clearToken, getToken, getUserFromToken, setToken } from './services/auth';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showMainApp, setShowMainApp] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;
    
    if (path === '/email-confirmation' || path.startsWith('/email-confirmation')) {
      setCurrentPage('email-confirmation');
      return;
    }
    
    if (path === '/reset-password' || path.startsWith('/reset-password')) {
      setCurrentPage('reset-password');
      return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      const user = getUserFromToken(tokenFromUrl);
      if (user) {
        setAuthUser(user);
        setShowIntro(false);
        setShowMainApp(true);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }
    }
   
    setIsLoading(true);
    setShowIntro(false);
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    const token = getToken();
    
    if (token) {
      const user = getUserFromToken(token);
      if (user && user.id) {
        setAuthUser(user);
        setShowIntro(false);
        setShowMainApp(true);
        return;
      }
      clearToken();
    }
    
    setAuthUser(null);
    setShowIntro(true);
  };

  const handleGetStarted = () => {
    setShowIntro(false);
    setShowMainApp(true);
  };

  const handleLoginSuccess = (token) => {
    setToken(token);
    const user = getUserFromToken(token);
    setAuthUser(user);
    setShowIntro(false);
    setShowMainApp(true);
  };

  const handleLogout = () => {
    clearToken();
    setAuthUser(null);
    setShowMainApp(false);
    setShowIntro(true);
  };

  return (
    <ToastProvider>
      {currentPage === 'email-confirmation' && <EmailConfirmationPage />}
      {currentPage === 'reset-password' && <ResetPasswordPage />}
      {isLoading && <LoadingPage onLoadingComplete={handleLoadingComplete} />}
      {showIntro && <IntroPage onGetStarted={handleGetStarted} onLoginSuccess={handleLoginSuccess} />}
      {showMainApp && (
        authUser?.roles?.includes('Admin') ? (
          <AdminDashboardPage onBack={() => setShowMainApp(false)} onLogout={handleLogout} authUser={authUser} />
        ) : (
          <DashboardPage onBack={() => setShowMainApp(false)} onLogout={handleLogout} authUser={authUser} />
        )
      )}
      {!currentPage && !isLoading && !showIntro && !showMainApp && null}
    </ToastProvider>
  );
}

export default App;
