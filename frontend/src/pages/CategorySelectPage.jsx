import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  GraduationCap,
  Zap,
  Building2,
  Trash2,
  Laptop,
  HelpCircle,
  ArrowRight,
  Shield,
  CheckCircle2,
  Info
} from 'lucide-react';
import { COMPLAINT_CATEGORIES } from '../utils/categories';

export default function CategorySelectPage() {
  const navigate = useNavigate();

  const getIcon = (name) => {
    switch (name) {
      case 'ShieldAlert': return <ShieldAlert className="w-8 h-8 text-rose-600" />;
      case 'GraduationCap': return <GraduationCap className="w-8 h-8 text-indigo-600" />;
      case 'Zap': return <Zap className="w-8 h-8 text-amber-600" />;
      case 'Building2': return <Building2 className="w-8 h-8 text-teal-600" />;
      case 'Trash2': return <Trash2 className="w-8 h-8 text-emerald-600" />;
      case 'Laptop': return <Laptop className="w-8 h-8 text-sky-600" />;
      default: return <HelpCircle className="w-8 h-8 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>Step 1: Choose Domain</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Select Complaint Category
        </h1>
        <p className="text-slate-600 text-sm mt-2 leading-relaxed">
          Please select the category that best describes your grievance.
          Each category features customized fields, tailored privacy settings, and direct routing to authorized nodal officers.
        </p>
      </div>

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMPLAINT_CATEGORIES.map((cat) => (
          <div
            key={cat.id}
            onClick={() => navigate(`/submit?category=${encodeURIComponent(cat.name)}`)}
            className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-teal-500 hover:shadow-xl transition cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${cat.accentColor} group-hover:scale-105 transition-transform`}>
                  {getIcon(cat.iconName)}
                </div>
                {cat.isSensitive ? (
                  <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                    Confidential Shield
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    Standard Track
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 group-hover:text-teal-700 flex items-center gap-1 transition">
                <span>Open Submission Form</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Help box */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800">Need help deciding?</strong> If your grievance does not strictly fit under electricity, education, municipal, government, or safety, you may select <strong>Other</strong>. The intake triage team will examine your submission and reroute it to the appropriate department.
        </div>
      </div>
    </div>
  );
}
