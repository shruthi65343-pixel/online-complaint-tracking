import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Shield,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  MessageSquare,
  Send,
  Building,
  User,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import TimelineView from '../components/TimelineView';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function TrackingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryId = searchParams.get('id') || '';
  const { user } = useAuth();

  const [trackingInput, setTrackingInput] = useState(queryId);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Additional Information state (for Awaiting Information response)
  const [additionalInfoText, setAdditionalInfoText] = useState('');
  const [submittingInfo, setSubmittingInfo] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState('');

  const fetchTrackingData = async (idToSearch, codeToPass = '') => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setError('');
    setInfoSuccess('');

    try {
      const url = `/complaints/track/${encodeURIComponent(idToSearch.trim().toUpperCase())}${
        codeToPass ? `?verificationCode=${encodeURIComponent(codeToPass.trim())}` : ''
      }`;
      const res = await api.get(url);
      if (res.data?.success) {
        setResult(res.data);
      } else {
        setError(res.data?.message || 'Unable to find complaint.');
        setResult(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Complaint not found. Verify the reference code.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryId) {
      setTrackingInput(queryId);
      fetchTrackingData(queryId);
    }
  }, [queryId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      setSearchParams({ id: trackingInput.trim().toUpperCase() });
      fetchTrackingData(trackingInput, verificationCode);
    }
  };

  const handleUnlockSensitive = (e) => {
    e.preventDefault();
    if (verificationCode.trim()) {
      fetchTrackingData(trackingInput, verificationCode);
    }
  };

  // Submit additional information response
  const handleProvideInfo = async (e) => {
    e.preventDefault();
    if (!additionalInfoText.trim() || !result?.complaint?.id) return;

    setSubmittingInfo(true);
    try {
      const res = await api.post(`/complaints/${result.complaint.id}/provide-info`, {
        message: additionalInfoText,
        verificationCode: verificationCode || undefined
      });
      if (res.data?.success) {
        setInfoSuccess('Your additional information was dispatched to the review team.');
        setAdditionalInfoText('');
        // Refresh complaint
        fetchTrackingData(trackingInput, verificationCode);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit additional information.');
    } finally {
      setSubmittingInfo(false);
    }
  };

  const isRestricted = result?.isSensitiveRestricted;
  const complaint = result?.complaint;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
          <Search className="w-3.5 h-3.5" />
          <span>Real-time Audit Tracker</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Track Grievance Status
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Enter your unique tracking reference to view milestones, officer remarks, and resolution history.
        </p>

        {/* Input Bar */}
        <form onSubmit={handleSearchSubmit} className="pt-4 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
          <input
            type="text"
            required
            placeholder="e.g. RT-2026-ED8102 or RT-2026-EL3091"
            value={trackingInput}
            onChange={(e) => setTrackingInput(e.target.value)}
            className="flex-1 font-mono text-sm px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 uppercase"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>{loading ? 'Searching...' : 'Track Reference'}</span>
          </button>
        </form>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-3 max-w-xl mx-auto">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* RESTRICTED CONFIDENTIAL CASE NOTICE */}
      {isRestricted && (
        <div className="bg-white rounded-3xl border border-rose-200 shadow-lg p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                Confidential Protective Tier
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                Restricted Privacy Safeguard
              </h2>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                This report involves personal safety or harassment concerns. In adherence to privacy standards, personal narratives, names, and precise incident logs are restricted.
              </p>
            </div>
          </div>

          {/* Basic Public Info Allowed */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border text-xs">
            <div>
              <span className="text-slate-400">Tracking Ref:</span>
              <p className="font-mono font-bold text-slate-800">{result.trackingId}</p>
            </div>
            <div>
              <span className="text-slate-400">Category:</span>
              <p className="font-semibold text-slate-800">{result.category}</p>
            </div>
            <div>
              <span className="text-slate-400">Current Status:</span>
              <div className="mt-0.5"><StatusBadge status={result.status} size="sm" /></div>
            </div>
            <div>
              <span className="text-slate-400">Lodged On:</span>
              <p className="text-slate-700 font-mono">{new Date(result.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Form to Unlock via PIN */}
          <form onSubmit={handleUnlockSensitive} className="p-5 bg-rose-50/60 rounded-2xl border border-rose-200 space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              Enter 6-Digit Verification PIN or Log in with Reporter Account:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                maxLength={6}
                placeholder="Enter PIN (e.g. 839104)"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="font-mono text-sm tracking-widest px-4 py-2.5 rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-500/20"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Verify Access</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              The verification PIN was generated on the confirmation screen upon submission.
            </p>
          </form>

          {/* Public Milestone Timeline (without internal notes) */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Milestone Progress</h3>
            <TimelineView history={result.timeline} showInternal={false} />
          </div>
        </div>
      )}

      {/* FULL TRACKING DETAILS (Authorized or Standard) */}
      {!isRestricted && complaint && (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-navy-900 p-6 sm:p-8 text-white space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] text-teal-300 font-mono uppercase tracking-wider">
                      Reference: {complaint.trackingId}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {complaint.title}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={complaint.status} size="lg" />
                  <PriorityBadge priority={complaint.priority} size="lg" />
                </div>
              </div>

              {/* Top Meta info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-navy-800 text-xs">
                <div>
                  <span className="text-slate-400">Category:</span>
                  <p className="text-slate-200 font-semibold">{complaint.category}</p>
                </div>
                <div>
                  <span className="text-slate-400">Complainant:</span>
                  <p className="text-slate-200 font-semibold">{complaint.fullName}</p>
                </div>
                <div>
                  <span className="text-slate-400">Submission Date:</span>
                  <p className="text-slate-200 font-mono">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-slate-400">Assigned Wing:</span>
                  <p className="text-teal-300 font-semibold">{complaint.assignedOfficer || 'Intake Bureau'}</p>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Public Remarks Alert */}
              {complaint.publicRemarks && (
                <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl text-xs text-teal-900 flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-teal-800">Latest Public Remark from Bureau:</span>
                    <p className="text-teal-900 mt-1 leading-relaxed">{complaint.publicRemarks}</p>
                  </div>
                </div>
              )}

              {/* Narrative */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Report Narrative
                </h3>
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-2xl border">
                  {complaint.description}
                </p>
              </div>

              {/* Dynamic Category Details */}
              {complaint.categoryDetails && Object.keys(complaint.categoryDetails).length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Domain-Specific Attributes
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border text-xs">
                    {/* Education */}
                    {complaint.categoryDetails.institution && (
                      <div>
                        <span className="text-slate-400">Institution:</span>
                        <p className="font-semibold text-slate-800">{complaint.categoryDetails.institution}</p>
                      </div>
                    )}
                    {complaint.categoryDetails.courseProgram && (
                      <div>
                        <span className="text-slate-400">Course / Program:</span>
                        <p className="font-semibold text-slate-800">{complaint.categoryDetails.courseProgram}</p>
                      </div>
                    )}
                    {complaint.categoryDetails.subjectExam && (
                      <div>
                        <span className="text-slate-400">Subject / Exam:</span>
                        <p className="font-semibold text-slate-800">{complaint.categoryDetails.subjectExam}</p>
                      </div>
                    )}
                    {complaint.categoryDetails.examRollOrRefNumber && (
                      <div>
                        <span className="text-slate-400">Roll / Receipt Ref:</span>
                        <p className="font-mono font-semibold text-slate-800">{complaint.categoryDetails.examRollOrRefNumber}</p>
                      </div>
                    )}

                    {/* Electricity */}
                    {complaint.categoryDetails.utilityType && (
                      <div>
                        <span className="text-slate-400">Utility Type:</span>
                        <p className="font-semibold text-slate-800">{complaint.categoryDetails.utilityType}</p>
                      </div>
                    )}
                    {complaint.categoryDetails.consumerNumber && (
                      <div>
                        <span className="text-slate-400">Consumer Account:</span>
                        <p className="font-mono font-semibold text-slate-800">{complaint.categoryDetails.consumerNumber}</p>
                      </div>
                    )}

                    {/* Government */}
                    {complaint.categoryDetails.department && (
                      <div>
                        <span className="text-slate-400">Department:</span>
                        <p className="font-semibold text-slate-800">{complaint.categoryDetails.department}</p>
                      </div>
                    )}
                    {complaint.categoryDetails.serviceReferenceNumber && (
                      <div>
                        <span className="text-slate-400">Service Token:</span>
                        <p className="font-mono font-semibold text-slate-800">{complaint.categoryDetails.serviceReferenceNumber}</p>
                      </div>
                    )}

                    {/* Municipal */}
                    {complaint.categoryDetails.municipalIssueType && (
                      <div>
                        <span className="text-slate-400">Municipal Problem:</span>
                        <p className="font-semibold text-slate-800">{complaint.categoryDetails.municipalIssueType}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location info */}
              {complaint.location?.locationProvided && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Location & Spatial Reference
                  </h3>
                  <div className="p-4 bg-slate-50 border rounded-2xl text-xs space-y-1">
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <span className="font-semibold">{complaint.location.addressText || 'Area Pin Provided'}</span>
                      {complaint.location.city && <span className="text-slate-500">({complaint.location.city})</span>}
                    </div>
                    {complaint.location.coordinates?.latitude && (
                      <p className="text-[11px] text-slate-500 font-mono">
                        GPS Coordinates: {complaint.location.coordinates.latitude}, {complaint.location.coordinates.longitude}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Milestone Timeline */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Transparent Milestone Timeline
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Audit log entries: {complaint.statusHistory?.length || 0}
                  </span>
                </div>
                <TimelineView history={complaint.statusHistory} showInternal={false} />
              </div>

              {/* Action Form when Awaiting Information */}
              {complaint.status === 'Awaiting Information' && (
                <div className="p-6 bg-purple-50/70 border border-purple-200 rounded-3xl space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Action Required: Clarification Requested</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        The investigating department is waiting for additional information to proceed with your complaint. Submit your response below.
                      </p>
                    </div>
                  </div>

                  {infoSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{infoSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleProvideInfo} className="space-y-3">
                    <textarea
                      required
                      rows={3}
                      placeholder="Type your response or clarifications here..."
                      value={additionalInfoText}
                      onChange={(e) => setAdditionalInfoText(e.target.value)}
                      className="w-full text-xs p-3.5 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-400/20 bg-white"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={submittingInfo}
                        className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{submittingInfo ? 'Sending...' : 'Submit Clarification'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
