import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Search, PlusCircle, LayoutDashboard, LogIn, LogOut, User, Menu, X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-navy-900 text-white border-b border-navy-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 group-hover:bg-teal-500/30 transition shadow-inner">
              <Shield className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-teal-100 to-teal-300 bg-clip-text text-transparent">
                ResolveTrack
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/60">
                Grievance Bureau
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <Link
              to="/categories"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-navy-800 transition"
            >
              <PlusCircle className="w-4 h-4 text-teal-400" />
              <span>Report Grievance</span>
            </Link>

            <Link
              to="/track"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-navy-800 transition"
            >
              <Search className="w-4 h-4 text-teal-400" />
              <span>Track Complaint</span>
            </Link>

            {user && (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-navy-800 transition"
              >
                <LayoutDashboard className="w-4 h-4 text-teal-400" />
                <span>My Dashboard</span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition"
              >
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Auth Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-3 border-l border-navy-700">
                  <div className="w-7 h-7 rounded-full bg-teal-700/60 flex items-center justify-center text-teal-200 text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-medium text-slate-200 leading-none">{user.name.split(' ')[0]}</p>
                    <span className="text-[10px] text-teal-400 font-mono capitalize">{user.role}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-200 hover:text-white hover:bg-navy-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/admin-login"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition shadow-sm"
                >
                  Admin Portal
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-950 border-b border-navy-800 px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/categories"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 px-3 text-sm font-medium text-slate-200 hover:bg-navy-800 rounded-lg"
          >
            <PlusCircle className="w-4 h-4 text-teal-400" />
            <span>Report Grievance</span>
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 px-3 text-sm font-medium text-slate-200 hover:bg-navy-800 rounded-lg"
          >
            <Search className="w-4 h-4 text-teal-400" />
            <span>Track Complaint</span>
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 text-sm font-medium text-slate-200 hover:bg-navy-800 rounded-lg"
            >
              <LayoutDashboard className="w-4 h-4 text-teal-400" />
              <span>User Dashboard</span>
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 px-3 text-sm font-medium text-amber-300 bg-amber-500/10 rounded-lg"
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Admin Console</span>
            </Link>
          )}
          <div className="pt-3 border-t border-navy-800 flex flex-col gap-2">
            {user ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 py-2 px-3 text-sm font-medium text-rose-300 hover:bg-navy-800 rounded-lg w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user.email})</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 px-3 text-xs font-semibold rounded-lg bg-navy-800 text-white"
                >
                  Citizen Login
                </Link>
                <Link
                  to="/admin-login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 px-3 text-xs font-semibold rounded-lg bg-teal-600 text-white"
                >
                  Admin Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
