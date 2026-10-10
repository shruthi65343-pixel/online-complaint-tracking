import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Search,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  Zap,
  Building2,
  Trash2,
  Laptop,
  HelpCircle,
  Clock,
  CheckCircle2,
  Lock,
  Layers,
  MapPin,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { COMPLAINT_CATEGORIES } from '../utils/categories';

export default function LandingPage() {
  const [quickTrackId, setQuickTrackId] = useState('');
  const navigate = useNavigate();

  const handleQuickTrack = (e) => {
    e.preventDefault();
    if (quickTrackId.trim()) {
      navigate(`/track?id=${encodeURIComponent(quickTrackId.trim().toUpperCase())}`);
    }
  };

  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert className="w-6 h-6 text-rose-600" />;
      case 'GraduationCap': return <GraduationCap className="w-6 h-6 text-indigo-600" />;
      case 'Zap': return <Zap className="w-6 h-6 text-amber-600" />;
      case 'Building2': return <Building2 className="w-6 h-6 text-teal-600" />;
      case 'Trash2': return <Trash2 className="w-6 h-6 text-emerald-600" />;
      case 'Laptop': return <Laptop className="w-6 h-6 text-sky-600" />;
      default: return <HelpCircle className="w-6 h-6 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-navy-900 via-navy-950 to-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-navy-800">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <Shield className="w-4 h-4 text-teal-400" />
            <span>Next-Gen Multi-Category Grievance Redressal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Transparent, Privacy-First <span className="bg-gradient-to-r from-teal-300 to-teal-100 bg-clip-text text-transparent">Complaint Tracking</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Report grievances across education, municipal infrastructure, utilities, and sensitive safety concerns.
            Dynamic tailored forms, privacy-preserving location consent, and cryptographic tracking IDs.
          </p>

          {/* Quick Tracking Search Bar */}
          <div className="max-w-xl mx-auto pt-2">
            <form onSubmit={handleQuickTrack} className="flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-5 h-5 text-teal-300 absolute left-3.5" />
                <input
                  type="text"
                  placeholder="Enter Tracking Reference (e.g. RT-2026-ED8102)"
                  value={quickTrackId}
                  onChange={(e) => setQuickTrackId(e.target.value)}
                  className="w-full bg-transparent pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-teal-500 hover:bg-teal-400 text-navy-950 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-md shrink-0"
              >
                <span>Track Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-2.5 flex items-center justify-center gap-3 text-xs text-slate-400">
              <span>Try sample references:</span>
              <button
                type="button"
                onClick={() => navigate('/track?id=RT-2026-ED8102')}
                className="text-teal-300 hover:underline font-mono"
              >
                RT-2026-ED8102
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigate('/track?id=RT-2026-EL3091')}
                className="text-teal-300 hover:underline font-mono"
              >
                RT-2026-EL3091
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigate('/track?id=RT-2026-HS9921')}
                className="text-rose-300 hover:underline font-mono"
              >
                RT-2026-HS9921
              </button>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              to="/categories"
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm transition shadow-lg shadow-teal-900/30 flex items-center gap-2"
            >
              <span>File a New Grievance</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/admin-login"
              className="px-6 py-3 rounded-xl bg-navy-800/80 hover:bg-navy-800 border border-navy-700 text-slate-200 font-semibold text-sm transition flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-teal-400" />
              <span>Administrator Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Specialized Complaint Categories
          </h2>
          <p className="text-slate-600 text-sm">
            Select a domain to open dynamic, contextual forms customized for each department.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {COMPLAINT_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="group bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-teal-500/50 hover:shadow-xl transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${cat.accentColor}`}>
                    {getCategoryIcon(cat.iconName)}
                  </div>
                  {cat.isSensitive && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      Confidential
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-teal-700 transition">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">
                  {cat.locationRequirement === 'recommended' ? 'Location Advised' : 'Location Optional'}
                </span>
                <Link
                  to={`/submit?category=${encodeURIComponent(cat.name)}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 group-hover:translate-x-1 transition"
                >
                  <span>File Complaint</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Innovative Features Highlight */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">System Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Built for Integrity & Civic Accountability
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Transparent Timeline & Aging</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every administrative remark and status transition is recorded with responsible officer metadata and timestamps. The aging engine flags stagnating tickets after 3 and 7 days.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Confidential Safety Shield</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sensitive harassment and misconduct grievances require 6-digit cryptographic verification codes or reporter authentication before private narratives are rendered.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Privacy-Aware Geolocation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Three clear choices: Browser GPS detection, manual landmark entry, or complete opt-out. Coordinates are strictly masked in public inquiries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Helper Box for Hackathon Reviewers */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-900 to-navy-950 text-white rounded-2xl p-6 sm:p-8 border border-navy-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-teal-300 font-bold text-sm uppercase tracking-wider">
            <CheckCircle2 className="w-5 h-5" />
            <span>Hackathon Evaluation & Seed Data</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The local database is seeded with realistic records and pre-configured accounts for testing:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-navy-800/80 border border-navy-700 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">Administrator Account</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-800">Admin</span>
              </div>
              <p className="text-slate-300">Email: <code className="text-teal-300 font-mono">admin@resolvetrack.gov</code></p>
              <p className="text-slate-300">Password: <code className="text-teal-300 font-mono">Admin@ResolveTrack2026</code></p>
              <div className="pt-2">
                <Link to="/admin-login" className="text-teal-400 hover:underline font-semibold inline-flex items-center gap-1">
                  Log in as Admin <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-navy-800/80 border border-navy-700 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-300">Citizen / Student Account</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-teal-950 text-teal-400 border border-teal-800">Citizen</span>
              </div>
              <p className="text-slate-300">Email: <code className="text-teal-300 font-mono">shruthi.citizen@example.com</code></p>
              <p className="text-slate-300">Password: <code className="text-teal-300 font-mono">Citizen@12345</code></p>
              <div className="pt-2">
                <Link to="/login" className="text-teal-400 hover:underline font-semibold inline-flex items-center gap-1">
                  Log in as Citizen <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
