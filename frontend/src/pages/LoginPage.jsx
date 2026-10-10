import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const res = await register(formData);
        if (res.success) {
          navigate('/dashboard');
        } else {
          setError(res.message || 'Registration failed.');
        }
      } else {
        const res = await login(formData.email, formData.password);
        if (res.success) {
          navigate(res.user?.role === 'admin' ? '/admin' : '/dashboard');
        } else {
          setError(res.message || 'Invalid email or password.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const setTestCitizen = () => {
    setFormData({
      name: 'Shruthi Sundaram',
      email: 'shruthi.citizen@example.com',
      password: 'Citizen@12345',
      phone: '+91 98111 22334'
    });
    setIsRegister(false);
  };

  const setTestStudent = () => {
    setFormData({
      name: 'Aravind Menon',
      email: 'aravind.student@example.com',
      password: 'Student@12345',
      phone: '+91 98222 33445'
    });
    setIsRegister(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-700 mx-auto flex items-center justify-center">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {isRegister ? 'Create Citizen Account' : 'Citizen Sign In'}
        </h1>
        <p className="text-xs text-slate-500">
          Access your personal grievance history and respond to department queries.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`py-2 rounded-lg transition ${!isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`py-2 rounded-lg transition ${isRegister ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Shruthi Sundaram"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="e.g. citizen@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-teal-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Processing...' : isRegister ? 'Create Citizen Account' : 'Sign In to Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick fill buttons for testing */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-semibold text-slate-500 text-center uppercase tracking-wider">
            Quick-Fill Test Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={setTestCitizen}
              className="p-2 border border-slate-200 rounded-xl text-[11px] text-slate-700 hover:bg-slate-50 transition font-medium"
            >
              Fill Citizen Shruthi
            </button>
            <button
              type="button"
              onClick={setTestStudent}
              className="p-2 border border-slate-200 rounded-xl text-[11px] text-slate-700 hover:bg-slate-50 transition font-medium"
            >
              Fill Student Aravind
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link to="/admin-login" className="text-xs text-teal-700 hover:underline font-semibold">
            Are you a Grievance Review Officer? Admin Login →
          </Link>
        </div>
      </div>
    </div>
  );
}
