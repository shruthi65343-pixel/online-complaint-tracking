import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  Eye,
  X,
  MessageSquare,
  Lock,
  Calendar,
  User,
  MapPin,
  Building2,
  FileText,
  Send,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import TimelineView from '../components/TimelineView';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { STATUS_LIST, PRIORITY_LIST, COMPLAINT_CATEGORIES } from '../utils/categories';

export default function AdminDashboardPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sensitiveOnly, setSensitiveOnly] = useState(false);

  // Status & Priority Update Form State
  const [updateState, setUpdateState] = useState({
    status: '',
    priority: '',
    publicRemarks: '',
    internalNotes: '',
    assignedOfficer: ''
  });
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Protect route
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/admin-login');
    }
  }, [user, isAdmin, authLoading, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/complaints', {
          params: {
            status: statusFilter !== 'All' ? statusFilter : undefined,
            category: categoryFilter !== 'All' ? categoryFilter : undefined,
            priority: priorityFilter !== 'All' ? priorityFilter : undefined,
            search: search.trim() || undefined,
            sensitiveOnly: sensitiveOnly ? 'true' : undefined
          }
        })
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.stats);
      }
      if (listRes.data?.success) {
        setComplaints(listRes.data.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [statusFilter, categoryFilter, priorityFilter, sensitiveOnly, isAdmin]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  // Open detail view
  const openDetail = async (complaintId) => {
    setDetailLoading(true);
    setActionSuccess('');
    try {
      const res = await api.get(`/admin/complaints/${complaintId}`);
      if (res.data?.success) {
        const item = res.data.complaint;
        setSelectedComplaint(item);
        setUpdateState({
          status: item.status,
          priority: item.priority,
          publicRemarks: item.publicRemarks || '',
          internalNotes: item.internalNotes || '',
          assignedOfficer: item.assignedOfficer || ''
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch details.');
    } finally {
      setDetailLoading(false);
    }
  };

  // Submit Status / Priority updates
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdating(true);
    setActionSuccess('');
    try {
      // 1. Status update if changed or remarks added
      const resStatus = await api.patch(`/admin/complaints/${selectedComplaint._id}/status`, {
        status: updateState.status,
        remarks: updateState.publicRemarks,
        internalNotes: updateState.internalNotes,
        assignedOfficer: updateState.assignedOfficer
      });

      // 2. Priority update if changed
      if (updateState.priority !== selectedComplaint.priority) {
        await api.patch(`/admin/complaints/${selectedComplaint._id}/priority`, {
          priority: updateState.priority
        });
      }

      if (resStatus.data?.success) {
        setActionSuccess('Grievance updated and audit log recorded.');
        // Refresh detail
        await openDetail(selectedComplaint._id);
        // Refresh listing
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving update.');
    } finally {
      setUpdating(false);
    }
  };

  // Helper for complaint aging badge
  const getAgingBadge = (createdAt, status) => {
    if (status === 'Resolved' || status === 'Closed') {
      return (
        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Resolved
        </span>
      );
    }

    const diffDays = Math.floor((Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24));

    if (diffDays >= 7) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-full">
          <Flame className="w-3 h-3 text-rose-600" />
          <span>Aged {diffDays}d (Urgent SLA)</span>
        </span>
      );
    } else if (diffDays >= 3) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Aged {diffDays}d</span>
        </span>
      );
    } else {
      return (
        <span className="text-[11px] text-slate-500 font-mono">
          {diffDays === 0 ? 'Today' : `${diffDays}d ago`}
        </span>
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Officer Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-300 px-3 py-0.5 rounded-full">
              Central Grievance Commission
            </span>
            <span className="text-xs text-slate-400 font-mono">Terminal Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1.5">
            Officer Redressal Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Officer: <strong className="text-slate-800">{user?.name}</strong> • Department: {user?.department || 'Intake Bureau'}
          </p>
        </div>

        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* SLA Aging Alert Notice */}
      {stats?.aged && (stats.aged.over7Days > 0 || stats.aged.over3Days > 0) && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">SLA Complaint Aging Monitor: </span>
              <span>
                {stats.aged.over7Days} grievances open &gt;7 days (Critical), {stats.aged.over3Days} open &gt;3 days (Attention needed).
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-amber-800 shrink-0">Automated SLA Escalation Engine Active</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
            <p className="text-2xl font-extrabold text-navy-950 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Submitted</span>
            <p className="text-2xl font-extrabold text-blue-700 mt-1">{stats.statusCounts?.submitted || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Under Review</span>
            <p className="text-2xl font-extrabold text-indigo-700 mt-1">{stats.statusCounts?.underReview || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">In Progress</span>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">{stats.statusCounts?.inProgress || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">Awaiting Info</span>
            <p className="text-2xl font-extrabold text-purple-700 mt-1">{stats.statusCounts?.awaitingInfo || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Resolved</span>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{stats.statusCounts?.resolved || 0}</p>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search reference, citizen name, institution, or address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
            >
              <option value="All">All Statuses</option>
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
            >
              <option value="All">All Categories</option>
              {COMPLAINT_CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white"
            >
              <option value="All">All Priorities</option>
              {PRIORITY_LIST.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setSensitiveOnly(!sensitiveOnly)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                sensitiveOnly
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Confidential Only</span>
            </button>
          </div>
        </form>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Tracking Ref</th>
                <th className="px-5 py-3.5">Complainant</th>
                <th className="px-5 py-3.5">Category & Subject</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Aging SLA</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto text-teal-600 mb-2" />
                    <span>Loading complaints...</span>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No complaints match current filters.
                  </td>
                </tr>
              ) : (
                complaints.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        {item.isSensitive && <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                        <span>{item.trackingId}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{item.fullName}</p>
                      <span className="text-[11px] text-slate-400">{item.email}</span>
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {item.category}
                      </span>
                      <p className="font-semibold text-slate-800 truncate mt-1">{item.title}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={item.priority} size="sm" />
                    </td>
                    <td className="px-5 py-4">
                      {getAgingBadge(item.createdAt, item.status)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openDetail(item._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg font-bold text-xs transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm bg-slate-100 px-2.5 py-1 rounded border">
                    {selectedComplaint.trackingId}
                  </span>
                  {selectedComplaint.isSensitive && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" /> Confidential Report
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{selectedComplaint.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Complainant & Category Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border text-xs">
              <div>
                <span className="text-slate-400">Complainant:</span>
                <p className="font-semibold text-slate-900">{selectedComplaint.fullName}</p>
                <p className="text-slate-500">{selectedComplaint.email}</p>
                {selectedComplaint.phone && <p className="text-slate-500 font-mono">{selectedComplaint.phone}</p>}
              </div>
              <div>
                <span className="text-slate-400">Category:</span>
                <p className="font-semibold text-slate-900">{selectedComplaint.category}</p>
              </div>
              <div>
                <span className="text-slate-400">Lodged Date:</span>
                <p className="text-slate-700 font-mono">{new Date(selectedComplaint.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-400">Verification PIN:</span>
                <p className="text-teal-800 font-mono font-bold">{selectedComplaint.verificationCode}</p>
              </div>
            </div>

            {/* Full Narrative */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Full Narrative
              </h3>
              <div className="p-4 bg-slate-50 border rounded-2xl text-xs text-slate-800 leading-relaxed">
                {selectedComplaint.description}
              </div>
            </div>

            {/* Category attributes */}
            {selectedComplaint.categoryDetails && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Category Attributes
                </h3>
                <div className="p-4 bg-slate-50 border rounded-2xl text-xs grid grid-cols-2 gap-3">
                  {Object.entries(selectedComplaint.categoryDetails).map(([key, val]) => {
                    if (!val && val !== false) return null;
                    return (
                      <div key={key}>
                        <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <p className="font-semibold text-slate-800">{val.toString()}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Location */}
            {selectedComplaint.location?.locationProvided && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Location Intelligence
                </h3>
                <div className="p-4 bg-slate-50 border rounded-2xl text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span className="font-semibold text-slate-800">
                      {selectedComplaint.location.addressText || 'GPS Recorded'}
                    </span>
                  </div>
                  {selectedComplaint.location.coordinates?.latitude && (
                    <p className="font-mono text-slate-600">
                      Lat: {selectedComplaint.location.coordinates.latitude}, Lng: {selectedComplaint.location.coordinates.longitude}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Context: {selectedComplaint.location.locationContext}
                  </p>
                </div>
              </div>
            )}

            {/* Triage / Update Form */}
            <form onSubmit={handleUpdate} className="p-5 bg-teal-50/50 border border-teal-200 rounded-3xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Officer Action & Status Transition
              </h3>

              {actionSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={updateState.status}
                    onChange={(e) => setUpdateState({ ...updateState, status: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    {STATUS_LIST.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={updateState.priority}
                    onChange={(e) => setUpdateState({ ...updateState, priority: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white"
                  >
                    {PRIORITY_LIST.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Division / Officer</label>
                  <input
                    type="text"
                    value={updateState.assignedOfficer}
                    onChange={(e) => setUpdateState({ ...updateState, assignedOfficer: e.target.value })}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Public Remarks (Visible to Citizen / Student on Tracking Timeline)
                </label>
                <textarea
                  rows={2}
                  placeholder="Official notice visible to the public or complainant..."
                  value={updateState.publicRemarks}
                  onChange={(e) => setUpdateState({ ...updateState, publicRemarks: e.target.value })}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-900 mb-1">
                  Private Internal Notes (Strictly Confidential - Hidden from Citizen)
                </label>
                <textarea
                  rows={2}
                  placeholder="Internal audit observations, liability analysis, officer directives..."
                  value={updateState.internalNotes}
                  onChange={(e) => setUpdateState({ ...updateState, internalNotes: e.target.value })}
                  className="w-full text-xs p-2.5 border border-amber-300 rounded-xl bg-amber-50/40"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{updating ? 'Committing...' : 'Commit Updates'}</span>
                </button>
              </div>
            </form>

            {/* Audit Timeline */}
            <div className="pt-4 border-t">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                Full Audit History (With Internal Remarks)
              </h3>
              <TimelineView history={selectedComplaint.statusHistory} showInternal={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
