import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.user?.role !== 'admin') {
          setError('Access denied. This account does not possess administrator credentials.');
        } else {
          navigate('/admin');
        }
      } else {
        setError(res.message || 'Invalid administrator credentials.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillAdmin = () => {
    setEmail('admin@resolvetrack.gov');
    setPassword('Admin@ResolveTrack2026');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 mx-auto flex items-center justify-center shadow-inner">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded-full">
          Restricted Officer Terminal
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
          Administrator Console
        </h1>
        <p className="text-xs text-slate-500">
          Authorized personnel only. Sessions are cryptographically signed and audited.
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Official Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="officer@resolvetrack.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Passphrase
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-navy-900 hover:bg-navy-950 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-navy-900/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating Officer...' : 'Authenticate & Enter Console'}</span>
            <ArrowRight className="w-4 h-4 text-teal-400" />
          </button>
        </form>

        {/* Quick Fill Button */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleFillAdmin}
            className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition flex items-center justify-center gap-2"
          >
            <Key className="w-3.5 h-3.5 text-teal-700" />
            <span>Fill Seeded Chief Admin Credentials</span>
          </button>
        </div>

        <div className="text-center">
          <Link to="/" className="text-xs text-slate-500 hover:text-slate-800">
            ← Return to Public Citizen Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
