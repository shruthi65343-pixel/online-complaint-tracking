import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import CategorySelectPage from './pages/CategorySelectPage';
import ComplaintFormPage from './pages/ComplaintFormPage';
import ConfirmationPage from './pages/ConfirmationPage';
import TrackingPage from './pages/TrackingPage';
import UserDashboardPage from './pages/UserDashboardPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/categories" element={<CategorySelectPage />} />
              <Route path="/submit" element={<ComplaintFormPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/track" element={<TrackingPage />} />
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
