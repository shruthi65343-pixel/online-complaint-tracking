import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  Check,
  Search,
  AlertTriangle,
  ArrowRight,
  Printer,
  ShieldAlert,
  Home,
  Lock
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

export default function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  const state = location.state || {};
  const {
    trackingId = 'RT-2026-DEMO99',
    verificationCode = '492019',
    category = 'Education and Examination',
    status = 'Submitted',
    createdAt = new Date().toISOString(),
    possibleDuplicateWarning = null
  } = state;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Success Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-navy-900 p-8 text-white text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center text-teal-300 shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Grievance Registered Successfully
          </h1>
          <p className="text-xs sm:text-sm text-teal-100 max-w-lg mx-auto">
            Your complaint has been logged in the centralized redressal system and routed for official intake review.
          </p>
        </div>

        {/* Warning if possible duplicate detected */}
        {possibleDuplicateWarning && (
          <div className="m-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Notice: Prior Report Registered Nearby</p>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                {possibleDuplicateWarning} Your submission has been cross-referenced to ensure consolidated agency attention while preserving complete confidentiality.
              </p>
            </div>
          </div>
        )}

        {/* Credentials / Tracking Box */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tracking ID */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Unique Tracking Reference
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xl sm:text-2xl font-black text-navy-900 tracking-wider">
                  {trackingId}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(trackingId, 'id')}
                  className="p-2 text-slate-500 hover:text-teal-700 hover:bg-slate-200/60 rounded-xl transition"
                  title="Copy Reference"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Keep this code to check progress anytime on the public tracking portal.
              </p>
            </div>

            {/* Verification Code */}
            <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Verification PIN
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(verificationCode, 'pin')}
                  className="p-2 text-teal-700 hover:bg-teal-100 rounded-xl transition"
                  title="Copy PIN"
                >
                  {copiedPin ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="font-mono text-xl sm:text-2xl font-black text-teal-900 tracking-widest">
                {verificationCode}
              </div>
              <p className="text-[11px] text-teal-700">
                Required for accessing sensitive reports or providing follow-up answers without an account.
              </p>
            </div>
          </div>

          {/* Metadata Breakdown */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs space-y-3">
            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Domain Category:</span>
              <span className="font-bold text-slate-800">{category}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Initial Status:</span>
              <StatusBadge status={status} size="sm" />
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Submission Timestamp:</span>
              <span className="font-mono text-slate-700">
                {new Date(createdAt).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 font-medium">Assigned Handling:</span>
              <span className="text-teal-800 font-semibold">Central Intake Queue</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Acknowledgment</span>
            </button>

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Return Home
              </Link>
              <Link
                to={`/track?id=${encodeURIComponent(trackingId)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-teal-900/20"
              >
                <span>Track This Grievance</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
