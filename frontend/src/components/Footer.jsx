import React from 'react';
import { Shield, Lock, MapPin, CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-400 border-t border-navy-900 mt-auto text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-teal-400" />
              <span className="font-bold text-base tracking-tight">ResolveTrack</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Centralized, privacy-first grievance reporting and transparent resolution workflow engine.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-teal-400">
              <Lock className="w-3.5 h-3.5" />
              <span>End-to-end auditability & privacy redaction</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Citizens</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/categories" className="hover:text-teal-300 transition">File a Grievance</Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-teal-300 transition">Track by Reference ID</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-300 transition">Citizen Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Governance */}
          <div>
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Administration</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/admin-login" className="hover:text-teal-300 transition">Officer Portal</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-teal-300 transition">Redressal Triage Console</Link>
              </li>
              <li>
                <span className="text-slate-500">SLA Aging Engine: Enabled</span>
              </li>
            </ul>
          </div>

          {/* Security Guarantee */}
          <div>
            <h4 className="font-semibold text-slate-200 text-xs uppercase tracking-wider mb-3">Privacy Framework</h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Personal safety and harassment complaints are assigned encrypted access boundaries. GPS coordinates are never leaked in public search logs.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Local MongoDB Cluster Connected</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} ResolveTrack Grievance Redressal System. Hackathon MVP Edition.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Charter</span>
            <span className="hover:text-slate-400 cursor-pointer">Service Level Agreements</span>
            <span className="hover:text-slate-400 cursor-pointer">Incident Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
